import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
import { HitRegion, RegionTypes } from '../types';
import UIPlugin from './ui-plugin';

export type TimeseriesPoint = [number, number];

interface TimeseriesPointsSummary {
    min: number;
    max: number;
    first: number;
    last: number;
}

export type TimeseriesPluginStyles = {
    defaultHeight: number;
};
export const defaultCPUPluginStyles: TimeseriesPluginStyles = {
    defaultHeight: 68,
};

type TimeseriesPointWithIndex = [idx: number, ts: number, value: number, normalizedTs: number, normalizedValue: number];

enum TimeseriesPointWithIndexX {
    idx = 0,
    ts = 1,
    value = 2,
    normalizedTs = 3,
    normalizedValue = 4,
}

export class TimeseriesPlugin extends UIPlugin<TimeseriesPluginStyles> {
    height: number;
    name: string;
    color: string;
    data: TimeseriesPoint[];
    maxValue: number;
    hoveredRegion: HitRegion<{}> | null = null;
    selectedRegion: HitRegion<{}> | null = null;
    summary: TimeseriesPointsSummary | null = null;

    constructor(name: string, color: string, data: TimeseriesPoint[], maxValue = 100) {
        super();

        this.maxValue = maxValue;
        this.data = [];
        this.name = name;
        this.color = color;
        this.height = 100;

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

        this.interactionsEngine.setCursor('grabbing');

        this.renderEngine.tryToChangePosition(position.deltaX);

        if (startPositionX !== this.renderEngine.parent.positionX) {
            this.renderEngine.parent.render();
        }
    }

    handleMouseUp() {
        this.interactionsEngine.clearCursor();
    }

    setData(data: TimeseriesPoint[]) {
        this.data = data;

        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;
        let first = Number.MAX_VALUE;
        let last = Number.MIN_VALUE;

        this.data.forEach(([ts, v]) => {
            if (v < min) {
                min = v;
            }
            if (v > max) {
                max = v;
            }

            if (ts < first) {
                first = ts;
            }
            if (ts > last) {
                last = ts;
            }
        });

        this.summary = {
            min,
            max,
            first,
            last,
        };
    }

    calcRect(start: number, duration: number, isEnd: boolean) {
        const w = duration * this.renderEngine.zoom;

        return {
            x: this.renderEngine.timeToPosition(start),
            w: isEnd ? (w <= 0.1 ? 0.1 : w >= 3 ? w - 1 : w - w / 3) : w,
        };
    }

    handleHover(region: HitRegion<number> | null) {
        this.hoveredRegion = region;
    }

    override renderTooltip() {
        if (this.hoveredRegion) {
            const round = (v) => Math.round(v * 100) / 100;
            const data = this.hoveredRegion.data as TimeseriesPointWithIndex;

            this.renderEngine.renderTooltipFromData(
                [
                    { text: `Value: ${round(data[TimeseriesPointWithIndexX.value])}` },
                    {
                        text: `Timestamp: ${round(data[TimeseriesPointWithIndexX.ts])}ms`,
                    },
                ],
                this.interactionsEngine.getGlobalMouse()
            );
            return true;
        }
        return false;
    }

    override render() {
        if (this.data?.length === 0 || !this.summary) {
            console.log('[render] no data - returned');
            return;
        }
        const timestampStart = this.renderEngine.positionX;
        const timestampEnd = this.renderEngine.positionX + this.renderEngine.getRealView();

        const positionStart = this.renderEngine.timeToPosition(timestampStart);
        const positionEnd = this.renderEngine.timeToPosition(timestampEnd);

        const padding = 5;
        const heightPerValueUnit = (this.height - padding) / Math.max(this.summary.max - this.summary.min, 1);

        const normalizeValue = (v: number) => {
            return this.height - v * heightPerValueUnit;
        };

        const convertDataPointToPointWithIndex = (idx: number, ts: number, v: number): TimeseriesPointWithIndex => {
            return [idx, ts, v, this.renderEngine.timeToPosition(ts), normalizeValue(v)];
        };

        const datapoints: TimeseriesPointWithIndex[] = [];

        let indexStart = 0;

        this.data.forEach(([timestamp, value], idx: number) => {
            if (timestamp <= timestampStart) {
                indexStart = idx;
            }

            if (timestamp >= timestampStart && timestamp <= timestampEnd) {
                datapoints.push(convertDataPointToPointWithIndex(idx, timestamp, value));
            }
        });

        let prevTPI: TimeseriesPointWithIndex =
            (datapoints.length && datapoints[0][TimeseriesPointWithIndexX.idx] > 0
                ? datapoints[datapoints[0][TimeseriesPointWithIndexX.idx] - 1]
                : datapoints[0]) ||
            convertDataPointToPointWithIndex(indexStart, this.data[indexStart][0], this.data[indexStart][1]);

        this.renderEngine.setCtxColor(this.color);
        this.renderEngine.ctx.beginPath();
        this.renderEngine.ctx.moveTo(positionStart, this.height);
        this.renderEngine.ctx.lineTo(positionStart, prevTPI[TimeseriesPointWithIndexX.normalizedValue]);

        for (const dp of datapoints) {
            if (dp[TimeseriesPointWithIndexX.normalizedTs] > prevTPI[TimeseriesPointWithIndexX.normalizedTs]) {
                this.renderEngine.ctx.lineTo(
                    dp[TimeseriesPointWithIndexX.normalizedTs],
                    prevTPI[TimeseriesPointWithIndexX.normalizedValue]
                );

                this.renderEngine.ctx.lineTo(
                    dp[TimeseriesPointWithIndexX.normalizedTs],
                    dp[TimeseriesPointWithIndexX.normalizedValue]
                );

                this.interactionsEngine.addHitRegion(
                    RegionTypes.CLUSTER,
                    prevTPI,
                    prevTPI[TimeseriesPointWithIndexX.normalizedTs],
                    0,
                    dp[TimeseriesPointWithIndexX.normalizedTs] - prevTPI[TimeseriesPointWithIndexX.normalizedTs],
                    this.height
                );

                prevTPI = dp;
            }
        }

        this.interactionsEngine.addHitRegion(
            RegionTypes.CLUSTER,
            prevTPI,
            prevTPI[TimeseriesPointWithIndexX.normalizedTs],
            0,
            prevTPI[TimeseriesPointWithIndexX.normalizedTs] - positionEnd,
            this.height
        );

        this.renderEngine.ctx.lineTo(
            Math.max(positionStart, prevTPI[TimeseriesPointWithIndexX.normalizedTs]),
            prevTPI[TimeseriesPointWithIndexX.normalizedValue]
        );
        this.renderEngine.ctx.lineTo(positionEnd, prevTPI[TimeseriesPointWithIndexX.normalizedValue]);
        this.renderEngine.ctx.lineTo(positionEnd, this.height);

        this.renderEngine.ctx.closePath();
        this.renderEngine.ctx.stroke();
        this.renderEngine.ctx.fill();

        const textHeight = 10;
        const leftMargin = 5;
        this.renderEngine.ctx.strokeText(`${Math.round(this.summary?.max ?? 0)}`, leftMargin, textHeight);
        this.renderEngine.ctx.strokeText(
            `${Math.round(this.summary?.min ?? 0)}`,
            leftMargin,
            this.height - textHeight - 5
        );
    }
}
