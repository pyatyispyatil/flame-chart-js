import { EventEmitter } from 'events';
import { RenderEngine } from './render-engine';
import { OffscreenRenderEngine } from './offscreen-render-engine';
import { HitRegion, Mouse } from '../types';
import { SeparatedInteractionsEngine } from './separated-interactions-engine';
export declare class InteractionsEngine extends EventEmitter {
    private renderEngine;
    private readonly canvas;
    private hitRegions;
    private instances;
    mouse: Mouse;
    selectedRegion: HitRegion | null;
    private hoveredRegion;
    private moveActive;
    private mouseDownPosition;
    private mouseDownHoveredInstance;
    private hoveredInstance;
    private currentCursor;
    constructor(canvas: HTMLCanvasElement, renderEngine: RenderEngine);
    makeInstance(renderEngine: OffscreenRenderEngine): SeparatedInteractionsEngine;
    reset(): void;
    destroy(): void;
    initListeners(): void;
    removeListeners(): void;
    handleMouseWheel(e: any): void;
    handleMouseDown(): void;
    handleMouseUp(): void;
    handleMouseMove(e: any): void;
    handleRegionHit(): void;
    checkRegionHover(): void;
    getHoveredRegion(): HitRegion | null | undefined;
    clearHitRegions(): void;
    addHitRegion(type: any, data: any, x: number, y: number, w: number, h: number, cursor: string): void;
    setCursor(cursor: string): void;
    clearCursor(): void;
}
//# sourceMappingURL=interactions-engine.d.ts.map