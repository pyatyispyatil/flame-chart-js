import FlameChartContainer, { FlameChartContainerSettings } from './flame-chart-container';
import TimeGridPlugin, { TimeGridPluginStyles } from './plugins/time-grid-plugin';
import TimeframeSelectorPlugin, { TimeframeSelectorPluginStyles } from './plugins/timeframe-selector-plugin';
import WaterfallPlugin, { WaterfallPluginStyles } from './plugins/waterfall-plugin';
import TogglePlugin, { TogglePluginStyles } from './plugins/toggle-plugin';
import FlameChartPlugin from './plugins/flame-chart-plugin';
import MarksPlugin from './plugins/marks-plugin';
import { Colors, Data, Marks, Waterfall } from './types';
import UIPlugin from './plugins/ui-plugin';

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
    data?: Data;
    marks?: Marks;
    waterfall?: Waterfall;
    colors?: Colors;
    settings?: FlameChartSettings;
    plugins?: UIPlugin[];
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
        const activePlugins: UIPlugin[] = [];
        const { headers: { waterfall: waterfallName = 'waterfall', flameChart: flameChartName = 'flame chart' } = {} } =
            settings;
        const styles = settings?.styles ?? ({} as FlameChartSettings['styles']);

        const timeGridPlugin = new TimeGridPlugin({ styles: styles?.timeGridPlugin });

        activePlugins.push(timeGridPlugin);

        let marksPlugin: MarksPlugin | undefined;
        let waterfallPlugin: WaterfallPlugin | undefined;
        let timeframeSelectorPlugin: TimeframeSelectorPlugin | undefined;
        let flameChartPlugin: FlameChartPlugin | undefined;

        if (marks) {
            marksPlugin = new MarksPlugin(marks);
            marksPlugin.on('select', (node, type) => this.emit('select', node, type));

            activePlugins.push(marksPlugin);
        }

        if (waterfall) {
            waterfallPlugin = new WaterfallPlugin(waterfall, { styles: styles?.waterfallPlugin });
            waterfallPlugin.on('select', (node, type) => this.emit('select', node, type));

            if (data) {
                activePlugins.push(new TogglePlugin(waterfallName, { styles: styles?.togglePlugin }));
            }

            activePlugins.push(waterfallPlugin);
        }

        if (data) {
            timeframeSelectorPlugin = new TimeframeSelectorPlugin(data, { styles: styles?.timeframeSelectorPlugin });
            flameChartPlugin = new FlameChartPlugin({ data, colors });
            flameChartPlugin.on('select', (node, type) => this.emit('select', node, type));

            if (waterfall) {
                activePlugins.push(new TogglePlugin(flameChartName, { styles: styles?.togglePlugin }));
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
                if (flameChartPlugin) {
                    flameChartPlugin.setData(data);
                }

                if (timeframeSelectorPlugin) {
                    timeframeSelectorPlugin.setData(data);
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

        if (marksPlugin) {
            this.setMarks = (data) => {
                if (marksPlugin) {
                    marksPlugin.setMarks(data);
                }
            };
        }

        if (waterfallPlugin) {
            this.setWaterfall = (data) => {
                if (waterfallPlugin) {
                    waterfallPlugin.setData(data);
                }
            };
        }
    }
}
