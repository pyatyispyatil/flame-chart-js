import UIPlugin from './ui-plugin';
import { Waterfall, WaterfallItems } from '../types';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
export declare type WaterfallPluginStyles = {
    defaultHeight: number;
};
declare type WatterfallPluginDataItem = {
    intervals: {
        start: number;
        end: number;
        color: string;
        name: string;
        type: 'block' | 'line';
    }[];
    index: number;
    max: number;
    min: number;
    name: string;
    textBlock: {
        start: number;
        end: number;
    };
    timing: Record<PropertyKey, number>;
    meta?: any[];
};
export declare type WaterfallPluginSettings = {
    styles?: Partial<WaterfallPluginStyles>;
};
export declare const defaultWaterfallPluginStyles: WaterfallPluginStyles;
export default class WaterfallPlugin extends UIPlugin<WaterfallPluginStyles> {
    name: string;
    styles: WaterfallPluginStyles;
    height: number;
    data: WatterfallPluginDataItem[];
    positionY: number;
    hoveredRegion: any;
    selectedRegion: any;
    initialData: WaterfallItems;
    constructor({ items, intervals }: Waterfall, settings: WaterfallPluginSettings);
    init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine): void;
    handlePositionChange({ deltaX, deltaY }: {
        deltaX: number;
        deltaY: number;
    }): void;
    handleMouseUp(): void;
    handleHover(region: any): void;
    handleSelect(region: any): void;
    setPositionY(y: number): void;
    setSettings({ styles }: WaterfallPluginSettings): void;
    setData({ items: data, intervals: commonIntervals }: Waterfall): void;
    calcRect(start: number, duration: number, isEnd: boolean): {
        x: number;
        w: number;
    };
    renderTooltip(): boolean;
    render(): void;
}
export {};
//# sourceMappingURL=waterfall-plugin.d.ts.map