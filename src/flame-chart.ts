import FlameChartContainer, { FlameChartContainerSettings } from './flame-chart-container';
import { TogglePluginStyles } from './plugins/toggle-plugin';
import FlameChartPlugin from './plugins/flame-chart-plugin';
import { Colors, Data, Marks, Waterfall } from './types';
import UIPlugin from './plugins/ui-plugin';

export type FlameChartStyles = {
    togglePlugin?: Partial<TogglePluginStyles>;
};

export type FlameChartSettings = {
    headers?: Partial<{
        waterfall: string;
        flameChart: string;
    }>;
} & FlameChartContainerSettings<FlameChartStyles>;

export type FlameChartOptions = {
    canvas: HTMLCanvasElement;
    data?: Data;
    marks?: Marks;
    waterfall?: Waterfall;
    colors?: Colors;
    settings?: FlameChartSettings;
    plugins?: UIPlugin[];
};

const defaultSettings: FlameChartSettings = {};

export default class FlameChart extends FlameChartContainer<FlameChartStyles> {
    setData: (data: Data, keepYposition, newYPosition, resetSelected) => void;
    setMarks: (data: Marks) => void;
    setWaterfall: (data: Waterfall) => void;
    setFlameChartPosition: ({ x, y }: { x: number; y: number }) => void;

    constructor({ canvas, data, colors, settings = defaultSettings, plugins = [] }: FlameChartOptions) {
        const activePlugins: UIPlugin[] = [];

        let flameChartPlugin: FlameChartPlugin | undefined;

        if (data) {
            flameChartPlugin = new FlameChartPlugin({ data, colors });
            //flameChartPlugin.on('select', (node, type) => this.emit('select', node, type));
            flameChartPlugin.on('mousedown', (node, type) => this.emit('mousedown', node, type));
            flameChartPlugin.on('mouseup', (node, type) => this.emit('mouseup', node, type));
            flameChartPlugin.on('mouseout', (mouse) => this.emit('mouseout', mouse));

            flameChartPlugin.on('dblclick', (mouse) => this.emit('dblclick', mouse));
            flameChartPlugin.on('rightClick', (node, mouse) => this.emit('rightClick', node, mouse));

            activePlugins.push(flameChartPlugin);
        }

        super({
            canvas,
            settings,
            plugins: [...activePlugins, ...plugins],
        });

        if (flameChartPlugin) {
            this.setData = (data, keepYposition = false, newYPosition = 0, resetSelected = true) => {
                if (flameChartPlugin) {
                    flameChartPlugin.setData(data, keepYposition, newYPosition, resetSelected);
                }
            };

            this.setFlameChartPosition = ({ x, y }) => {
                if (typeof x === 'number') {
                    this.renderEngine.setPositionX(x);
                }

                if (typeof y === 'number' && flameChartPlugin) {
                    flameChartPlugin.setPositionY(y);
                }

                this.renderEngine.render();
            };
        }
    }
}
