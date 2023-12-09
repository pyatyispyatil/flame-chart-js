import { FlameChartComponent, NodeTypes } from '../../../../src/wrappers/react/flame-chart-component';
import {
    DefaultPatterns,
    FlameChartNode,
    FlameChartSettings,
    FlameChartStyles,
    Marks,
    Timeseries,
    WaterfallItems,
} from '../../../../src';
import { FlameChartContainerStyles } from '../../../../src/flame-chart-container';
import styles from './default-flame-chart.module.css';
import { waterfallIntervals } from '../../test-data';
import { useMemo } from 'react';

export type DefaultFlameChartProps = {
    flameChartData?: FlameChartNode[];
    waterfallData?: WaterfallItems;
    marksData?: Marks;
    timeseriesData?: Timeseries;
    timeframeTimeseriesData?: Timeseries;
    stylesSettings?: FlameChartContainerStyles<FlameChartStyles>;
    patternsSettings?: DefaultPatterns[];
    onSelect?: (node: NodeTypes) => void;
};

export const DefaultFlameChart = ({
    flameChartData,
    waterfallData,
    marksData,
    timeseriesData,
    timeframeTimeseriesData,
    stylesSettings,
    patternsSettings,
    onSelect,
}: DefaultFlameChartProps) => {
    const waterfall = useMemo(
        () =>
            waterfallData
                ? {
                      intervals: waterfallIntervals,
                      items: waterfallData,
                  }
                : undefined,
        [waterfallData],
    );

    const settings = useMemo(
        (): FlameChartSettings => ({
            styles: stylesSettings,
            patterns: patternsSettings,
        }),
        [stylesSettings, patternsSettings],
    );

    return (
        <FlameChartComponent
            data={flameChartData}
            waterfall={waterfall}
            marks={marksData}
            timeseries={timeseriesData}
            timeframeTimeseries={timeframeTimeseriesData}
            settings={settings}
            className={styles.flameChart}
            onSelect={onSelect}
            hotkeys={true}
        />
    );
};
