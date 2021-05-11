export default class WaterfallPlugin {
    constructor(data, intervals) {
        this.positionY = 0;

        this.setData(data, intervals);
    }

    init(renderEngine, interactionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;

        this.height = 200;
    }

    setData(data, commonIntervals) {
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

        viewedData.forEach(({ name, intervals, textBlock, level }) => {
            const textStart = this.renderEngine.timeToPosition(textBlock.min);
            const textEnd = this.renderEngine.timeToPosition(textBlock.max);
            const y = (level * (this.renderEngine.blockHeight + 1)) - this.positionY;

            this.renderEngine.addTextToRenderQueue(name, textStart, y, textEnd - textStart);

            intervals.forEach(({ color, start, end, type }, index) => {
                const { x, w } = this.calcRect(start, end - start, index === intervals.length - 1);

                if (type === 'block') {
                    this.renderEngine.addRectToRenderQueue(color, x, y, w);
                } else if (type === 'line') {

                }
            });
        });
    }
}
