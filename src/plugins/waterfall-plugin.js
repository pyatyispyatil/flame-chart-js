import { deepMerge } from '../utils.js';
import EventEmitter from 'events';

export const defaultWaterfallPluginSettings = {
    styles: {
        waterfallPlugin: {
            defaultHeight: 150
        }
    }
}

export default class WaterfallPlugin extends EventEmitter {
    constructor({ items, intervals }, settings = {}) {
        super();
        this.setData(items, intervals);
        this.setSettings(settings);
    }

    init(renderEngine, interactionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;

        this.interactionsEngine.on('change-position', this.handlePositionChange.bind(this));
        this.interactionsEngine.on('hover', this.handleHover.bind(this));
        this.interactionsEngine.on('select', this.handleSelect.bind(this));
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

    handleHover(region) {
        this.hoveredRegion = region;
    }

    handleSelect(region) {
        if (region && region.type === 'waterfall-node') {
            this.emit(this.initialData[region.data], 'waterfall-node');
        }
    }

    setPositionY(y) {
        this.positionY = y;
    }

    setSettings(data) {
        this.settings = deepMerge(defaultWaterfallPluginSettings, data);
        this.styles = this.settings.styles.waterfallPlugin;

        this.height = this.styles.defaultHeight;
        this.positionY = 0;
    }

    setData(data, commonIntervals) {
        this.positionY = 0;

        if (data.length) {
            this.initialData = data;
            this.data = data.map(({ name, intervals, timing }, index) => {
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
                    max,
                    index
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

    renderTooltip() {
        if (this.hoveredRegion && this.hoveredRegion.type === 'waterfall-node') {
            const { data: index } = this.hoveredRegion;
            const { name, intervals, timing } = this.data[index];
            const timeUnits = this.renderEngine.getTimeUnits();
            const nodeAccuracy = this.renderEngine.getAccuracy() + 2;

            const header = { text: `${name}` };
            const intervalsHeader = { text: 'intervals', color: this.renderEngine.styles.tooltipHeaderFontColor };
            const intervalsTexts = intervals.map(({ name, start, end }) => ({
                text: `${name}: ${(end - start).toFixed(nodeAccuracy)} ${timeUnits}`
            }));
            const timingHeader = { text: 'timing', color: this.renderEngine.styles.tooltipHeaderFontColor };
            const timingTexts = Object.entries(timing).map(([name, time]) => ({
                text: `${name}: ${(time).toFixed(nodeAccuracy)} ${timeUnits}`
            }));

            this.renderEngine.renderTooltipFromData(
                [
                    header,
                    intervalsHeader,
                    ...intervalsTexts,
                    timingHeader,
                    ...timingTexts
                ],
                this.interactionsEngine.getGlobalMouse()
            );

            return true;
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

        viewedData.forEach(({ name, intervals, textBlock, level, index }) => {
            const textStart = this.renderEngine.timeToPosition(textBlock.min);
            const textEnd = this.renderEngine.timeToPosition(textBlock.max);
            const y = (level * (this.renderEngine.blockHeight + 1) - this.positionY);

            this.renderEngine.addTextToRenderQueue(name, textStart, y, textEnd - textStart);

            const { x, w } = intervals.reduce((acc, { color, start, end, type }, index) => {
                const { x, w } = this.calcRect(start, end - start, index === intervals.length - 1);

                if (type === 'block') {
                    this.renderEngine.addRectToRenderQueue(color, x, y, w);
                } else if (type === 'line') {

                }

                return {
                    x: acc.x === null ? x : acc.x,
                    w: w + acc.w
                };
            }, { x: null, w: 0 });

            this.interactionsEngine.addHitRegion('waterfall-node', index, x, y, w, this.renderEngine.blockHeight);
        }, 0);
    }
}
