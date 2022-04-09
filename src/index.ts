import FlameChartContainer, { FlameChartContainerSettings } from './flame-chart-container';
import FlameChartPlugin from './plugins/flame-chart-plugin';
import TimeGridPlugin, { TimeGridPluginStyles } from './plugins/time-grid-plugin';
import MarksPlugin from './plugins/marks-plugin';
import TimeframeSelectorPlugin, { TimeframeSelectorPluginStyles } from './plugins/timeframe-selector-plugin';
import WaterfallPlugin, { WaterfallPluginStyles } from './plugins/waterfall-plugin';
import TogglePlugin, { TogglePluginStyles } from './plugins/toggle-plugin';
import type { Colors, Data, Marks, Waterfall } from './types';
import UIPlugin from './plugins/ui-plugin';

export { default as FlameChartContainer } from './flame-chart-container';
export type { FlameChartContainerSettings, FlameChartContainerOptions } from './flame-chart-container';

export { default as UIPlugin } from './plugins/ui-plugin';
export { default as FlameChartPlugin } from './plugins/flame-chart-plugin';
export { default as TimeGridPlugin } from './plugins/time-grid-plugin';
export { default as MarksPlugin } from './plugins/marks-plugin';
export { default as TimeframeSelectorPlugin } from './plugins/timeframe-selector-plugin';
export { default as WaterfallPlugin } from './plugins/waterfall-plugin';
export { default as TogglePlugin } from './plugins/toggle-plugin';

export type FlameChartStyles = {
    timeGridPlugin?: Partial<TimeGridPluginStyles>;
    timeframeSelectorPlugin?: Partial<TimeframeSelectorPluginStyles>;
    waterfallPlugin?: Partial<WaterfallPluginStyles>;
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
    data: Data;
    marks?: Marks;
    waterfall?: Waterfall;
    colors: Colors;
    settings: FlameChartSettings;
    plugins: UIPlugin[];
};

const defaultSettings: FlameChartSettings = {};

export default class FlameChart extends FlameChartContainer<FlameChartStyles> {
    setData: (data: Data) => void;
    setMarks: (data: Marks) => void;
    setWaterfall: (data: Waterfall) => void;
    setFlameChartPosition: ({ x, y }: { x: number; y: number }) => void;

    constructor({
        canvas,
        data,
        marks,
        waterfall,
        colors,
        settings = defaultSettings,
        plugins = [],
    }: FlameChartOptions) {
        const activePlugins = [];
        const { headers: { waterfall: waterfallName = 'waterfall', flameChart: flameChartName = 'flame chart' } = {} } =
            settings;
        const styles = settings?.styles || ({} as FlameChartSettings['styles']);

        const timeGridPlugin = new TimeGridPlugin({ styles: styles.timeGridPlugin });

        activePlugins.push(timeGridPlugin);

        let marksPlugin: MarksPlugin;
        let waterfallPlugin: WaterfallPlugin;
        let timeframeSelectorPlugin: TimeframeSelectorPlugin;
        let flameChartPlugin: FlameChartPlugin;

        if (marks) {
            marksPlugin = new MarksPlugin(marks);
            marksPlugin.on('select', (node, type) => this.emit('select', node, type));

            activePlugins.push(marksPlugin);
        }

        if (waterfall) {
            waterfallPlugin = new WaterfallPlugin(waterfall, { styles: styles.waterfallPlugin });
            waterfallPlugin.on('select', (node, type) => this.emit('select', node, type));

            if (data) {
                activePlugins.push(new TogglePlugin(waterfallName, { styles: styles.togglePlugin }));
            }

            activePlugins.push(waterfallPlugin);
        }

        if (data) {
            timeframeSelectorPlugin = new TimeframeSelectorPlugin(data, { styles: styles.timeframeSelectorPlugin });
            flameChartPlugin = new FlameChartPlugin({ data, colors });
            flameChartPlugin.on('select', (node, type) => this.emit('select', node, type));

            if (waterfall) {
                activePlugins.push(new TogglePlugin(flameChartName, { styles: styles.togglePlugin }));
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
