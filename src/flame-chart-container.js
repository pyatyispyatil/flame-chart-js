import { RenderEngine } from './engines/render-engine.js';
import { InteractionsEngine } from './engines/interactions-engine.js';
import { EventEmitter } from 'events';

const defaultSettings = {
    performance: true,
    font: `12px`,
    nodeHeight: 16,
    timeUnits: 'ms'
}

/*
* ToDo:
* data updating in plugins
* naming
* collapsing
* public interface
*
* timeframe selector
* network
* */

export default class FlameChartContainer extends EventEmitter {
    constructor({ canvas, plugins, settings }) {
        super();

        this.setSettings(settings);

        this.renderEngine = new RenderEngine(canvas, this.settings, plugins);
        this.interactionsEngine = new InteractionsEngine(canvas, this.renderEngine);
        this.plugins = plugins;

        this.calcMinMax();
        this.renderEngine.initView();

        this.plugins.forEach((plugin) => {
            const renderEngine = this.renderEngine.makeInstance();
            const interactionsEngine = this.interactionsEngine.makeInstance(renderEngine);

            plugin.init(
                renderEngine,
                interactionsEngine
            );
        });

        this.renderEngine.recalcChildrenSizes();

        this.render();
    }

    render() {
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

    calcMinMax() {
        const { min, max } = this.plugins
            .filter((plugin) => plugin.getMinMax)
            .map((plugin) => plugin.getMinMax())
            .reduce((acc, { min, max }) => ({
                min: Math.min(acc.min, min),
                max: Math.max(acc.max, max),
            }));

        this.min = min;
        this.max = max;

        this.renderEngine.setMinMax(this.min, this.max);
    }

    setSettings(settings = {}) {
        this.settings = {
            ...defaultSettings,
            ...settings
        }
    }
}
