import { EventEmitter } from 'events';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/interactions-engine';

export default class UIPlugin extends EventEmitter {
    interactionsEngine: SeparatedInteractionsEngine;
    renderEngine: OffscreenRenderEngine;
    constructor() {
        super();
    }

    init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;
    }

    postInit() {}

    render() {}

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars --
     unused argument, to keep signature compatible with children
     */
    setSettings(settings) {}

    renderTooltip() {}

    postRender() {}
}
