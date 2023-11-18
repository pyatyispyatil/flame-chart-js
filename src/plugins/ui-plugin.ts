import { EventEmitter } from 'events';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';

export abstract class UIPlugin<S = {}> extends EventEmitter {
    name: string;
    abstract height?: number | 'flexible';

    interactionsEngine: SeparatedInteractionsEngine;
    renderEngine: OffscreenRenderEngine;

    min?: number;
    max?: number;
    styles?: S;

    protected constructor(name: string) {
        super();
        this.name = name;
    }

    get fullHeight() {
        return typeof this.height === 'number' ? this.height : 0;
    }

    init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;
    }

    postInit?(): void;

    render?(): boolean | undefined | void;

    setSettings?(settings: { styles: S }): void;

    renderTooltip?(): boolean;

    postRender?(): void;
}

export default UIPlugin;
