import FlameChartContainer from './flame-chart-container.js';
import FlameChartPlugin from './plugins/flame-chart-plugin.js';
import TimeGridPlugin from './plugins/time-grid-plugin.js';
import MarksPlugin from './plugins/marks-plugin.js';
import TimeframeSelectorPlugin from './plugins/timeframe-selector-plugin.js';
import WaterfallPlugin from './plugins/waterfall-plugin.js';
import TogglePlugin from './plugins/toggle-plugin.js';

export { default as FlameChartContainer } from './flame-chart-container.js';
export { default as FlameChartPlugin } from './plugins/flame-chart-plugin.js';
export { default as TimeGridPlugin } from './plugins/time-grid-plugin.js';
export { default as MarksPlugin } from './plugins/marks-plugin.js';
export { default as TimeframeSelectorPlugin } from './plugins/timeframe-selector-plugin.js';
export { default as WaterfallPlugin } from './plugins/waterfall-plugin.js';
export { default as TogglePlugin } from './plugins/toggle-plugin.js';

export default class FlameChart extends FlameChartContainer {
    constructor({
                    canvas,
                    data,
                    marks,
                    waterfall,
                    colors,
                    settings = {},
                    plugins = []
                }) {
        const activePlugins = [];
        const {
            headers: {
                waterfall: waterfallName = 'waterfall',
                flameChart: flameChartName = 'flame chart'
            } = {}
        } = settings;

        let timeGridPlugin;
        let marksPlugin;
        let waterfallPlugin;
        let timeframeSelectorPlugin;
        let flameChartPlugin;

        timeGridPlugin = new TimeGridPlugin(settings);
        activePlugins.push(timeGridPlugin);

        if (marks) {
            marksPlugin = new MarksPlugin(marks);
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
            plugins: [
                ...activePlugins,
                ...plugins
            ]
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
            }
        }

        if (marksPlugin) {
            this.setMarks = (data) => {
                marksPlugin.setMarks(data);
            };
        }

        if (waterfallPlugin) {
            this.setWaterfall = (data) => {
                waterfallPlugin.setData(data);
            }
        }
    }
}
