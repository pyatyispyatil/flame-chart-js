import { RenderEngine } from './engines/render-engine';
import { InteractionsEngine } from './engines/interactions-engine';
import { EventEmitter } from 'events';

interface FlameChartContainerOptions {
    canvas: HTMLCanvasElement;
    plugins: any[];
    settings: Record<string, any>;
}

export default class FlameChartContainer extends EventEmitter {
    renderEngine: RenderEngine;
    interactionsEngine: InteractionsEngine;
    plugins;
    constructor({ canvas, plugins, settings }: FlameChartContainerOptions) {
        super();

        this.renderEngine = new RenderEngine(canvas, settings, plugins);
        this.interactionsEngine = new InteractionsEngine(canvas, this.renderEngine);
        this.plugins = plugins;

        const children = Array(this.plugins.length)
            .fill(null)
            .map(() => {
                const renderEngine = this.renderEngine.makeInstance();
                const interactionsEngine = this.interactionsEngine.makeInstance(renderEngine);

                return { renderEngine, interactionsEngine };
            });

        this.plugins.forEach((plugin, index) => {
            plugin.init(children[index].renderEngine, children[index].interactionsEngine);
        });

        this.renderEngine.calcMinMax();
        this.renderEngine.resetView();
        this.renderEngine.recalcChildrenSizes();
        this.renderEngine.calcTimeGrid();

        this.plugins.forEach((plugin) => plugin.postInit && plugin.postInit());

        this.renderEngine.render();
    }

    render() {
        this.renderEngine.render();
    }

    resize(width: number, height: number) {
        this.renderEngine.resize(width, height);
        this.renderEngine.render();
    }

    execOnPlugins(fnName: string, ...args) {
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

    setZoom(start: number, end: number) {
        const zoom = this.renderEngine.width / (end - start);

        this.renderEngine.setPositionX(start);
        this.renderEngine.setZoom(zoom);
        this.renderEngine.render();
    }
}
