import { RenderEngine } from './engines/render-engine.js';
import { InteractionsEngine } from './engines/interactions-engine.js';
import { EventEmitter } from 'events';

const defaultSettings = {
    performance: true,
    font: `12px`,
    nodeHeight: 16,
    timeUnits: 'ms'
}

export default class FlameChartContainer extends EventEmitter {
    constructor({ canvas, plugins, settings }) {
        super();

        this.setSettings(settings);

        this.renderEngine = new RenderEngine(canvas, this.settings, plugins);
        this.interactionsEngine = new InteractionsEngine(canvas, this.renderEngine);
        this.plugins = plugins;

        this.plugins.forEach((plugin) => {
            const renderEngine = this.renderEngine.makeInstance();
            const interactionsEngine = this.interactionsEngine.makeInstance(renderEngine);

            plugin.init(
                renderEngine,
                interactionsEngine
            );
        });

        this.renderEngine.calcMinMax();
        this.renderEngine.resetView();
        this.renderEngine.recalcChildrenSizes();
        this.renderEngine.render();
    }

    resize(width, height) {
        this.renderEngine.resize(width, height);
        this.renderEngine.render();
    }

    execOnPlugins(fnName, ...args) {
        let handled = false;
        let index = 0;

        while (!handled && index < this.plugins.length) {
            if (this.plugins[index][fnName]) {
                this.plugins[index][fnName](...args);
                index++;
            }
        }
    }

    setSettings(settings = {}) {
        this.settings = {
            ...defaultSettings,
            ...settings
        }
    }
}
