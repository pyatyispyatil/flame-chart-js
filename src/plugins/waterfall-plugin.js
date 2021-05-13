import { deepMerge } from '../utils.js';

export const defaultWaterfallPluginSettings = {
    styles: {
        waterfallPlugin: {
            lineHeight: 5
        }
    }
}

export default class WaterfallPlugin {
    constructor({ items, intervals }, settings = {}) {
        this.positionY = 0;

        this.setData(items, intervals);
        this.setSettings(settings);
    }

    init(renderEngine, interactionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;

        this.interactionsEngine.on('change-position', this.handlePositionChange.bind(this));

        this.height = 200;
    }

    handlePositionChange({ deltaX, deltaY }) {
        const startPositionY = this.positionY;
        const startPositionX = this.renderEngine.parent.positionX;

        if (this.positionY + deltaY >= 0) {
            this.setPositionY(this.positionY + deltaY);
        } else {
            this.setPositionY(0);
        }

        this.renderEngine.tryToChangePosition(deltaX)

        if (startPositionX !== this.renderEngine.parent.positionX || startPositionY !== this.positionY) {
            this.renderEngine.parent.render();
        }
    }

    setPositionY(y) {
        this.positionY = y;
    }

    setSettings(data) {
        this.settings = deepMerge(defaultWaterfallPluginSettings, data);
        this.styles = this.settings.styles.waterfallPlugin;
    }

    setData(data, commonIntervals) {
        this.positionY = 0;

        if (data.length) {
            this.data = data.map(({ name, intervals, timing }) => {
                const values = Object.values(timing);
                const min = values.reduce((acc, val) => Math.min(acc, val));
                const max = values.reduce((acc, val) => Math.max(acc, val));
                const resolvedIntervals = typeof intervals === 'string' ? commonIntervals[intervals] : intervals;
                const preparedIntervals = resolvedIntervals
                    .map(({ start, end, color, type, name }) => ({
                        start: typeof start === 'string' ? timing[start] : start,
                        end: typeof end === 'string' ? timing[end] : end,
                        color, name, type
                    }));
                const blocks = preparedIntervals.filter(({ type }) => type === 'block');
                const minBlock = blocks.reduce((acc, { start }) => Math.min(acc, start), blocks[0].start);
                const maxBlock = blocks.reduce((acc, { end }) => Math.max(acc, end), blocks[0].end);

                return {
                    intervals: preparedIntervals,
                    textBlock: {
                        min: minBlock,
                        max: maxBlock
                    },
                    name,
                    timing,
                    min,
                    max
                };
            });

            this.min = this.data.reduce((acc, { min }) => Math.min(acc, min), this.data[0].min);
            this.max = this.data.reduce((acc, { max }) => Math.max(acc, max), this.data[0].max);
        }
    }

    calcRect(start, duration, isEnd) {
        const w = (duration * this.renderEngine.zoom);

        return {
            x: this.renderEngine.timeToPosition(start),
            w: isEnd ? w <= 0.1 ? 0.1 : w >= 3 ? w - 1 : w - w / 3 : w
        }
    }

    render() {
        const rightSide = this.renderEngine.positionX + this.renderEngine.getRealView();
        const leftSide = this.renderEngine.positionX;

        let stack = [];
        const viewedData = this.data
            .filter(({ min, max }) => !(
                (
                    rightSide < min && rightSide < max
                ) || (
                    leftSide > max && rightSide > min
                ))
            )
            .sort((a, b) => a.min - b.min || b.max - a.max)
            .map((entry) => {
                while (stack.length && entry.min - stack[stack.length - 1].max > 0) {
                    stack.pop();
                }

                const result = {
                    ...entry,
                    level: stack.length
                };

                stack.push(entry);

                return result;
            });

        viewedData.forEach(({ name, intervals, textBlock, level }, index) => {
            const textStart = this.renderEngine.timeToPosition(textBlock.min);
            const textEnd = this.renderEngine.timeToPosition(textBlock.max);
            const y = (level * (this.renderEngine.blockHeight + 1) - this.positionY);

            this.renderEngine.addTextToRenderQueue(name, textStart, y, textEnd - textStart);

            intervals.forEach(({ color, start, end, type }, index) => {
                const { x, w } = this.calcRect(start, end - start, index === intervals.length - 1);

                if (type === 'block') {
                    this.renderEngine.addRectToRenderQueue(color, x, y, w);
                } else if (type === 'line') {

                }

                this.interactionsEngine.addHitRegion('waterfall-node', index, x, y, w, this.renderEngine.blockHeight);
            });
        }, 0);
    }
}
