export class TimeIndicators {
    constructor(renderEngine, interactionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;

        this.start = 0;
        this.end = 0;
        this.accuracy = 0;
        this.delta = 0;
    }

    init() {
        this.interactionsEngine.on('change-position', ({ x }) => this.positionX = x);
        this.renderEngine.on('change-size', ({ width }) => this.width = width);
    }

    setMinMax(min, max) {
        this.min = min;
        this.max = max;

        this.calcTimeline();
    }

    calcTimeline() {
        const timeWidth = this.max - this.min;
        const minPixelDelta = 90;
        const initialLinesCount = this.width / minPixelDelta;
        const initialTimeLineDelta = timeWidth / initialLinesCount;

        const realView = this.renderEngine.getRealView();
        const proportion = realView / (timeWidth || 1);

        this.delta = initialTimeLineDelta / Math.pow(2, Math.floor(Math.log2(1 / proportion)));
        this.start = Math.floor((this.positionX - this.min) / this.delta);
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
            const timePosition = i * this.delta + this.min;
            const pixelPosition = this.renderEngine.timeToPosition(timePosition.toFixed(this.accuracy));

            cb(pixelPosition, timePosition);
        }
    }

    renderLines(start, height) {
        this.renderEngine.setCtxColor('rgb(126, 126, 126, 0.5)');

        this.forEachTime((pixelPosition) => {
            this.renderEngine.fillRect(pixelPosition, start, 1, height);
        });
    }

    renderTimes() {
        this.renderEngine.clear(this.renderEngine.width, this.renderEngine.charHeight);

        this.renderEngine.setCtxColor('black');

        this.forEachTime((pixelPosition, timePosition) => {
            this.renderEngine.fillText(
                timePosition.toFixed(this.accuracy) + this.renderEngine.timeUnits,
                pixelPosition + this.renderEngine.blockPadding,
                this.renderEngine.charHeight
            );
        });

        this.renderEngine.setCtxColor('rgb(126, 126, 126, 0.5)');

        this.forEachTime((pixelPosition) => {
            this.renderEngine.fillRect(pixelPosition, 0, 1, this.renderEngine.charHeight);
        });
    }
}
