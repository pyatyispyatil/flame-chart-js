import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
import { CursorTypes, HitRegion, RegionTypes, Timeseries, TimeseriesChart, TooltipField } from '../types';
import UIPlugin from './ui-plugin';
import { last, mergeObjects } from '../utils';
import { chartPointsBinarySearch, ChartStyle, renderChart } from './utils/chart-render';

export type TimeseriesPluginStyles = {
    height: number;
};

export const defaultTimeseriesPluginStyles: TimeseriesPluginStyles = {
    height: 56,
};

export type TimeseriesPluginSettings = {
    styles?: Partial<TimeseriesPluginStyles>;
};

type TimeseriesPreparedChart = TimeseriesChart & {
    group: string;
    style: ChartStyle;
};

type PreparedTimeseries = TimeseriesPreparedChart[];

const EXTRA_POINTS_FOR_RENDER = 2;

export class TimeseriesPlugin extends UIPlugin<TimeseriesPluginStyles> {
    height = 56;

    private data: PreparedTimeseries;
    private hoveredRegion: HitRegion<{}> | null = null;
    private summary: Record<string, { min: number; max: number; start: number; end: number }> = {};
    private timeboxes: { start: number; end: number }[] = [];

    constructor({
        name = 'timeseriesPlugin',
        data,
        settings,
    }: {
        name?: string;
        data: Timeseries;
        settings?: TimeseriesPluginSettings;
    }) {
        super(name);

        this.setSettings(settings);
        this.setData(data);
    }

    override init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine) {
        super.init(renderEngine, interactionsEngine);

        this.interactionsEngine.on('change-position', this.handlePositionChange.bind(this));
        this.interactionsEngine.on('hover', this.handleHover.bind(this));

        this.interactionsEngine.on('up', this.handleMouseUp.bind(this));
    }

    handlePositionChange(position: { deltaX: number }) {
        const startPositionX = this.renderEngine.parent.positionX;

        this.interactionsEngine.setCursor(CursorTypes.GRABBING);

        this.renderEngine.tryToChangePosition(position.deltaX);

        if (startPositionX !== this.renderEngine.parent.positionX) {
            this.renderEngine.parent.render();
        }
    }

    handleMouseUp() {
        this.interactionsEngine.clearCursor();
    }

    override setSettings({ styles }: TimeseriesPluginSettings = { styles: this.styles }) {
        this.styles = mergeObjects(defaultTimeseriesPluginStyles, styles);
        this.height = this.styles.height;
    }

    setData(data: Timeseries) {
        this.data = data.map((chart) => ({
            group: chart.units && !chart.group ? chart.units : 'default',
            ...chart,
            style: {
                lineWidth: 1,
                fillColor: 'rgba(0, 0, 0, 0.15)',
                lineColor: 'rgba(0, 0, 0, 0.20)',
                lineDash: [],
                type: 'smooth',
                ...(chart.style ?? {}),
            },
        }));

        this.summary = this.data.reduce((acc, { points, group, min, max }, index) => {
            if (!acc[group]) {
                acc[group] = {
                    min: min ?? points[0][1],
                    max: max ?? points[0][1],
                };
            }

            this.timeboxes[index] = {
                start: points[0][0],
                end: last(points)[0],
            };

            points.forEach(([time, value]) => {
                if (min === undefined) {
                    acc[group].min = Math.min(acc[group].min, value);
                }

                if (max === undefined) {
                    acc[group].max = Math.max(acc[group].max, value);
                }

                this.timeboxes[index].start = Math.min(this.timeboxes[index].start, time);
                this.timeboxes[index].end = Math.max(this.timeboxes[index].end, time);
            });

            return acc;
        }, {});

        this.min = Math.min(...this.timeboxes.map(({ start }) => start));
        this.max = Math.max(...this.timeboxes.map(({ end }) => end));

        if (this.renderEngine) {
            this.renderEngine.recalcMinMax();
            this.renderEngine.resetParentView();
        }
    }

    handleHover(region: HitRegion<number> | null) {
        this.hoveredRegion = region;
    }

    override renderTooltip() {
        if (this.hoveredRegion) {
            const currentX =
                this.renderEngine.pixelToTime(this.interactionsEngine.getMouse().x) + this.renderEngine.positionX;
            const targetPoints: Record<string, string[]> = this.data.reduce((acc, { points, units, name, group }) => {
                const point = chartPointsBinarySearch(points, currentX);

                let result = '';

                if (point) {
                    if (name) {
                        result += name + ': ';
                    }

                    result += point[1].toFixed(2);

                    if (units) {
                        result += units;
                    }
                }

                if (!acc[group]) {
                    acc[group] = [];
                }

                acc[group].push(result);

                return acc;
            }, {});

            const time = `${currentX.toFixed(this.renderEngine.getAccuracy() + 2)} ${this.renderEngine.timeUnits}`;
            const values = Object.entries(targetPoints).reduce((acc: TooltipField[], [group, values]) => {
                acc.push({
                    text: group,
                    color: 'black',
                });

                values.forEach((value) => {
                    acc.push({
                        text: value,
                    });
                });

                return acc;
            }, []);

            this.renderEngine.renderTooltipFromData(
                [
                    {
                        text: time,
                    },
                    ...values,
                ],
                this.interactionsEngine.getGlobalMouse()
            );

            return true;
        }

        return false;
    }

    override render() {
        if (this.data?.length === 0 || !this.summary) {
            return;
        }

        const timestampStart = this.renderEngine.positionX;
        const timestampEnd = this.renderEngine.positionX + this.renderEngine.getRealView();

        this.data.forEach(({ points, group, style, dynamicMinMax, min, max }, index) => {
            if (this.timeboxes[index].end < timestampStart || this.timeboxes[index].start > timestampEnd) {
                return;
            }

            const leftIndex =
                timestampStart <= this.timeboxes[index].start
                    ? 0
                    : Math.max(
                          points.findIndex(([timestamp]) => timestamp >= timestampStart) - EXTRA_POINTS_FOR_RENDER,
                          0
                      );
            const rightIndex =
                timestampEnd >= this.timeboxes[index].end
                    ? points.length
                    : points.findIndex(([timestamp]) => timestamp >= timestampEnd) + EXTRA_POINTS_FOR_RENDER;

            const visiblePoints = points.slice(leftIndex, rightIndex);

            const minmax = dynamicMinMax
                ? visiblePoints.reduce(
                      (acc, [, value]) => {
                          acc.min = Math.min(acc.min, value);
                          acc.max = Math.max(acc.max, value);

                          return acc;
                      },
                      { min: min ?? Infinity, max: max ?? -Infinity }
                  )
                : this.summary[group];

            renderChart({
                engine: this.renderEngine,
                points: visiblePoints,
                min: minmax.min,
                max: minmax.max,
                style,
            });
        });

        this.interactionsEngine.addHitRegion(RegionTypes.TIMESERIES, null, 0, 0, this.renderEngine.width, this.height);
    }
}
