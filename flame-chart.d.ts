import FlameChartContainer, { FlameChartContainerSettings } from './flame-chart-container';
import { TimeGridPluginStyles } from './plugins/time-grid-plugin';
import { TimeframeSelectorPluginStyles } from './plugins/timeframe-selector-plugin';
import { WaterfallPluginStyles } from './plugins/waterfall-plugin';
import { TogglePluginStyles } from './plugins/toggle-plugin';
import { Colors, Data, Marks, Waterfall } from './types';
import UIPlugin from './plugins/ui-plugin';
export declare type FlameChartStyles = {
    timeGridPlugin?: Partial<TimeGridPluginStyles>;
    timeframeSelectorPlugin?: Partial<TimeframeSelectorPluginStyles>;
    waterfallPlugin?: Partial<WaterfallPluginStyles>;
    togglePlugin?: Partial<TogglePluginStyles>;
};
export declare type FlameChartSettings = {
    headers?: Partial<{
        waterfall: string;
        flameChart: string;
    }>;
} & FlameChartContainerSettings<FlameChartStyles>;
export declare type FlameChartOptions = {
    canvas: HTMLCanvasElement;
    data: Data;
    marks?: Marks;
    waterfall?: Waterfall;
    colors: Colors;
    settings: FlameChartSettings;
    plugins: UIPlugin[];
};
export default class FlameChart extends FlameChartContainer<FlameChartStyles> {
    setData: (data: Data) => void;
    setMarks: (data: Marks) => void;
    setWaterfall: (data: Waterfall) => void;
    setFlameChartPosition: ({ x, y }: {
        x: number;
        y: number;
    }) => void;
    constructor({ canvas, data, marks, waterfall, colors, settings, plugins, }: FlameChartOptions);
}
//# sourceMappingURL=flame-chart.d.ts.map