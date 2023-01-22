import { mergeObjects } from '../utils';
import UIPlugin from './ui-plugin';
import { HitRegion, RegionTypes, Waterfall, WaterfallInterval, WaterfallItems } from '../types';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';

function getValueByChoice<T extends Omit<WaterfallInterval, 'start' | 'end'> & { start: number; end: number }>(
    array: T[],
    property: 'end' | 'start',
    fn: Math['min'] | Math['max']
): number {
    if (array.length) {
        return array.reduce((acc, { [property]: value }) => fn(acc, value), array[0][property]);
    }

    return 0;
}

export type WaterfallPluginStyles = {
    defaultHeight: number;
};

type WatterfallPluginDataItem = {
    intervals: { start: number; end: number; color: string; name: string; type: 'block' | 'line' }[];
    index: number;
    max: number;
    min: number;
    name: string;
    textBlock: { start: number; end: number };
    timing: Record<PropertyKey, number>;
    meta?: any[];
};

export type WaterfallPluginSettings = {
    styles?: Partial<WaterfallPluginStyles>;
};

export const defaultWaterfallPluginStyles: WaterfallPluginStyles = {
    defaultHeight: 68,
};

export class WaterfallPlugin extends UIPlugin<WaterfallPluginStyles> {
    override styles: WaterfallPluginStyles = defaultWaterfallPluginStyles;
    height = defaultWaterfallPluginStyles.defaultHeight;

    data: WatterfallPluginDataItem[] = [];
    positionY = 0;
    hoveredRegion: HitRegion<number> | null = null;
    selectedRegion: HitRegion<number> | null = null;
    initialData: WaterfallItems = [];

    constructor({
        data,
        name = 'waterfallPlugin',
        settings,
    }: {
        name?: string;
        data: Waterfall;
        settings: WaterfallPluginSettings;
    }) {
        super(name);
        this.setData(data);
        this.setSettings(settings);
    }

    override init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine) {
        super.init(renderEngine, interactionsEngine);

        this.interactionsEngine.on('change-position', this.handlePositionChange.bind(this));
        this.interactionsEngine.on('hover', this.handleHover.bind(this));
        this.interactionsEngine.on('select', this.handleSelect.bind(this));
        this.interactionsEngine.on('up', this.handleMouseUp.bind(this));
    }

    handlePositionChange({ deltaX, deltaY }: { deltaX: number; deltaY: number }) {
        const startPositionY = this.positionY;
        const startPositionX = this.renderEngine.parent.positionX;

        this.interactionsEngine.setCursor('grabbing');

        if (this.positionY + deltaY >= 0) {
            this.setPositionY(this.positionY + deltaY);
        } else {
            this.setPositionY(0);
        }

        this.renderEngine.tryToChangePosition(deltaX);

        if (startPositionX !== this.renderEngine.parent.positionX || startPositionY !== this.positionY) {
            this.renderEngine.parent.render();
        }
    }

    handleMouseUp() {
        this.interactionsEngine.clearCursor();
    }

    handleHover(region: HitRegion<number> | null) {
        this.hoveredRegion = region;
    }

    handleSelect(region: HitRegion<number> | null) {
        if (this.selectedRegion !== region) {
            this.selectedRegion = region;
            this.emit('select', {
                node: region?.data ? this.initialData[region.data] : null,
                type: 'waterfall-node',
            });
            this.renderEngine.render();
        }
    }

    setPositionY(y: number) {
        this.positionY = y;
    }

    override setSettings({ styles }: WaterfallPluginSettings) {
        this.styles = mergeObjects(defaultWaterfallPluginStyles, styles);

        this.height = this.styles.defaultHeight;
        this.positionY = 0;
    }

    setData({ items: data, intervals: commonIntervals }: Waterfall) {
        this.positionY = 0;

        this.initialData = data;
        this.data = data
            .map(({ name, intervals, timing, ...rest }, index) => {
                const resolvedIntervals = typeof intervals === 'string' ? commonIntervals[intervals] : intervals;
                const preparedIntervals = resolvedIntervals
                    .map(({ start, end, color, type, name }) => ({
                        start: typeof start === 'string' ? timing[start] : start,
                        end: typeof end === 'string' ? timing[end] : end,
                        color,
                        name,
                        type,
                    }))
                    .filter(({ start, end }) => typeof start === 'number' && typeof end === 'number');
                const blocks = preparedIntervals.filter(({ type }) => type === 'block');

                const blockStart = getValueByChoice(blocks, 'start', Math.min);
                const blockEnd = getValueByChoice(blocks, 'end', Math.max);

                const min = getValueByChoice(preparedIntervals, 'start', Math.min);
                const max = getValueByChoice(preparedIntervals, 'end', Math.max);

                return {
                    ...rest,
                    intervals: preparedIntervals,
                    textBlock: {
                        start: blockStart,
                        end: blockEnd,
                    },
                    name,
                    timing,
                    min,
                    max,
                    index,
                };
            })
            .filter(({ intervals }) => intervals.length)
            .sort((a, b) => a.min - b.min || b.max - a.max);

        if (data.length) {
            this.min = this.data.reduce((acc, { min }) => Math.min(acc, min), this.data[0].min);
            this.max = this.data.reduce((acc, { max }) => Math.max(acc, max), this.data[0].max);
        }

        if (this.renderEngine) {
            this.renderEngine.recalcMinMax();
            this.renderEngine.resetParentView();
        }
    }

    calcRect(start: number, duration: number, isEnd: boolean) {
        const w = duration * this.renderEngine.zoom;

        return {
            x: this.renderEngine.timeToPosition(start),
            w: isEnd ? (w <= 0.1 ? 0.1 : w >= 3 ? w - 1 : w - w / 3) : w,
        };
    }

    override renderTooltip() {
        if (this.hoveredRegion) {
            if (this.renderEngine.options.tooltip === false) {
                return true;
            } else if (typeof this.renderEngine.options.tooltip === 'function') {
                const { data: index } = this.hoveredRegion;
                const data = { ...this.hoveredRegion };

                // @ts-ignore data type on waterfall item is number but here it is something else?
                data.data = this.data.find(({ index: i }) => index === i);

                this.renderEngine.options.tooltip(data, this.renderEngine, this.interactionsEngine.getGlobalMouse());
            } else {
                const { data: index } = this.hoveredRegion;
                const dataItem = this.data.find(({ index: i }) => index === i);

                if (dataItem) {
                    const { name, intervals, timing, meta = [] } = dataItem;
                    const timeUnits = this.renderEngine.getTimeUnits();
                    const nodeAccuracy = this.renderEngine.getAccuracy() + 2;

                    const header = { text: `${name}` };
                    const intervalsHeader = {
                        text: 'intervals',
                        color: this.renderEngine.styles.tooltipHeaderFontColor,
                    };
                    const intervalsTexts = intervals.map(({ name, start, end }) => ({
                        text: `${name}: ${(end - start).toFixed(nodeAccuracy)} ${timeUnits}`,
                    }));
                    const timingHeader = { text: 'timing', color: this.renderEngine.styles.tooltipHeaderFontColor };
                    const timingTexts = Object.entries(timing)
                        .filter(([, time]) => typeof time === 'number')
                        .map(([name, time]: [string, number]) => ({
                            text: `${name}: ${time.toFixed(nodeAccuracy)} ${timeUnits}`,
                        }));
                    const metaHeader = { text: 'meta', color: this.renderEngine.styles.tooltipHeaderFontColor };
                    const metaTexts = meta
                        ? meta.map(({ name, value, color }) => ({
                              text: `${name}: ${value}`,
                              color,
                          }))
                        : [];

                    this.renderEngine.renderTooltipFromData(
                        [
                            header,
                            intervalsHeader,
                            ...intervalsTexts,
                            timingHeader,
                            ...timingTexts,
                            ...(metaTexts.length ? [metaHeader, ...metaTexts] : []),
                        ],
                        this.interactionsEngine.getGlobalMouse()
                    );
                }
            }

            return true;
        }

        return false;
    }

    override render() {
        const rightSide = this.renderEngine.positionX + this.renderEngine.getRealView();
        const leftSide = this.renderEngine.positionX;
        const blockHeight = this.renderEngine.blockHeight + 1;
        const stack: WatterfallPluginDataItem[] = [];
        const viewedData = this.data
            .filter(({ min, max }) => !((rightSide < min && rightSide < max) || (leftSide > max && rightSide > min)))
            .map((entry) => {
                while (stack.length && entry.min - stack[stack.length - 1].max > 0) {
                    stack.pop();
                }

                const level = stack.length;

                const result = {
                    ...entry,
                    level,
                };

                stack.push(entry);

                return result;
            });

        viewedData.forEach(({ name, intervals, textBlock, level, index }) => {
            const y = level * blockHeight - this.positionY;

            if (y + blockHeight >= 0 && y - blockHeight <= this.renderEngine.height) {
                const textStart = this.renderEngine.timeToPosition(textBlock.start);
                const textEnd = this.renderEngine.timeToPosition(textBlock.end);

                this.renderEngine.addTextToRenderQueue(name, textStart, y, textEnd - textStart);

                const { x, w } = intervals.reduce<{ x: number | null; w: number }>(
                    (acc, { color, start, end, type }, index) => {
                        const { x, w } = this.calcRect(start, end - start, index === intervals.length - 1);

                        if (type === 'block') {
                            this.renderEngine.addRectToRenderQueue(color, x, y, w);
                        } else if (type === 'line') {
                            // ToDo add other types
                        }

                        return {
                            x: acc.x === null ? x : acc.x,
                            w: w + acc.w,
                        };
                    },
                    { x: null, w: 0 }
                );

                if (this.selectedRegion && this.selectedRegion.type === 'waterfall-node') {
                    const selectedIndex = this.selectedRegion.data;

                    if (selectedIndex === index) {
                        this.renderEngine.addStrokeToRenderQueue('green', x ?? 0, y, w, this.renderEngine.blockHeight);
                    }
                }

                this.interactionsEngine.addHitRegion(
                    RegionTypes.WATERFALL_NODE,
                    index,
                    x ?? 0,
                    y,
                    w,
                    this.renderEngine.blockHeight
                );
            }
        }, 0);
    }
}
