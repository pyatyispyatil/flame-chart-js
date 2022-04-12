import { RenderEngine } from './engines/render-engine';
import { InteractionsEngine } from './engines/interactions-engine';
import { EventEmitter } from 'events';
import { TimeGrid, TimeGridStyles } from './engines/time-grid';
import { RenderOptions, RenderStyles } from './engines/basic-render-engine';
import UIPlugin from './plugins/ui-plugin';

export type FlameChartContainerStyles<Styles> = {
    timeGrid?: Partial<TimeGridStyles>;
    main?: Partial<RenderStyles>;
} & Styles;

export interface FlameChartContainerSettings<Styles> {
    options?: Partial<RenderOptions>;
    styles?: FlameChartContainerStyles<Styles>;
}

export interface FlameChartContainerOptions<Styles> {
    canvas: HTMLCanvasElement;
    plugins: any[];
    settings: FlameChartContainerSettings<Styles>;
}

export default class FlameChartContainer<Styles> extends EventEmitter {
    renderEngine: RenderEngine;
    interactionsEngine: InteractionsEngine;
    plugins: UIPlugin[];
    timeGrid: TimeGrid;

    constructor({ canvas, plugins, settings }: FlameChartContainerOptions<Styles>) {
        super();

        const styles = settings?.styles ?? ({} as typeof settings.styles);

        this.timeGrid = new TimeGrid({ styles: styles?.timeGrid });
        this.renderEngine = new RenderEngine({
            canvas,
            settings: {
                styles: styles?.main,
                options: settings.options,
            },
            plugins,
            timeGrid: this.timeGrid,
        });
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

        this.plugins.forEach((plugin) => plugin.postInit?.());

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

    setSettings(settings: FlameChartContainerSettings<Styles>) {
        this.timeGrid.setSettings({ styles: settings.styles?.timeGrid });
        this.renderEngine.setSettings({ options: settings.options, styles: settings.styles?.main });
        this.plugins.forEach((plugin) => plugin.setSettings?.({ styles: settings.styles?.[plugin.name] }));
        this.renderEngine.render();
    }

    setZoom(start: number, end: number) {
        const zoom = this.renderEngine.width / (end - start);

        this.renderEngine.setPositionX(start);
        this.renderEngine.setZoom(zoom);
        this.renderEngine.render();
    }
}
