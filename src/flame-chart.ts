import { FlameChartContainer, FlameChartContainerSettings } from './flame-chart-container';
import { TimeGridPlugin, TimeGridPluginStyles } from './plugins/time-grid-plugin';
import { TimeframeSelectorPlugin, TimeframeSelectorPluginStyles } from './plugins/timeframe-selector-plugin';
import { WaterfallPlugin, WaterfallPluginStyles } from './plugins/waterfall-plugin';
import { TogglePlugin, TogglePluginStyles } from './plugins/toggle-plugin';
import { FlameChartPlugin } from './plugins/flame-chart-plugin';
import { MarksPlugin } from './plugins/marks-plugin';
import { Colors, FlameChartNodes, Marks, Timeseries, Waterfall } from './types';
import { UIPlugin } from './plugins/ui-plugin';
import { TimeseriesPlugin, TimeseriesPluginStyles } from './plugins/timeseries-plugin';

export type FlameChartStyles = {
    timeGridPlugin?: Partial<TimeGridPluginStyles>;
    timeframeSelectorPlugin?: Partial<TimeframeSelectorPluginStyles>;
    waterfallPlugin?: Partial<WaterfallPluginStyles>;
    togglePlugin?: Partial<TogglePluginStyles>;
    timeseriesPlugin?: Partial<TimeseriesPluginStyles>;
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
    timeframeTimeseries?: Timeseries;
    timeseries?: Timeseries;
    colors?: Colors;
    settings?: FlameChartSettings;
    plugins?: UIPlugin[];
};

const defaultSettings: FlameChartSettings = {};

export class FlameChart extends FlameChartContainer<FlameChartStyles> {
    setNodes: (nodes: FlameChartNodes) => void;
    setTimeseries: (timeseries: Timeseries) => void;
    setTimeframeTimeseries: (timeseries: Timeseries) => void;
    setMarks: (data: Marks) => void;
    setWaterfall: (data: Waterfall) => void;
    setFlameChartPosition: ({ x, y }: { x?: number; y?: number }) => void;

    constructor({
        canvas,
        data,
        marks,
        waterfall,
        timeframeTimeseries,
        timeseries,
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
        let timeseriesPlugin: TimeseriesPlugin | undefined;

        if (timeseries) {
            timeseriesPlugin = new TimeseriesPlugin({
                data: timeseries,
                settings: { styles: styles?.timeseriesPlugin },
            });

            activePlugins.push(timeseriesPlugin);
        }

        if (marks) {
            marksPlugin = new MarksPlugin({ data: marks });
            marksPlugin.on('select', (data) => this.emit('select', data));

            activePlugins.push(marksPlugin);
        }

        if (waterfall) {
            waterfallPlugin = new WaterfallPlugin({ data: waterfall, settings: { styles: styles?.waterfallPlugin } });
            waterfallPlugin.on('select', (data) => this.emit('select', data));

            if (data) {
                activePlugins.push(new TogglePlugin(waterfallName, { styles: styles?.togglePlugin }));
            }

            activePlugins.push(waterfallPlugin);
        }

        if (data) {
            flameChartPlugin = new FlameChartPlugin({ data, colors });
            flameChartPlugin.on('select', (data) => this.emit('select', data));

            if (waterfall) {
                activePlugins.push(new TogglePlugin(flameChartName, { styles: styles?.togglePlugin }));
            }

            activePlugins.push(flameChartPlugin);
        }

        if (data || waterfall || timeframeTimeseries) {
            timeframeSelectorPlugin = new TimeframeSelectorPlugin({
                flameChartNodes: data,
                waterfall: waterfall,
                timeseries: timeframeTimeseries,
                settings: { styles: styles?.timeframeSelectorPlugin },
            });

            activePlugins.unshift(timeframeSelectorPlugin);
        }

        super({
            canvas,
            settings,
            plugins: [...activePlugins, ...plugins],
        });

        if (flameChartPlugin && timeframeSelectorPlugin) {
            this.setNodes = (data) => {
                if (flameChartPlugin) {
                    flameChartPlugin.setData(data);
                }

                if (timeframeSelectorPlugin) {
                    timeframeSelectorPlugin.setFlameChartNodes(data);
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

                if (timeframeSelectorPlugin) {
                    timeframeSelectorPlugin.setWaterfall(data);
                }
            };
        }

        if (timeseriesPlugin) {
            this.setTimeseries = (data) => {
                if (timeseriesPlugin) {
                    timeseriesPlugin.setData(data);
                }
            };
        }

        if (timeframeSelectorPlugin) {
            this.setTimeframeTimeseries = (data) => {
                timeframeSelectorPlugin?.setTimeseries(data);
            };
        }
    }
}

export default FlameChart;
