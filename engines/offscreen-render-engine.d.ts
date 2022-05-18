import { RenderSettings, BasicRenderEngine } from './basic-render-engine';
import { RenderEngine } from './render-engine';
import { Mouse, TooltipField } from '../types';
interface OffscreenRenderEngineOptions {
    width: number;
    height: number;
    parent: RenderEngine;
    id: number | undefined;
}
export declare class OffscreenRenderEngine extends BasicRenderEngine {
    parent: RenderEngine;
    id: number | undefined;
    children: OffscreenRenderEngine[];
    flexible: boolean;
    collapsed: boolean;
    position: number;
    constructor({ width, height, parent, id }: OffscreenRenderEngineOptions);
    makeChild(): OffscreenRenderEngine;
    setFlexible(): void;
    collapse(): void;
    expand(): void;
    setSettingsOverrides(settings: RenderSettings): void;
    resize({ width, height, position }: {
        width?: number;
        height?: number;
        position?: number;
    }, isParentCall?: boolean): void;
    setMinMax(min: number, max: number): void;
    setSettings(settings: RenderSettings): void;
    tryToChangePosition(positionDelta: number): void;
    recalcMinMax(): void;
    getTimeUnits(): any;
    getAccuracy(): number;
    renderTimeGrid(): void;
    renderTimeGridTimes(): void;
    standardRender(): void;
    renderTooltipFromData(fields: TooltipField[], mouse: Mouse): void;
    resetParentView(): void;
    render(): void;
}
export {};
//# sourceMappingURL=offscreen-render-engine.d.ts.map