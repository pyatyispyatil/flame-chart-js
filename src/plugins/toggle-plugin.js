import { deepMerge } from '../utils.js';

const defaultTogglePluginSettings = {
    styles: {
        togglePlugin: {
            height: 16,
            color: 'rgb(202,202,202)',
            strokeColor: 'rgb(138,138,138)',
            fontColor: 'black',
            font: '10px sans-serif',
            triangleWidth: 10,
            triangleHeight: 7,
            leftPadding: 10
        }
    }
};

export default class CommonPlugin {
    constructor(title, settings) {
        this.setSettings(settings);
        this.title = title;
    }

    setSettings(data) {
        this.settings = deepMerge(defaultTogglePluginSettings, data);
        this.styles = this.settings.styles.togglePlugin;

        this.height = this.styles.height + 1;
    }

    init(renderEngine, interactionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;

        this.interactionsEngine.on('click', (region) => {
            if (region && region.type === 'toggle' && region.data === this.renderEngine.id) {
                const nextEngine = this.getNextEngine();

                if (nextEngine.collapsed) {
                    nextEngine.expand();
                } else {
                    nextEngine.collapse();
                }

                this.renderEngine.parent.recalcChildrenSizes();
                this.renderEngine.parent.render();
            }
        });

        const prevEngine = this.getPrevEngine();
        const nextEngine = this.getNextEngine();

        prevEngine.setFlexible();
        nextEngine.setFlexible();
    }

    getPrevEngine() {
        return this.renderEngine.parent.childEngines[this.renderEngine.id - 1];
    }

    getNextEngine() {
        return this.renderEngine.parent.childEngines[this.renderEngine.id + 1];
    }

    render() {
        const nextPlugin = this.getNextEngine();
        const triangleFullWidth = this.styles.leftPadding + this.styles.triangleWidth;

        this.interactionsEngine.clearHitRegions();

        this.renderEngine.setCtxFont(this.styles.font);

        this.renderEngine.setCtxColor(this.styles.color);
        this.renderEngine.setStrokeColor(this.styles.strokeColor);
        this.renderEngine.fillRect(0, 0, this.renderEngine.width, this.styles.height);

        this.renderEngine.setCtxColor(this.styles.fontColor);
        this.renderEngine.addTextToRenderQueue(this.title, triangleFullWidth, 0, this.renderEngine.width);
        this.renderEngine.renderTriangle('black', this.styles.leftPadding, 0 + this.styles.height / 2, this.styles.triangleWidth, this.styles.triangleHeight, nextPlugin.collapsed ? 'right' : 'bottom');

        const { width: titleWidth } = this.renderEngine.ctx.measureText(this.title)
        const buttonWidth = titleWidth + triangleFullWidth;

        this.interactionsEngine.addHitRegion('toggle', this.renderEngine.id, 0, 0, buttonWidth, this.styles.height, 'pointer');
    }
}
