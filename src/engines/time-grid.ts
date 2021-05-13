import { deepMerge } from '../utils.js';
import {RenderEngine, OffscreenRenderEngine} from "./render-engine";

const MIN_PIXEL_DELTA = 85;

export const defaultTimeGridSettings = {
    styles: {
        timeGrid: {
            color: 'rgb(126, 126, 126, 0.5)'
        }
    }
};

export class TimeGrid {
    accuracy = 0;
    private renderEngine: OffscreenRenderEngine | RenderEngine;
    private start = 0;
    private end = 0;
    private delta = 0;
    private styles: any;
    private timeUnits = "ms";

    constructor(renderEngine: OffscreenRenderEngine | RenderEngine, settings: any) {
        this.renderEngine = renderEngine;

        this.setSettings(settings);
    }

    setSettings(data) {
        // TODO: fix this any
        const settings: any = deepMerge(defaultTimeGridSettings, data);

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
            // TODO: complained about the type. accuracy is of type number and this function could have returned string and number
            return Number(strTimelineDelta.match(/\d+$/)![0]);
        }

        const zeros = strTimelineDelta.match(/(0\.0*)/);
        return zeros ? zeros[0].length - 1 : 0;
    }

    getTimelineAccuracy() {
        return this.accuracy;
    }

    forEachTime(cb: (pixelPosition: number, timePosition: number) => void) {
        for (let i = this.start; i <= this.end; i++) {
            const timePosition = i * this.delta + this.renderEngine.min;
            const pixelPosition = this.renderEngine.timeToPosition(
                // TODO: complained about the type string, and timeToPosition expects number
                Number(timePosition.toFixed(this.accuracy))
            );

            cb(pixelPosition, timePosition);
        }
    }

    renderLines(start: number, height: number, renderEngine: RenderEngine | OffscreenRenderEngine = this.renderEngine) {
        renderEngine.setCtxColor(this.styles.color);

        this.forEachTime((pixelPosition) => {
            renderEngine.fillRect(pixelPosition, start, 1, height);
        });
    }

    renderTimes(renderEngine: RenderEngine | OffscreenRenderEngine = this.renderEngine) {
        // @ts-ignore TODO: its possibly undefined
        renderEngine.setCtxColor(renderEngine.styles.fontColor);
        // @ts-ignore TODO: its possibly undefined
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
