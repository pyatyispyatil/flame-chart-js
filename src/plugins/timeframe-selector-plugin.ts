import {
    clusterizeFlatTree,
    flatTree,
    getFlatTreeMinMax,
    metaClusterizeFlatTree,
    reclusterizeClusteredFlatTree,
} from './utils/tree-clusters';
import { mergeObjects } from '../utils';
import { TimeGrid } from '../engines/time-grid';
import {
    ClusterizedFlatTree,
    CursorTypes,
    FlameChartNodes,
    HitRegion,
    MetaClusterizedFlatTree,
    Mouse,
    RegionTypes,
    Timeseries,
    Waterfall,
} from '../types';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
import UIPlugin from './ui-plugin';
import { parseWaterfall, PreparedWaterfallInterval } from './utils/waterfall-parser';
import Color from 'color';
import {
    ChartLineType,
    ChartPoints,
    getMinMax,
    prepareTmeseries,
    renderChart,
    renderChartTooltipFields,
} from './utils/chart-render';
import { PreparedTimeseries } from './timeseries-plugin';

const TIMEFRAME_STICK_DISTANCE = 2;

type Dot = {
    time: number;
    type: 'start' | 'end';
};

export type TimeframeSelectorPluginStyles = {
    font: string;
    fontColor: string;
    overlayColor: string;
    graphStrokeColor: string;
    graphFillColor: string;
    flameChartGraphType: ChartLineType;
    waterfallStrokeOpacity: number;
    waterfallFillOpacity: number;
    waterfallGraphType: ChartLineType;
    bottomLineColor: string;
    knobColor: string;
    knobStrokeColor: string;
    knobSize: number;
    height: number;
    backgroundColor: string;
};

export type TimeframeSelectorPluginSettings = {
    styles?: Partial<TimeframeSelectorPluginStyles>;
};

export const defaultTimeframeSelectorPluginStyles: TimeframeSelectorPluginStyles = {
    font: '9px sans-serif',
    fontColor: 'black',
    overlayColor: 'rgba(112, 112, 112, 0.5)',
    graphStrokeColor: 'rgba(0, 0, 0, 0.10)',
    graphFillColor: 'rgba(0, 0, 0, 0.15)',
    flameChartGraphType: 'smooth',
    waterfallStrokeOpacity: 0.4,
    waterfallFillOpacity: 0.35,
    waterfallGraphType: 'smooth',
    bottomLineColor: 'rgba(0, 0, 0, 0.25)',
    knobColor: 'rgb(131, 131, 131)',
    knobStrokeColor: 'white',
    knobSize: 6,
    height: 60,
    backgroundColor: 'white',
};

export class TimeframeSelectorPlugin extends UIPlugin<TimeframeSelectorPluginStyles> {
    override styles: TimeframeSelectorPluginStyles = defaultTimeframeSelectorPluginStyles;
    height = 0;

    private flameChartNodes?: FlameChartNodes;
    private waterfall?: Waterfall;
    private timeseries?: Timeseries;
    private preparedTimeseries?: PreparedTimeseries;
    private shouldRender: boolean;
    private leftKnobMoving = false;
    private rightKnobMoving = false;
    private selectingActive = false;
    private startSelectingPosition = 0;
    private timeout: number | undefined;
    private offscreenRenderEngine: OffscreenRenderEngine;
    private timeGrid: TimeGrid;
    private actualClusters: ClusterizedFlatTree = [];
    private clusters: MetaClusterizedFlatTree = [];
    private flameChartMaxLevel = 0;
    private flameChartDots: ChartPoints = [];
    private waterfallDots: { color: string; dots: ChartPoints }[] = [];
    private waterfallMaxLevel = 0;
    private actualClusterizedFlatTree: ClusterizedFlatTree = [];
    private hoveredRegion: HitRegion<{}> | null = null;

    constructor({
        waterfall,
        flameChartNodes,
        timeseries,
        settings,
        name = 'timeframeSelectorPlugin',
    }: {
        flameChartNodes?: FlameChartNodes;
        waterfall?: Waterfall;
        timeseries?: Timeseries;
        settings: TimeframeSelectorPluginSettings;
        name?: string;
    }) {
        super(name);
        this.flameChartNodes = flameChartNodes;
        this.waterfall = waterfall;
        this.timeseries = timeseries;
        this.shouldRender = true;
        this.setSettings(settings);
    }

    override init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine) {
        super.init(renderEngine, interactionsEngine);

        this.interactionsEngine.on('down', this.handleMouseDown.bind(this));
        this.interactionsEngine.on('up', this.handleMouseUp.bind(this));
        this.interactionsEngine.on('move', this.handleMouseMove.bind(this));
        this.interactionsEngine.on('hover', this.handleHover.bind(this));

        this.setSettings();
    }

    handleHover(region: HitRegion<number> | null) {
        this.hoveredRegion = region;
    }

    handleMouseDown(region: HitRegion<'right' | 'left'>, mouse: Mouse) {
        if (region) {
            if (region.type === RegionTypes.TIMEFRAME_KNOB) {
                if (region.data === 'left') {
                    this.leftKnobMoving = true;
                } else {
                    this.rightKnobMoving = true;
                }

                this.interactionsEngine.setCursor('ew-resize');
            } else if (region.type === RegionTypes.TIMEFRAME_AREA) {
                this.selectingActive = true;
                this.startSelectingPosition = mouse.x;
            }
        }
    }

    handleMouseUp(_: HitRegion, mouse: Mouse, isClick: boolean) {
        let isDoubleClick = false;

        if (this.timeout) {
            isDoubleClick = true;
        }

        clearTimeout(this.timeout);
        this.timeout = window.setTimeout(() => (this.timeout = void 0), 300);
        this.leftKnobMoving = false;
        this.rightKnobMoving = false;
        this.interactionsEngine.clearCursor();

        if (this.selectingActive && !isClick) {
            this.applyChanges();
        }

        this.selectingActive = false;

        if (isClick && !isDoubleClick) {
            const rightKnobPosition = this.getRightKnobPosition();
            const leftKnobPosition = this.getLeftKnobPosition();

            if (mouse.x > rightKnobPosition) {
                this.setRightKnobPosition(mouse.x);
            } else if (mouse.x > leftKnobPosition && mouse.x < rightKnobPosition) {
                if (mouse.x - leftKnobPosition > rightKnobPosition - mouse.x) {
                    this.setRightKnobPosition(mouse.x);
                } else {
                    this.setLeftKnobPosition(mouse.x);
                }
            } else {
                this.setLeftKnobPosition(mouse.x);
            }

            this.applyChanges();
        }

        if (isDoubleClick) {
            this.renderEngine.parent.setZoom(this.renderEngine.getInitialZoom());
            this.renderEngine.parent.setPositionX(this.renderEngine.min);
            this.renderEngine.parent.render();
        }
    }

    handleMouseMove(_: HitRegion, mouse: Mouse) {
        if (this.leftKnobMoving) {
            this.setLeftKnobPosition(mouse.x);
            this.applyChanges();
        }

        if (this.rightKnobMoving) {
            this.setRightKnobPosition(mouse.x);
            this.applyChanges();
        }

        if (this.selectingActive) {
            if (this.startSelectingPosition >= mouse.x) {
                this.setLeftKnobPosition(mouse.x);
                this.setRightKnobPosition(this.startSelectingPosition);
            } else {
                this.setRightKnobPosition(mouse.x);
                this.setLeftKnobPosition(this.startSelectingPosition);
            }

            this.renderEngine.render();
        }
    }

    override postInit() {
        this.offscreenRenderEngine = this.renderEngine.makeChild();
        this.offscreenRenderEngine.setSettingsOverrides({ styles: this.styles });

        this.timeGrid = new TimeGrid({ styles: this.renderEngine.parent.timeGrid.styles });
        this.timeGrid.setDefaultRenderEngine(this.offscreenRenderEngine);

        this.offscreenRenderEngine.on('resize', () => {
            this.offscreenRenderEngine.setZoom(this.renderEngine.getInitialZoom());
            this.offscreenRender();
        });

        this.offscreenRenderEngine.on('min-max-change', () => (this.shouldRender = true));

        this.setData({
            flameChartNodes: this.flameChartNodes,
            waterfall: this.waterfall,
            timeseries: this.timeseries,
        });
    }

    setLeftKnobPosition(mouseX: number) {
        const maxPosition = this.getRightKnobPosition();

        if (mouseX < maxPosition - 1) {
            const realView = this.renderEngine.getRealView();
            const delta = this.renderEngine.setPositionX(
                this.offscreenRenderEngine.pixelToTime(mouseX) + this.renderEngine.min
            );
            const zoom = this.renderEngine.width / (realView - delta);

            this.renderEngine.setZoom(zoom);
        }
    }

    setRightKnobPosition(mouseX: number) {
        const minPosition = this.getLeftKnobPosition();

        if (mouseX > minPosition + 1) {
            const realView = this.renderEngine.getRealView();
            const delta =
                this.renderEngine.positionX +
                realView -
                (this.offscreenRenderEngine.pixelToTime(mouseX) + this.renderEngine.min);
            const zoom = this.renderEngine.width / (realView - delta);

            this.renderEngine.setZoom(zoom);
        }
    }

    getLeftKnobPosition() {
        return (this.renderEngine.positionX - this.renderEngine.min) * this.renderEngine.getInitialZoom();
    }

    getRightKnobPosition() {
        return (
            (this.renderEngine.positionX - this.renderEngine.min + this.renderEngine.getRealView()) *
            this.renderEngine.getInitialZoom()
        );
    }

    applyChanges() {
        this.renderEngine.parent.setPositionX(this.renderEngine.positionX);
        this.renderEngine.parent.setZoom(this.renderEngine.zoom);
        this.renderEngine.parent.render();
    }

    override setSettings({ styles }: TimeframeSelectorPluginSettings = { styles: this.styles }) {
        this.styles = mergeObjects(defaultTimeframeSelectorPluginStyles, styles);
        this.height = this.styles.height;

        if (this.offscreenRenderEngine) {
            this.offscreenRenderEngine.setSettingsOverrides({ styles: this.styles });
            this.timeGrid.setSettings({ styles: this.renderEngine.parent.timeGrid.styles });
        }

        this.shouldRender = true;
    }

    makeFlameChartDots() {
        if (this.flameChartNodes) {
            const flameChartDots: Dot[] = [];
            const tree = flatTree(this.flameChartNodes);
            const { min, max } = getFlatTreeMinMax(tree);

            this.min = min;
            this.max = max;

            this.clusters = metaClusterizeFlatTree(tree, () => true);
            this.actualClusters = clusterizeFlatTree(
                this.clusters,
                this.renderEngine.zoom,
                this.min,
                this.max,
                TIMEFRAME_STICK_DISTANCE,
                Infinity
            );
            this.actualClusterizedFlatTree = reclusterizeClusteredFlatTree(
                this.actualClusters,
                this.renderEngine.zoom,
                this.min,
                this.max,
                TIMEFRAME_STICK_DISTANCE,
                Infinity
            ).sort((a, b) => a.start - b.start);

            this.actualClusterizedFlatTree.forEach(({ start, end }) => {
                flameChartDots.push(
                    {
                        time: start,
                        type: 'start',
                    },
                    {
                        time: end,
                        type: 'end',
                    }
                );
            });

            flameChartDots.sort((a, b) => a.time - b.time);

            const { dots, maxLevel } = this.makeRenderDots(flameChartDots);

            this.flameChartDots = dots;
            this.flameChartMaxLevel = maxLevel;
        }
    }

    makeRenderDots(dots: Dot[]): { dots: ChartPoints; maxLevel: number } {
        const renderDots: ChartPoints = [];
        let level = 0;
        let maxLevel = 0;

        dots.forEach(({ type, time }) => {
            if (type === 'start' || type === 'end') {
                renderDots.push([time, level]);
            }

            if (type === 'start') {
                level++;
            } else {
                level--;
            }

            maxLevel = Math.max(maxLevel, level);

            renderDots.push([time, level]);
        });

        return {
            dots: renderDots,
            maxLevel,
        };
    }

    makeWaterfallDots() {
        if (this.waterfall) {
            const data = parseWaterfall(this.waterfall);

            const intervals = Object.entries(
                data.reduce((acc: Record<string, PreparedWaterfallInterval[]>, { intervals }) => {
                    intervals.forEach((interval) => {
                        if (!acc[interval.color]) {
                            acc[interval.color] = [];
                        }

                        acc[interval.color].push(interval);
                    });

                    return acc;
                }, {})
            );

            const points = intervals.map(([color, intervals]) => {
                const newPoints: { type: 'start' | 'end'; time: number }[] = [];

                intervals.forEach(({ start, end }) => {
                    newPoints.push({ type: 'start', time: start });
                    newPoints.push({ type: 'end', time: end });
                });

                newPoints.sort((a, b) => a.time - b.time);

                return {
                    color,
                    points: newPoints,
                };
            });

            let globalMaxLevel = 0;

            this.waterfallDots = points.map(({ color, points }) => {
                const { dots, maxLevel } = this.makeRenderDots(points);

                globalMaxLevel = Math.max(globalMaxLevel, maxLevel);

                return {
                    color,
                    dots,
                };
            });

            this.waterfallMaxLevel = globalMaxLevel;
        }
    }

    prepareTimeseries() {
        if (this.timeseries?.length) {
            this.preparedTimeseries = prepareTmeseries(this.timeseries);
        } else {
            this.preparedTimeseries = undefined;
        }
    }

    setData({
        flameChartNodes,
        waterfall,
        timeseries,
    }: {
        flameChartNodes?: FlameChartNodes;
        waterfall?: Waterfall;
        timeseries?: Timeseries;
    }) {
        this.flameChartNodes = flameChartNodes;
        this.waterfall = waterfall;
        this.timeseries = timeseries;

        this.makeFlameChartDots();
        this.makeWaterfallDots();
        this.prepareTimeseries();
        this.offscreenRender();
    }

    setTimeseries(timeseries: Timeseries) {
        this.timeseries = timeseries;

        this.prepareTimeseries();
        this.offscreenRender();
    }

    setFlameChartNodes(flameChartNodes: FlameChartNodes) {
        this.flameChartNodes = flameChartNodes;

        this.makeFlameChartDots();
        this.offscreenRender();
    }

    setWaterfall(waterfall: Waterfall) {
        this.waterfall = waterfall;

        this.makeWaterfallDots();
        this.offscreenRender();
    }

    offscreenRender() {
        const zoom = this.offscreenRenderEngine.getInitialZoom();

        this.offscreenRenderEngine.setZoom(zoom);
        this.offscreenRenderEngine.setPositionX(this.offscreenRenderEngine.min);
        this.offscreenRenderEngine.clear();

        this.timeGrid.recalc();
        this.timeGrid.renderLines(0, this.offscreenRenderEngine.height);
        this.timeGrid.renderTimes();

        renderChart({
            engine: this.offscreenRenderEngine,
            points: this.flameChartDots,
            min: 0,
            max: this.flameChartMaxLevel,
            style: {
                lineColor: this.styles.graphStrokeColor,
                fillColor: this.styles.graphFillColor,
                type: this.styles.flameChartGraphType,
            },
        });

        this.waterfallDots.forEach(({ color, dots }) => {
            const colorObj = new Color(color);

            renderChart({
                engine: this.offscreenRenderEngine,
                points: dots,
                min: 0,
                max: this.waterfallMaxLevel,
                style: {
                    lineColor: colorObj.alpha(this.styles.waterfallStrokeOpacity).rgb().toString(),
                    fillColor: colorObj.alpha(this.styles.waterfallFillOpacity).rgb().toString(),
                    type: this.styles.waterfallGraphType,
                },
            });
        });

        if (this.preparedTimeseries) {
            const { summary, timeseries } = this.preparedTimeseries;

            timeseries.forEach((chart) => {
                const minmax = getMinMax(chart.points, chart, summary);

                renderChart({
                    engine: this.offscreenRenderEngine,
                    points: chart.points,
                    min: minmax.min,
                    max: minmax.max,
                    style: chart.style,
                });
            });
        }

        this.offscreenRenderEngine.setCtxValue('fillStyle', this.styles.bottomLineColor);
        this.offscreenRenderEngine.ctx.fillRect(0, this.height - 1, this.offscreenRenderEngine.width, 1);
    }

    renderTimeframe() {
        const relativePositionX = this.renderEngine.positionX - this.renderEngine.min;

        const currentLeftPosition = relativePositionX * this.renderEngine.getInitialZoom();
        const currentRightPosition =
            (relativePositionX + this.renderEngine.getRealView()) * this.renderEngine.getInitialZoom();
        const currentLeftKnobPosition = currentLeftPosition - this.styles.knobSize / 2;
        const currentRightKnobPosition = currentRightPosition - this.styles.knobSize / 2;
        const knobHeight = this.renderEngine.height / 3;

        this.renderEngine.setCtxValue('fillStyle', this.styles.overlayColor);
        this.renderEngine.fillRect(0, 0, currentLeftPosition, this.renderEngine.height);
        this.renderEngine.fillRect(
            currentRightPosition,
            0,
            this.renderEngine.width - currentRightPosition,
            this.renderEngine.height
        );

        this.renderEngine.setCtxValue('fillStyle', this.styles.overlayColor);
        this.renderEngine.fillRect(currentLeftPosition - 1, 0, 1, this.renderEngine.height);
        this.renderEngine.fillRect(currentRightPosition + 1, 0, 1, this.renderEngine.height);

        this.renderEngine.setCtxValue('fillStyle', this.styles.knobColor);
        this.renderEngine.fillRect(currentLeftKnobPosition, 0, this.styles.knobSize, knobHeight);
        this.renderEngine.fillRect(currentRightKnobPosition, 0, this.styles.knobSize, knobHeight);

        this.renderEngine.renderStroke(
            this.styles.knobStrokeColor,
            currentLeftKnobPosition,
            0,
            this.styles.knobSize,
            knobHeight
        );
        this.renderEngine.renderStroke(
            this.styles.knobStrokeColor,
            currentRightKnobPosition,
            0,
            this.styles.knobSize,
            knobHeight
        );

        this.interactionsEngine.addHitRegion(
            RegionTypes.TIMEFRAME_KNOB,
            'left',
            currentLeftKnobPosition,
            0,
            this.styles.knobSize,
            knobHeight,
            CursorTypes.EW_RESIZE
        );
        this.interactionsEngine.addHitRegion(
            RegionTypes.TIMEFRAME_KNOB,
            'right',
            currentRightKnobPosition,
            0,
            this.styles.knobSize,
            knobHeight,
            CursorTypes.EW_RESIZE
        );
        this.interactionsEngine.addHitRegion(
            RegionTypes.TIMEFRAME_AREA,
            null,
            0,
            0,
            this.renderEngine.width,
            this.renderEngine.height,
            CursorTypes.TEXT
        );
    }

    override renderTooltip(): boolean {
        if (this.hoveredRegion) {
            const mouseX = this.interactionsEngine.getMouse().x;
            const currentTimestamp = this.renderEngine.pixelToTime(mouseX) + this.renderEngine.positionX;

            const time = `${currentTimestamp.toFixed(this.renderEngine.getAccuracy() + 2)} ${
                this.renderEngine.timeUnits
            }`;

            const timeseriesFields = this.preparedTimeseries
                ? renderChartTooltipFields(this.renderEngine, mouseX, this.preparedTimeseries)
                : [];

            this.renderEngine.renderTooltipFromData(
                [
                    {
                        text: time,
                    },
                    ...timeseriesFields,
                ],
                this.interactionsEngine.getGlobalMouse()
            );

            return true;
        }

        return false;
    }

    override render() {
        if (this.shouldRender) {
            this.shouldRender = false;
            this.offscreenRender();
        }

        this.renderEngine.copy(this.offscreenRenderEngine);
        this.renderTimeframe();

        this.interactionsEngine.addHitRegion(RegionTypes.TIMEFRAME, null, 0, 0, this.renderEngine.width, this.height);

        return true;
    }
}
