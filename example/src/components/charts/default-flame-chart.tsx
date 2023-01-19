import { FlameChartWrapper, NodeTypes } from './flame-chart-wrapper';
import { FlameChartNode, FlameChartStyles } from '../../../../src';
import { FlameChartContainerStyles } from '../../../../src/flame-chart-container';
import styles from './default-flame-chart.module.css';
import { waterfallIntervals, waterfallItems } from '../../test-data';

export type DefaultFlameChartProps = {
    data: FlameChartNode[];
    stylesSettings?: FlameChartContainerStyles<FlameChartStyles>;
    onSelect?: (node: NodeTypes) => void;
};

export const DefaultFlameChart = ({ data, stylesSettings, onSelect }: DefaultFlameChartProps) => {
    return (
        <FlameChartWrapper
            data={data}
            waterfall={{
                intervals: waterfallIntervals,
                items: waterfallItems,
            }}
            settings={{
                styles: stylesSettings,
            }}
            className={styles.flameChart}
            onSelect={onSelect}
        />
    );
};
