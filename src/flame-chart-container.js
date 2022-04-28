import { RenderEngine } from './engines/render-engine.js';
import { InteractionsEngine } from './engines/interactions-engine.js';
import { EventEmitter } from 'events';

const defaultSettings = {
    performance: true,
    timeUnits: 'ms'
}

export default class FlameChartContainer extends EventEmitter {
    constructor({ canvas, plugins, settings }) {
        super();

        this.renderEngine = new RenderEngine(canvas, settings, plugins);
        this.interactionsEngine = new InteractionsEngine(canvas, this.renderEngine);
        this.plugins = plugins;

        const children = Array(this.plugins.length).fill(null).map(() => {
            const renderEngine = this.renderEngine.makeInstance();
            const interactionsEngine = this.interactionsEngine.makeInstance(renderEngine);

            return {renderEngine, interactionsEngine};
        })

        this.plugins.forEach((plugin, index) => {
            plugin.init(
                children[index].renderEngine,
                children[index].interactionsEngine
            );
        });

        this.renderEngine.calcMinMax();
        this.renderEngine.resetView();
        this.renderEngine.recalcChildrenSizes();
        this.renderEngine.calcTimeGrid();

        this.plugins.forEach((plugin) => plugin.postInit && plugin.postInit());
        // Initialize flame chart position to 0, just in case.
        this.renderEngine.setFlameChartPositionY(0);

        this.renderEngine.render();
    }

    render() {
        this.renderEngine.render();
    }

    resize(width, height) {
        this.renderEngine.resize(width, height);
        this.renderEngine.render();
    }

    execOnPlugins(fnName, ...args) {
        let index = 0;

        while (index < this.plugins.length) {
            if (this.plugins[index][fnName]) {
                this.plugins[index][fnName](...args);
            }

            index++;
        }
    }

    setSettings(data) {
        this.renderEngine.setSettings(data);
        this.renderEngine.render();
    }

    setZoom(start, end) {
        const zoom = this.renderEngine.width / (end - start);

        this.renderEngine.setPositionX(start);
        this.renderEngine.setZoom(zoom);
        this.renderEngine.render();
    };
}
