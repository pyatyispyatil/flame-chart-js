import { EventEmitter } from 'events';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
export default abstract class UIPlugin<S = {}> extends EventEmitter {
    abstract name: string;
    abstract height?: number;
    interactionsEngine: SeparatedInteractionsEngine;
    renderEngine: OffscreenRenderEngine;
    min?: number;
    max?: number;
    styles?: S;
    protected constructor();
    init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine): void;
    postInit?(): any;
    render?(): any;
    setSettings?(settings: {
        styles: S;
    }): void;
    renderTooltip?(): any;
    postRender?(): any;
}
//# sourceMappingURL=ui-plugin.d.ts.map