export { UIPlugin } from './plugins/ui-plugin';
export { FlameChartPlugin } from './plugins/flame-chart-plugin';
export { TimeGridPlugin } from './plugins/time-grid-plugin';
export { MarksPlugin } from './plugins/marks-plugin';
export { TimeframeSelectorPlugin } from './plugins/timeframe-selector-plugin';
export { TimeseriesPlugin } from './plugins/timeseries-plugin';
export { WaterfallPlugin } from './plugins/waterfall-plugin';
export { TogglePlugin } from './plugins/toggle-plugin';

export { FlameChart } from './flame-chart';
export type { FlameChartStyles, FlameChartSettings, FlameChartOptions } from './flame-chart';
export * from './types';

export { FlameChartContainer } from './flame-chart-container';
export type { FlameChartContainerSettings, FlameChartContainerOptions } from './flame-chart-container';

export type {
    DefaultPatterns,
    Pattern,
    PatternCreator,
    StripesPatternConfig,
    GradientPatternConfig,
    CombinedPatternConfig,
    DotsPatternConfig,
} from './patterns';

export { defaultPatterns } from './patterns';
