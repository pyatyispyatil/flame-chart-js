import { EventEmitter } from 'events';

export default class UIPlugin extends EventEmitter {
    constructor() {
        super();
    }

    init(renderEngine, interactionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;
    }

    postInit() {}

    render() {}

    setSettings() {}

    renderTooltip() {}

    postRender() {}
}
