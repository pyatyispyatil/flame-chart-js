import { EventEmitter } from 'events';
import { OffscreenRenderEngine } from './offscreen-render-engine';
import { HitRegion } from '../types';
import { InteractionsEngine } from './interactions-engine';
export declare class SeparatedInteractionsEngine extends EventEmitter {
    static count: number;
    parent: InteractionsEngine;
    renderEngine: OffscreenRenderEngine;
    private readonly id;
    hitRegions: HitRegion[];
    static getId(): number;
    constructor(parent: InteractionsEngine, renderEngine: OffscreenRenderEngine);
    resend(event: any, ...args: any[]): void;
    getMouse(): {
        x: number;
        y: number;
    };
    getGlobalMouse(): import("../types").Mouse;
    clearHitRegions(): void;
    addHitRegion(type: any, data: any, x: number, y: number, w: number, h: number, cursor?: string): void;
    setCursor(cursor: string): void;
    clearCursor(): void;
}
//# sourceMappingURL=separated-interactions-engine.d.ts.map