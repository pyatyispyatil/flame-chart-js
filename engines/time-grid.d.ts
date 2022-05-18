import { RenderEngine } from './render-engine';
import { OffscreenRenderEngine } from './offscreen-render-engine';
export declare type TimeGridStyles = {
    color: string;
};
export declare type TimeGridSettings = {
    styles?: Partial<TimeGridStyles>;
};
export declare const defaultTimeGridStyles: TimeGridStyles;
export declare class TimeGrid {
    renderEngine: OffscreenRenderEngine | RenderEngine;
    start: number;
    end: number;
    accuracy: number;
    delta: number;
    styles: TimeGridStyles;
    timeUnits: any;
    constructor(settings: TimeGridSettings);
    setDefaultRenderEngine(renderEngine: OffscreenRenderEngine | RenderEngine): void;
    setSettings({ styles }: TimeGridSettings): void;
    recalc(): void;
    calcNumberFix(): number;
    getTimelineAccuracy(): number;
    forEachTime(cb: (pixelPosition: number, timePosition: number) => void): void;
    renderLines(start: number, height: number, renderEngine?: OffscreenRenderEngine | RenderEngine): void;
    renderTimes(renderEngine?: OffscreenRenderEngine | RenderEngine): void;
}
//# sourceMappingURL=time-grid.d.ts.map