import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
import { CursorTypes, HitRegion, RegionTypes, Timeseries, TimeseriesChart } from '../types';
import UIPlugin from './ui-plugin';
import { mergeObjects } from '../utils';
import { ChartStyle, getMinMax, prepareTmeseries, renderChart, renderChartTooltipFields } from './utils/chart-render';

export type TimeseriesPluginStyles = {
    height: number;
};

export const defaultTimeseriesPluginStyles: TimeseriesPluginStyles = {
    height: 56,
};

export type TimeseriesPluginSettings = {
    styles?: Partial<TimeseriesPluginStyles>;
};

export type TimeseriesPreparedChart = TimeseriesChart & {
    group: string;
    style: ChartStyle;
};

export type PreparedTimeseries = {
    summary: Record<string, { min: number; max: number }>;
    total: { min: number; max: number };
    timeseries: TimeseriesPreparedChart[];
    timeboxes: { start: number; end: number }[];
};

const EXTRA_POINTS_FOR_RENDER = 2;

export class TimeseriesPlugin extends UIPlugin<TimeseriesPluginStyles> {
    height = 56;

    private data: PreparedTimeseries;
    private hoveredRegion: HitRegion<{}> | null = null;

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
        const preparedTmeseries = prepareTmeseries(data);

        this.data = preparedTmeseries;

        this.min = preparedTmeseries.total.min;
        this.max = preparedTmeseries.total.max;

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
            const mouseX = this.interactionsEngine.getMouse().x;
            const currentTimestamp = this.renderEngine.pixelToTime(mouseX) + this.renderEngine.positionX;

            const time = `${currentTimestamp.toFixed(this.renderEngine.getAccuracy() + 2)} ${
                this.renderEngine.timeUnits
            }`;

            const values = renderChartTooltipFields(currentTimestamp, this.data);

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
        if (this.data.timeseries.length === 0) {
            return;
        }

        const timestampStart = this.renderEngine.positionX;
        const timestampEnd = this.renderEngine.positionX + this.renderEngine.getRealView();

        this.data.timeseries.forEach((chart, index) => {
            if (this.data.timeboxes[index].end < timestampStart || this.data.timeboxes[index].start > timestampEnd) {
                return;
            }

            const leftIndex =
                timestampStart <= this.data.timeboxes[index].start
                    ? 0
                    : Math.max(
                          chart.points.findIndex(([timestamp]) => timestamp >= timestampStart) -
                              EXTRA_POINTS_FOR_RENDER,
                          0
                      );
            const rightIndex =
                timestampEnd >= this.data.timeboxes[index].end
                    ? chart.points.length
                    : chart.points.findIndex(([timestamp]) => timestamp >= timestampEnd) + EXTRA_POINTS_FOR_RENDER;

            const visiblePoints = chart.points.slice(leftIndex, rightIndex);

            const minmax = getMinMax(visiblePoints, chart, this.data.summary);

            renderChart({
                engine: this.renderEngine,
                points: visiblePoints,
                min: minmax.min,
                max: minmax.max,
                style: chart.style,
            });
        });

        this.interactionsEngine.addHitRegion(RegionTypes.TIMESERIES, null, 0, 0, this.renderEngine.width, this.height);
    }
}
