import { deepMerge } from '../utils';

const MIN_PIXEL_DELTA = 85;

export const defaultTimeGridSettings = {
    styles: {
        timeGrid: {
            color: 'rgba(90,90,90,0.20)'
        }
    }
};

export class TimeGrid {
    renderEngine;
    start: number;
    end: number;
    accuracy;
    delta: number;
    styles;
    timeUnits;
    constructor(renderEngine, settings) {
        this.renderEngine = renderEngine;
        this.start = 0;
        this.end = 0;
        this.accuracy = 0;
        this.delta = 0;

        this.setSettings(settings);
    }

    setSettings(data) {
        const settings: Record<string, any> = deepMerge(defaultTimeGridSettings, data);

        this.styles = settings.styles.timeGrid;
        this.timeUnits = this.renderEngine.getTimeUnits();
    }

    recalc() {
        const timeWidth = this.renderEngine.max - this.renderEngine.min;
        const initialLinesCount = this.renderEngine.width / MIN_PIXEL_DELTA;
        const initialTimeLineDelta = timeWidth / initialLinesCount;

        const realView = this.renderEngine.getRealView();
        const proportion = realView / (timeWidth || 1);

        this.delta = initialTimeLineDelta / Math.pow(2, Math.floor(Math.log2(1 / proportion)));
        this.start = Math.floor((this.renderEngine.positionX - this.renderEngine.min) / this.delta);
        this.end = Math.ceil(realView / this.delta) + this.start;

        this.accuracy = this.calcNumberFix();
    }

    calcNumberFix() {
        const strTimelineDelta = (this.delta / 2).toString();

        if (strTimelineDelta.includes('e')) {
            return strTimelineDelta.match(/\d+$/)[0];
        } else {
            const zeros = strTimelineDelta.match(/(0\.0*)/);

            return zeros ? zeros[0].length - 1 : 0;
        }
    }

    getTimelineAccuracy() {
        return this.accuracy;
    }

    forEachTime(cb) {
        for (let i = this.start; i <= this.end; i++) {
            const timePosition = i * this.delta + this.renderEngine.min;
            const pixelPosition = this.renderEngine.timeToPosition(timePosition.toFixed(this.accuracy));

            cb(pixelPosition, timePosition);
        }
    }

    renderLines(start, height, renderEngine = this.renderEngine) {
        renderEngine.setCtxColor(this.styles.color);

        this.forEachTime((pixelPosition) => {
            renderEngine.fillRect(pixelPosition, start, 1, height);
        });
    }

    renderTimes(renderEngine = this.renderEngine) {
        renderEngine.setCtxColor(renderEngine.styles.fontColor);
        renderEngine.setCtxFont(renderEngine.styles.font);

        this.forEachTime((pixelPosition, timePosition) => {
            renderEngine.fillText(
                timePosition.toFixed(this.accuracy) + this.timeUnits,
                pixelPosition + renderEngine.blockPaddingLeftRight,
                renderEngine.charHeight
            );
        });
    }
}
