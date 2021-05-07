import FlameChartContainer from './flame-chart-container.js';
import FlameChartPlugin from './plugins/flame-chart-plugin';
import TimeGridPlugin from './plugins/time-grid-plugin.js';
import MarksPlugin from './plugins/marks-plugin.js';
import TimeframeSelectorPlugin from './plugins/timeframe-selector-plugin.js';

export { default as FlameChartContainer } from './flame-chart-container.js';
export { default as FlameChartPlugin } from './plugins/flame-chart-plugin';
export { default as TimeGridPlugin } from './plugins/time-grid-plugin.js';
export { default as MarksPlugin } from './plugins/marks-plugin.js';
export { default as TimeframeSelectorPlugin } from './plugins/timeframe-selector-plugin.js';

export default class FlameChart extends FlameChartContainer {
    constructor({
                    canvas,
                    data,
                    marks,
                    colors,
                    settings,
                    plugins = []
                }) {
        const flameChartPlugin = new FlameChartPlugin({ data, colors });
        const marksPlugin = new MarksPlugin(marks);
        const timeGridPlugin = new TimeGridPlugin(settings);
        const timeframeSelectorPlugin = new TimeframeSelectorPlugin(data, settings);

        flameChartPlugin.on('select', (node) => this.emit('select', node));

        super({
            canvas,
            settings,
            plugins: [
                timeframeSelectorPlugin,
                timeGridPlugin,
                marksPlugin,
                flameChartPlugin,
                ...plugins
            ]
        });

        this.setData = (data) => {
            flameChartPlugin.setData(data);
            timeframeSelectorPlugin.setData(data);
        };

        this.setMarks = (data) => {
            marksPlugin.setMarks(data);
        };
    }
}
