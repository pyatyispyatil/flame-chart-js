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
    height?: number;
    padding?: number;
    color?: string;
    lineStyle?: 'step' | 'interpolate';
};

type TimeseriesPluginStylesNoOptional = {
    height: number;
    padding: number;
    color: string;
    lineStyle: 'step' | 'interpolate';
};

export const defaultCPUPluginStyles: TimeseriesPluginStylesNoOptional = {
    height: 68,
    padding: 5,
    lineStyle: 'interpolate',
    color: 'red',
};

interface TimeseriesPointWithExtra {
    idx: number;
    timestamp: number;
    value: number;
    position: number;
    normalizedValue: number;
}

const EmptyTimeseriesPoint: TimeseriesPointWithExtra = {
    idx: -1,
    normalizedValue: -1,
    position: -1,
    timestamp: -1,
    value: -1,
};

export class TimeseriesPlugin extends UIPlugin<TimeseriesPluginStylesNoOptional> {
    height: number;
    data: TimeseriesPoint[];
    maxValue: number;
    hoveredRegion: HitRegion<{}> | null = null;
    selectedRegion: HitRegion<{}> | null = null;
    summary: TimeseriesPointsSummary | null = null;
    override styles: TimeseriesPluginStylesNoOptional;

    constructor({ name, data, styles }: { name: string; data: TimeseriesPoint[]; styles?: TimeseriesPluginStyles }) {
        super(name);

        this.styles = { ...defaultCPUPluginStyles, ...(styles ?? {}) };
        this.data = [];
        this.name = name;

        this.height = this.styles.height;

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

        this.data.forEach(([timestamp, value]) => {
            if (value < min) {
                min = value;
            }
            if (value > max) {
                max = value;
            }

            if (timestamp < first) {
                first = timestamp;
            }
            if (timestamp > last) {
                last = timestamp;
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
            const round = (value: number) => Math.round(value * 100) / 100;
            const data = this.hoveredRegion.data as TimeseriesPointWithExtra;

            this.renderEngine.renderTooltipFromData(
                [
                    { text: `Value: ${round(data.value)}` },
                    {
                        text: `Timestamp: ${round(data.timestamp)}ms`,
                    },
                ],
                this.interactionsEngine.getGlobalMouse()
            );
            return true;
        }
        return false;
    }

    private normalizeValue(value: number, heightPerValueUnit: number) {
        return this.height - value * heightPerValueUnit;
    }

    private convertDataPointToPointWithIndex(
        idx: number,
        timestamp: number,
        value: number,
        heightPerValueUnit: number
    ): TimeseriesPointWithExtra {
        return {
            idx,
            timestamp,
            value,
            position: this.renderEngine.timeToPosition(timestamp),
            normalizedValue: this.normalizeValue(value, heightPerValueUnit),
        };
    }

    override render() {
        if (this.data?.length === 0 || !this.summary) {
            return;
        }

        const timestampStart = this.renderEngine.positionX;
        const timestampEnd = this.renderEngine.positionX + this.renderEngine.getRealView();

        const positionStart = this.renderEngine.timeToPosition(timestampStart);
        const positionEnd = this.renderEngine.timeToPosition(timestampEnd);

        const heightPerValueUnit =
            (this.height - this.styles.padding) / Math.max(this.summary.max - this.summary.min, 1);

        let indexStart = 0;

        this.renderEngine.setCtxColor(this.styles.color);
        this.renderEngine.ctx.beginPath();
        this.renderEngine.ctx.moveTo(positionStart, this.height);

        let foundStart: boolean = false;
        let prevTPI: TimeseriesPointWithExtra = EmptyTimeseriesPoint;
        let tpi: TimeseriesPointWithExtra = EmptyTimeseriesPoint;

        let idx = 0;
        for (const [time, value] of this.data) {
            if (time < timestampStart) {
                indexStart = idx;
            }

            if (time >= timestampStart && time <= timestampEnd) {
                if (!foundStart) {
                    foundStart = true;

                    prevTPI = this.convertDataPointToPointWithIndex(
                        indexStart,
                        this.data[indexStart][0],
                        this.data[indexStart][1],
                        heightPerValueUnit
                    );
                    this.renderEngine.ctx.lineTo(positionStart, prevTPI.normalizedValue);
                }

                tpi = this.convertDataPointToPointWithIndex(indexStart, time, value, heightPerValueUnit);

                if (prevTPI.idx > -1) {
                    if (this.styles.lineStyle === 'step') {
                        this.renderEngine.ctx.lineTo(tpi.position, prevTPI.normalizedValue);
                    }

                    this.renderEngine.ctx.lineTo(tpi.position, tpi.normalizedValue);

                    this.interactionsEngine.addHitRegion(
                        RegionTypes.CLUSTER,
                        prevTPI,
                        prevTPI.position,
                        0,
                        tpi.position - prevTPI.position,
                        this.height
                    );
                }

                prevTPI = tpi;
            } else if (time > timestampEnd) {
                break;
            }

            idx++;
        }

        if (prevTPI.idx > -1) {
            this.interactionsEngine.addHitRegion(
                RegionTypes.CLUSTER,
                prevTPI,
                prevTPI.position,
                0,
                prevTPI.position - positionEnd,
                this.height
            );

            this.renderEngine.ctx.lineTo(Math.max(positionStart, prevTPI.position), prevTPI.normalizedValue);
            this.renderEngine.ctx.lineTo(positionEnd, prevTPI.normalizedValue);
        }

        this.renderEngine.ctx.lineTo(positionEnd, this.height);
        this.renderEngine.ctx.closePath();
        this.renderEngine.ctx.stroke();
        this.renderEngine.ctx.fill();
    }
}
