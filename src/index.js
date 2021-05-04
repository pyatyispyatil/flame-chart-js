import FlameChartContainer from './flame-chart-container.js';
import FlameChartPlugin from './plugins/flame-chart-plugin';
import TimeIndicatorsPlugin from './plugins/time-indicators-plugin.js';
import MarksPlugin from './plugins/marks-plugin.js';

export default class FlameChartBasic extends FlameChartContainer {
    constructor({
                    canvas,
                    data,
                    marks,
                    colors,
                    settings,
                    plugins = []
                }) {
        const flameChartPlugin = new FlameChartPlugin({ data, colors });

        flameChartPlugin.on('select', (node) => this.emit('select', node));

        const marksPlugin = new MarksPlugin(marks);

        const timeIndicatorsPlugin = new TimeIndicatorsPlugin();

        super({
            canvas,
            settings,
            plugins: [
                timeIndicatorsPlugin,
                marksPlugin,
                flameChartPlugin,
                ...plugins
            ]
        });
    }
}
