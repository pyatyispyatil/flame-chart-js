import { RenderEngine } from './render-engine.js';
import { TimeIndicators } from './time-indicators.js';
import { InteractionsEngine } from './interactions-engine.js';
import { EventEmitter } from 'events';

/*
plugins interface

--fns
handleHover
handleSelect
handleAccuracyChange
render
renderTooltip
getMinMax
init

--args
getCurrentAccuracy

--events

 */


const defaultSettings = {
    performance: true,
    font: `12px`,
    nodeHeight: 16,
    timeUnits: 'ms'
}

export class FlameChart extends EventEmitter {
    constructor({ canvas, plugins }) {
        super();

        this.renderEngine = new RenderEngine(canvas);
        this.timeIndicators = new TimeIndicators(this.renderEngine);
        this.interactionsEngine = new InteractionsEngine(canvas, this.renderEngine);
        this.plugins = plugins;

        this.calcMinMax();
        this.renderEngine.initView();

        this.plugins.forEach((plugin) => plugin.init(
            this.renderEngine.makeInstance(plugin.height || this.renderEngine.height),
            this.interactionsEngine
        ));

        this.interactionsEngine.on('hover', (region, mouse) => {
            if (region) {
                this.execOnPlugins('handleHover', region, mouse);
            }
        });

        this.interactionsEngine.on('select', (region, mouse) => {
            if (region) {
                this.execOnPlugins('handleSelect', region, mouse);
            }
        });

        this.renderEngine.on('change-zoom', () => {
            this.timeIndicators.calcTimeline();
            this.plugins.forEach((plugin) => plugin.handleAccuracyChange(this.timeIndicators.accuracy));
        });

        this.renderEngine.on('render', () => this.render())

        this.render();
    }

    render() {
        this.plugins.forEach((p) => p.render());
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

    renderTooltip() {
        if (this.hoveredRegion) {
            this.execOnPlugins('renderTooltip', this.hoveredRegion);
        }
    }

    calcMinMax() {
        const { min, max } = this.plugins.map((plugin) => plugin.getMinMax()).reduce((acc, { min, max }) => ({
            min: Math.min(acc.min, min),
            max: Math.max(acc.max, max),
        }));

        this.min = min;
        this.max = max;

        this.timeIndicators.setMinMax(this.min, this.max);
        this.renderEngine.setMinMax(this.min, this.max);
    }

    setSettings(settings) {
        const fullSettings = {
            ...defaultSettings,
            ...settings
        }

        this.isPerformanceMode = fullSettings.performance;
        this.font = fullSettings.font;
        this.nodeHeight = fullSettings.nodeHeight;
        this.timeUnits = fullSettings.timeUnits;

        if (update) {
            this.update();
        }
    }
}
