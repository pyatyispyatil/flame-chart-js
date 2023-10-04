import { last, mergeObjects } from '../utils';
import UIPlugin from './ui-plugin';
import { HitRegion, RegionTypes, Waterfall, WaterfallItems } from '../types';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
import { parseWaterfall, PreparedWaterfallItem } from './utils/waterfall-parser';

export type WaterfallPluginStyles = {
    defaultHeight: number;
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

    data: PreparedWaterfallItem[] = [];
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

    setData(waterfall: Waterfall) {
        this.positionY = 0;

        this.initialData = waterfall.items;
        this.data = parseWaterfall(waterfall);

        if (waterfall.items.length) {
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
                        this.interactionsEngine.getGlobalMouse(),
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
        const stack: PreparedWaterfallItem[] = [];
        const viewedData = this.data
            .filter(({ min, max }) => !((rightSide < min && rightSide < max) || (leftSide > max && rightSide > min)))
            .map((entry) => {
                while (stack.length && entry.min - last(stack).max > 0) {
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
                    { x: null, w: 0 },
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
                    this.renderEngine.blockHeight,
                );
            }
        }, 0);
    }
}
