import { FlameChartWrapper } from './flame-chart-wrapper';
import { FlameChartNode, FlameChartStyles } from '../../../../src';
import { FlameChartContainerStyles } from '../../../../src/flame-chart-container';
import styles from './default-flame-chart.module.css';

export type DefaultFlameChartProps = {
    data: FlameChartNode[];
    stylesSettings?: FlameChartContainerStyles<FlameChartStyles>;
};

export const DefaultFlameChart = ({ data, stylesSettings }: DefaultFlameChartProps) => {
    return (
        <FlameChartWrapper
            data={data}
            settings={{
                styles: stylesSettings,
            }}
            className={styles.flameChart}
        />
    );
};
