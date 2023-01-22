import { FlameChartContainer, FlameChartContainerSettings } from './flame-chart-container';
import { TimeGridPlugin, TimeGridPluginStyles } from './plugins/time-grid-plugin';
import { TimeframeSelectorPlugin, TimeframeSelectorPluginStyles } from './plugins/timeframe-selector-plugin';
import { WaterfallPlugin, WaterfallPluginStyles } from './plugins/waterfall-plugin';
import { TogglePlugin, TogglePluginStyles } from './plugins/toggle-plugin';
import { FlameChartPlugin } from './plugins/flame-chart-plugin';
import { MarksPlugin } from './plugins/marks-plugin';
import { Colors, FlameChartNodes, Marks, Waterfall } from './types';
import { UIPlugin } from './plugins/ui-plugin';
import { TimeseriesPlugin, TimeseriesPoint } from './plugins/timeseries-plugin';

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
    data?: FlameChartNodes;
    marks?: Marks;
    waterfall?: Waterfall;
    colors?: Colors;
    timeseries?: TimeseriesPoint[][];
    settings?: FlameChartSettings;
    plugins?: UIPlugin[];
};

const defaultSettings: FlameChartSettings = {};

export class FlameChart extends FlameChartContainer<FlameChartStyles> {
    setData: (data: FlameChartNodes) => void;
    setMarks: (data: Marks) => void;
    setWaterfall: (data: Waterfall) => void;
    setFlameChartPosition: ({ x, y }: { x?: number; y?: number }) => void;

    constructor(options: FlameChartOptions) {
        const {
            canvas,
            data,
            marks,
            waterfall,
            colors,
            settings = defaultSettings,
            plugins = [],
            timeseries = [],
        } = options;

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
            marksPlugin = new MarksPlugin({ data: marks });
            marksPlugin.on('select', (data) => this.emit('select', data));

            activePlugins.push(marksPlugin);
        }

        if (waterfall) {
            waterfallPlugin = new WaterfallPlugin({ data: waterfall, settings: { styles: styles?.waterfallPlugin } });
            waterfallPlugin.on('select', (data) => this.emit('select', data));

            if (data) {
                activePlugins.push(
                    new TogglePlugin({ title: waterfallName, settings: { styles: styles?.togglePlugin } })
                );
            }

            activePlugins.push(waterfallPlugin);
        }

        if (data) {
            timeframeSelectorPlugin = new TimeframeSelectorPlugin({
                data,
                settings: { styles: styles?.timeframeSelectorPlugin },
            });
            flameChartPlugin = new FlameChartPlugin({ data, colors });
            flameChartPlugin.on('select', (data) => this.emit('select', data));

            if (waterfall) {
                activePlugins.push(
                    new TogglePlugin({ title: flameChartName, settings: { styles: styles?.togglePlugin } })
                );
            }

            activePlugins.push(flameChartPlugin);
            activePlugins.unshift(timeframeSelectorPlugin);
        }

        if (timeseries) {
            timeseries.forEach((ts, idx) => {
                plugins.push(new TimeseriesPlugin({ name: `Timeseries${idx}`, data: ts }));
            });
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

export default FlameChart;
