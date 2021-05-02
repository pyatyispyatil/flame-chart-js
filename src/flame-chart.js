import { RenderEngine } from './render-engine.js';
import { TimeIndicators } from './time-indicators.js';
import { InteractionsEngine } from './interactions-engine.js';
import { EventEmitter } from 'events';

/*
plugins interface

--fns
handleHover
handleSelect
render
getMinMax
init

--args

--events

 */


const defaultSettings = {
    performance: true,
    font: `12px`,
    nodeHeight: 16,
    timeUnits: 'ms'
}

export class FlameChart extends EventEmitter {
    constructor({ canvas, plugins, settings }) {
        super();

        this.setSettings(settings);

        this.renderEngine = new RenderEngine(canvas, this.settings);
        this.interactionsEngine = new InteractionsEngine(canvas, this.renderEngine);
        this.plugins = plugins;

        this.calcMinMax();
        this.renderEngine.initView();

        this.plugins.forEach((plugin) => plugin.init(
            this.renderEngine.makeInstance(() => plugin.height),
            this.interactionsEngine
        ));

        this.renderEngine.calcOffscreenRenderCanvasesSizes();

        this.interactionsEngine.on('hover', (region, mouse) => {
            this.execOnPlugins('handleHover', region, mouse);
        });

        this.interactionsEngine.on('select', (region, mouse) => {
            this.execOnPlugins('handleSelect', region, mouse);
        });

        this.renderEngine.on('render', () => this.render());

        this.render();
    }

    render() {
        this.renderEngine.render(this.plugins);
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

    renderTooltip() {
        if (this.hoveredRegion) {
            this.execOnPlugins('renderTooltip', this.hoveredRegion);
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
