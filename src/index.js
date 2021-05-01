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
        super({
            canvas,
            settings,
            plugins: [
                new FlameChartPlugin({ data, colors })
            ]
        });
    }
}
