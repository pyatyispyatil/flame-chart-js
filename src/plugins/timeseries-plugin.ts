import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
import { RegionTypes } from '../types';
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

export class TimeseriesPlugin extends UIPlugin<TimeseriesPluginStylesNoOptional> {
    height: number;
    data: TimeseriesPoint[];
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

    findClosestDataPoint(timestamp: number): TimeseriesPoint {
        return [timestamp, -1];
    }

    override renderTooltip() {
        const mouse = this.interactionsEngine.getGlobalMouse();
        //QUESTION: how do i convert mouse.x to position
        const timestamp = mouse.x;
        const tp = this.findClosestDataPoint(timestamp);
        //TODO - ...

        this.renderEngine.renderTooltipFromData(
            [
                { text: `Value:${tp[1]}` },
                {
                    text: `Timestamp: ${tp[0]}ms`,
                },
            ],
            this.interactionsEngine.getGlobalMouse()
        );
        return true;
    }

    private normalizeValue(value: number, heightPerValueUnit: number) {
        return this.height - value * heightPerValueUnit;
    }

    override render() {
        if (this.data?.length === 0 || !this.summary) {
            return;
        }

        const timestampStart = this.renderEngine.positionX;
        const width = this.renderEngine.getRealView();
        const timestampEnd = this.renderEngine.positionX + width;

        const positionStart = this.renderEngine.timeToPosition(timestampStart);
        const positionEnd = this.renderEngine.timeToPosition(timestampEnd);

        const heightPerValueUnit =
            (this.height - this.styles.padding) / Math.max(this.summary.max - this.summary.min, 1);

        this.interactionsEngine.addHitRegion(RegionTypes.CLUSTER, 'not-used', 0, 0, width, this.height);

        let indexStart = 0;

        this.renderEngine.setCtxColor(this.styles.color);
        this.renderEngine.ctx.beginPath();
        this.renderEngine.ctx.moveTo(positionStart, this.height);

        let foundStart: boolean = false;
        let normalizedValue: number = -1;
        let position: number = -1;
        let idx = 0;

        for (const [time, value] of this.data) {
            if (time < timestampStart) {
                indexStart = idx;
            }

            if (time >= timestampStart && time <= timestampEnd) {
                if (!foundStart) {
                    foundStart = true;

                    position = this.renderEngine.timeToPosition(time);

                    normalizedValue = this.normalizeValue(this.data[indexStart][1], heightPerValueUnit);
                    this.renderEngine.ctx.lineTo(positionStart, normalizedValue);
                }

                if (position > -1) {
                    position = this.renderEngine.timeToPosition(time);

                    if (this.styles.lineStyle === 'step') {
                        this.renderEngine.ctx.lineTo(position, normalizedValue);
                    }
                    normalizedValue = this.normalizeValue(value, heightPerValueUnit);

                    this.renderEngine.ctx.lineTo(position, normalizedValue);
                }
            } else if (time > timestampEnd) {
                break;
            }

            idx++;
        }

        if (position > -1) {
            this.renderEngine.ctx.lineTo(Math.max(positionStart, position), normalizedValue);
            this.renderEngine.ctx.lineTo(positionEnd, normalizedValue);
        }

        this.renderEngine.ctx.lineTo(positionEnd, this.height);
        this.renderEngine.ctx.closePath();
        this.renderEngine.ctx.stroke();
        this.renderEngine.ctx.fill();
    }
}
