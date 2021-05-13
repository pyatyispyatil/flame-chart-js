import { RenderEngine } from "../engines/render-engine";
import { InteractionsEngine } from "../engines/interactions-engine";

export default class TemplatePlugin {
    private renderEngine: RenderEngine | undefined;
    private interactionsEngine: InteractionsEngine | undefined;
    private height = 0;
    private min = 0;
    private max = 1000;
    constructor() {
    }

    init(renderEngine: RenderEngine, interactionsEngine: InteractionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;

        this.height = 0;
        this.min = 0;
        this.max = 1000;
    }

    postInit() {

    }

    render() {

    }

    setSettings() {

    }

    renderTooltip() {

    }

    postRender() {

    }
}
