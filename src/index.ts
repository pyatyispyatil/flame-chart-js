import type { FlameChartCreationOptions, Marks, Data } from "./types";

import FlameChartContainer from './flame-chart-container';
import FlameChartPlugin from './plugins/flame-chart-plugin';
import TimeGridPlugin from './plugins/time-grid-plugin';
import MarksPlugin from './plugins/marks-plugin';
import TimeframeSelectorPlugin from './plugins/timeframe-selector-plugin';

export { default as FlameChartContainer } from './flame-chart-container';
export { default as FlameChartPlugin } from './plugins/flame-chart-plugin';
export { default as TimeGridPlugin } from './plugins/time-grid-plugin';
export { default as MarksPlugin } from './plugins/marks-plugin';
export { default as TimeframeSelectorPlugin } from './plugins/timeframe-selector-plugin';

export default class FlameChart extends FlameChartContainer {
    public setData: (data: Data) => void;
    public setMarks: (marks: Marks) => void;
    public setZoom: (start, end) => void;
    public setFlameChartPosition: ({x, y}: { x: number; y: number }) => void;

    constructor({
                    canvas,
                    data,
                    marks,
                    colors,
                    settings,
                    plugins = []
                }: FlameChartCreationOptions) {
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

        this.setMarks = (marks) => {
            marksPlugin.setMarks(marks);
        };

        this.setZoom = (start, end) => {
            const zoom = this.renderEngine.width / (end - start);

            this.renderEngine.setPositionX(start);
            this.renderEngine.setZoom(zoom);
            this.renderEngine.render();
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
}
