export default class TemplatePlugin {
    constructor() {
    }

    init(renderEngine, interactionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;

        this.height = 0;
    }

    getMinMax() {
        return {
            min: 0,
            max: 0
        }
    }

    render() {

    }

    renderTooltip() {

    }

    postRender() {

    }
}
