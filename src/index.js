import { FlameChart } from './flame-chart.js';
import { FlameChartPlugin } from './plugins/flame-chart-plugin.js';
import { TimeMarksPlugin } from './plugins/time-marks-plugin.js';

export default class FlameChartBasic extends FlameChart {
    constructor({
                    canvas,
                    data,
                    timestamps,
                    colors,
                    settings
                }) {
        const flameChartPlugin = new FlameChartPlugin({ data, colors });
        flameChartPlugin.on('select', (node) => this.emit('select', node));

        const timeMarksPlugin = new TimeMarksPlugin();

        super({
            canvas,
            settings,
            plugins: [
                timeMarksPlugin,
                flameChartPlugin
            ]
        });
    }
}
