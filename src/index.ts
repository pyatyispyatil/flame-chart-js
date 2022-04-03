import FlameChartContainer from './flame-chart-container';
import FlameChartPlugin from './plugins/flame-chart-plugin';
import TimeGridPlugin from './plugins/time-grid-plugin';
import MarksPlugin from './plugins/marks-plugin';
import TimeframeSelectorPlugin from './plugins/timeframe-selector-plugin';
import WaterfallPlugin from './plugins/waterfall-plugin';
import TogglePlugin from './plugins/toggle-plugin';
import { Colors, Data, Marks, Waterfall } from './types';

export { default as FlameChartContainer } from './flame-chart-container';
export { default as FlameChartPlugin } from './plugins/flame-chart-plugin';
export { default as TimeGridPlugin } from './plugins/time-grid-plugin';
export { default as MarksPlugin } from './plugins/marks-plugin';
export { default as TimeframeSelectorPlugin } from './plugins/timeframe-selector-plugin';
export { default as WaterfallPlugin } from './plugins/waterfall-plugin';
export { default as TogglePlugin } from './plugins/toggle-plugin';

interface FlameChartOptions {
    canvas: HTMLCanvasElement;
    data: Data;
    marks?: Marks;
    waterfall?: Waterfall;
    colors: Colors;
    settings: Record<string, any>;
    plugins: any[];
}

export default class FlameChart extends FlameChartContainer {
    setData: (data: Data) => void;
    setMarks: (data: Marks) => void;
    setWaterfall: (data: Waterfall) => void;
    setFlameChartPosition: ({ x, y }: { x: number; y: number }) => void;
    constructor({ canvas, data, marks, waterfall, colors, settings = {}, plugins = [] }: FlameChartOptions) {
        const activePlugins = [];
        const { headers: { waterfall: waterfallName = 'waterfall', flameChart: flameChartName = 'flame chart' } = {} } =
            settings as Record<string, any>;

        let timeGridPlugin: TimeGridPlugin;
        let marksPlugin: MarksPlugin;
        let waterfallPlugin: WaterfallPlugin;
        let timeframeSelectorPlugin: TimeframeSelectorPlugin;
        let flameChartPlugin: FlameChartPlugin;

        timeGridPlugin = new TimeGridPlugin(settings);
        activePlugins.push(timeGridPlugin);

        if (marks) {
            marksPlugin = new MarksPlugin(marks);
            marksPlugin.on('select', (node, type) => this.emit('select', node, type));

            activePlugins.push(marksPlugin);
        }

        if (waterfall) {
            waterfallPlugin = new WaterfallPlugin(waterfall, settings);
            waterfallPlugin.on('select', (node, type) => this.emit('select', node, type));

            if (data) {
                activePlugins.push(new TogglePlugin(waterfallName, settings));
            }

            activePlugins.push(waterfallPlugin);
        }

        if (data) {
            timeframeSelectorPlugin = new TimeframeSelectorPlugin(data, settings);
            flameChartPlugin = new FlameChartPlugin({ data, colors });
            flameChartPlugin.on('select', (node, type) => this.emit('select', node, type));

            if (waterfall) {
                activePlugins.push(new TogglePlugin(flameChartName, settings));
            }

            activePlugins.push(flameChartPlugin);
            activePlugins.unshift(timeframeSelectorPlugin);
        }

        super({
            canvas,
            settings,
            plugins: [...activePlugins, ...plugins],
        });

        if (flameChartPlugin && timeframeSelectorPlugin) {
            this.setData = (data) => {
                flameChartPlugin.setData(data);
                timeframeSelectorPlugin.setData(data);
            };

            this.setFlameChartPosition = ({ x, y }) => {
                if (typeof x === 'number') {
                    this.renderEngine.setPositionX(x);
                }

                if (typeof y === 'number') {
                    flameChartPlugin.setPositionY(y);
                }

                this.renderEngine.render();
            };
        }

        if (marksPlugin) {
            this.setMarks = (data) => {
                marksPlugin.setMarks(data);
            };
        }

        if (waterfallPlugin) {
            this.setWaterfall = (data) => {
                waterfallPlugin.setData(data);
            };
        }
    }
}
