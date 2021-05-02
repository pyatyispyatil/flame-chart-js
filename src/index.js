import { FlameChart } from './flame-chart.js';
import { FlameChartPlugin } from './plugins/flame-chart-plugin.js';

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

        super({
            canvas,
            settings,
            plugins: [
                flameChartPlugin
            ]
        });
    }
}
