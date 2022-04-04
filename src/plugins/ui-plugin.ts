import { EventEmitter } from 'events';
import type { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import type { SeparatedInteractionsEngine } from '../engines/interactions-engine';

export default abstract class UIPlugin extends EventEmitter {
    interactionsEngine: SeparatedInteractionsEngine;
    renderEngine: OffscreenRenderEngine;

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
