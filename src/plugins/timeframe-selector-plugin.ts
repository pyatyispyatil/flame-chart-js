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
    Waterfall,
} from '../types';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
import UIPlugin from './ui-plugin';
import { parseWaterfall, PreparedWaterfallInterval } from './utils/waterfall-parser';

type Dot = {
    pos: number;
    level: number;
};

type FlameChartDot = Dot & {
    sort: number;
    index: number;
    type: string;
};

type WaterfallDot = Dot;

export type TimeframeSelectorPluginStyles = {
    font: string;
    fontColor: string;
    overlayColor: string;
    graphStrokeColor: string;
    graphFillColor: string;
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
    graphStrokeColor: 'rgb(0, 0, 0, 0.2)',
    graphFillColor: 'rgb(0, 0, 0, 0.25)',
    bottomLineColor: 'rgb(0, 0, 0, 0.25)',
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
    private flameChartDots: FlameChartDot[] = [];
    private waterfallDots: { color: string; dots: WaterfallDot[] }[] = [];
    private waterfallMaxLevel = 0;
    private actualClusterizedFlatTree: ClusterizedFlatTree = [];

    constructor({
        waterfall,
        flameChartNodes,
        settings,
        name = 'timeframeSelectorPlugin',
    }: {
        flameChartNodes?: FlameChartNodes;
        waterfall?: Waterfall;
        settings: TimeframeSelectorPluginSettings;
        name?: string;
    }) {
        super(name);
        this.flameChartNodes = flameChartNodes;
        this.waterfall = waterfall;
        this.shouldRender = true;
        this.setSettings(settings);
    }

    override init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine) {
        super.init(renderEngine, interactionsEngine);

        this.interactionsEngine.on('down', this.handleMouseDown.bind(this));
        this.interactionsEngine.on('up', this.handleMouseUp.bind(this));
        this.interactionsEngine.on('move', this.handleMouseMove.bind(this));

        this.setSettings();
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
            const flameChartDots: FlameChartDot[] = [];
            const tree = flatTree(this.flameChartNodes);
            const { min, max } = getFlatTreeMinMax(tree);

            let maxLevel = 0;

            this.min = min;
            this.max = max;

            this.clusters = metaClusterizeFlatTree(tree, () => true);
            this.actualClusters = clusterizeFlatTree(
                this.clusters,
                this.renderEngine.zoom,
                this.min,
                this.max,
                2,
                Infinity
            );
            this.actualClusterizedFlatTree = reclusterizeClusteredFlatTree(
                this.actualClusters,
                this.renderEngine.zoom,
                this.min,
                this.max,
                2,
                Infinity
            ).sort((a, b) => a.start - b.start);

            this.actualClusterizedFlatTree.forEach(({ start, end, level }, index) => {
                if (maxLevel < level + 1) {
                    maxLevel = level + 1;
                }

                flameChartDots.push(
                    {
                        pos: start,
                        sort: 0,
                        level: level,
                        index,
                        type: 'start',
                    },
                    {
                        pos: start,
                        sort: 1,
                        level: level + 1,
                        index,
                        type: 'start',
                    },
                    {
                        pos: end,
                        sort: 2,
                        level: level + 1,
                        index,
                        type: 'end',
                    },
                    {
                        pos: end,
                        sort: 3,
                        level: level,
                        index,
                        type: 'end',
                    }
                );
            });

            this.flameChartDots = flameChartDots.sort((a, b) => {
                if (a.pos !== b.pos) {
                    return a.pos - b.pos;
                }

                if (a.index === b.index) {
                    return a.sort - b.sort;
                }

                if (a.type === 'start' && b.type === 'start') {
                    return a.level - b.level;
                } else if (a.type === 'end' && b.type === 'end') {
                    return b.level - a.level;
                }

                return 0;
            });

            this.flameChartMaxLevel = maxLevel;
        }
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
            }, {});

            let maxLevel = 0;

            this.waterfallDots = points.map(({ color, points }) => {
                const dots: WaterfallDot[] = [];
                let level = 0;

                points.forEach(({ type, time }) => {
                    if (type === 'start') {
                        dots.push({
                            pos: time,
                            level: level,
                        });
                    }

                    if (type === 'end') {
                        dots.push({
                            pos: time,
                            level: level,
                        });
                    }

                    if (type === 'start') {
                        level++;
                    } else {
                        level--;
                    }

                    maxLevel = Math.max(maxLevel, level);

                    dots.push({
                        pos: time,
                        level,
                    });
                });

                return {
                    color,
                    dots,
                };
            });

            this.waterfallMaxLevel = maxLevel;
        }
    }

    setData({ flameChartNodes, waterfall }: { flameChartNodes?: FlameChartNodes; waterfall?: Waterfall }) {
        this.flameChartNodes = flameChartNodes;
        this.waterfall = waterfall;

        this.makeFlameChartDots();
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

    renderChart(dots: Dot[], maxLevel: number, options: { strokeColor: string; fillColor: string }) {
        const zoom = this.offscreenRenderEngine.getInitialZoom();

        this.offscreenRenderEngine.setStrokeColor(options.strokeColor);
        this.offscreenRenderEngine.setCtxColor(options.fillColor);
        this.offscreenRenderEngine.ctx.beginPath();

        const flameChartLevelHeight = (this.height - this.renderEngine.charHeight - 4) / maxLevel;

        if (dots.length) {
            this.offscreenRenderEngine.ctx.moveTo(
                (dots[0].pos - this.offscreenRenderEngine.min) * zoom,
                this.castLevelToHeight(dots[0].level, flameChartLevelHeight)
            );

            dots.forEach((dot) => {
                const { pos, level } = dot;

                this.offscreenRenderEngine.ctx.lineTo(
                    (pos - this.offscreenRenderEngine.min) * zoom,
                    this.castLevelToHeight(level, flameChartLevelHeight)
                );
            });
        }

        this.offscreenRenderEngine.ctx.closePath();

        this.offscreenRenderEngine.ctx.stroke();
        this.offscreenRenderEngine.ctx.fill();
    }

    offscreenRender() {
        const zoom = this.offscreenRenderEngine.getInitialZoom();

        this.offscreenRenderEngine.setZoom(zoom);
        this.offscreenRenderEngine.setPositionX(this.offscreenRenderEngine.min);
        this.offscreenRenderEngine.clear();

        this.timeGrid.recalc();
        this.timeGrid.renderLines(0, this.offscreenRenderEngine.height);
        this.timeGrid.renderTimes();

        this.renderChart(this.flameChartDots, this.flameChartMaxLevel, {
            strokeColor: this.styles.graphStrokeColor,
            fillColor: this.styles.graphFillColor,
        });

        this.waterfallDots.forEach(({ color, dots }) => {
            this.renderChart(dots, this.waterfallMaxLevel, {
                strokeColor: color,
                fillColor: color,
            });
        });

        this.offscreenRenderEngine.setCtxColor(this.styles.bottomLineColor);
        this.offscreenRenderEngine.ctx.fillRect(0, this.height - 1, this.offscreenRenderEngine.width, 1);
    }

    castLevelToHeight(level: number, levelHeight: number) {
        return this.height - level * levelHeight;
    }

    renderTimeframe() {
        const relativePositionX = this.renderEngine.positionX - this.renderEngine.min;

        const currentLeftPosition = relativePositionX * this.renderEngine.getInitialZoom();
        const currentRightPosition =
            (relativePositionX + this.renderEngine.getRealView()) * this.renderEngine.getInitialZoom();
        const currentLeftKnobPosition = currentLeftPosition - this.styles.knobSize / 2;
        const currentRightKnobPosition = currentRightPosition - this.styles.knobSize / 2;
        const knobHeight = this.renderEngine.height / 3;

        this.renderEngine.setCtxColor(this.styles.overlayColor);
        this.renderEngine.fillRect(0, 0, currentLeftPosition, this.renderEngine.height);
        this.renderEngine.fillRect(
            currentRightPosition,
            0,
            this.renderEngine.width - currentRightPosition,
            this.renderEngine.height
        );

        this.renderEngine.setCtxColor(this.styles.overlayColor);
        this.renderEngine.fillRect(currentLeftPosition - 1, 0, 1, this.renderEngine.height);
        this.renderEngine.fillRect(currentRightPosition + 1, 0, 1, this.renderEngine.height);

        this.renderEngine.setCtxColor(this.styles.knobColor);
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

    override render() {
        if (this.shouldRender) {
            this.shouldRender = false;
            this.offscreenRender();
        }

        this.renderEngine.copy(this.offscreenRenderEngine);
        this.renderTimeframe();

        return true;
    }
}
