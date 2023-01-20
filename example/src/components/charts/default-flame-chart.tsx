import { FlameChartWrapper, NodeTypes } from './flame-chart-wrapper';
import { FlameChartNode, FlameChartStyles } from '../../../../src';
import { FlameChartContainerStyles } from '../../../../src/flame-chart-container';
import styles from './default-flame-chart.module.css';
import { waterfallIntervals, waterfallItems } from '../../test-data';
import { useMemo } from 'react';

export type DefaultFlameChartProps = {
    data: FlameChartNode[];
    stylesSettings?: FlameChartContainerStyles<FlameChartStyles>;
    onSelect?: (node: NodeTypes) => void;
};

export const DefaultFlameChart = ({ data, stylesSettings, onSelect }: DefaultFlameChartProps) => {
    const waterfall = useMemo(
        () => ({
            intervals: waterfallIntervals,
            items: waterfallItems,
        }),
        []
    );

    const settings = useMemo(
        () => ({
            styles: stylesSettings,
        }),
        [stylesSettings]
    );

    return (
        <FlameChartWrapper
            data={data}
            waterfall={waterfall}
            settings={settings}
            className={styles.flameChart}
            onSelect={onSelect}
        />
    );
};
