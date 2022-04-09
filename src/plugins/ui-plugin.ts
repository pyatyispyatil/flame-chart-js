import { EventEmitter } from 'events';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';

export default abstract class UIPlugin<S = {}> extends EventEmitter {
    interactionsEngine: SeparatedInteractionsEngine;
    renderEngine: OffscreenRenderEngine;

    min?: number;
    max?: number;
    abstract height?: number;
    styles?: S;

    protected constructor() {
        super();
    }

    init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;
    }

    postInit?();

    render?();

    setSettings?(settings: Record<string, any>): void;

    renderTooltip?();

    postRender?();
}
