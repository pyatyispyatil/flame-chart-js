import { FlameChartNodes, FlameChartPlugin, FlameChartStyles, TimeGridPlugin, TogglePlugin } from '../../../../src';
import { FlameChartContainerStyles } from '../../../../src/flame-chart-container';
import styles from './default-flame-chart.module.css';
import { FlameChartContainerWrapper } from './flame-chart-container-wrapper';
import { useMemo } from 'react';

export type CustomFlameChartProps = {
    data: FlameChartNodes[];
    stylesSettings?: FlameChartContainerStyles<FlameChartStyles>;
};

export const CustomFlameChart = ({ data, stylesSettings }: CustomFlameChartProps) => {
    const plugins = useMemo(() => {
        return [
            new TimeGridPlugin(),
            new TogglePlugin('FlameChart 1'),
            new FlameChartPlugin({
                name: 'flameChart1',
                data: data[0],
            }),
            new TogglePlugin('FlameChart 2'),
            new FlameChartPlugin({
                name: 'flameChart2',
                data: data[1],
            }),
        ];
    }, []);

    return (
        <FlameChartContainerWrapper
            settings={{
                styles: stylesSettings,
            }}
            plugins={plugins}
            className={styles.flameChart}
        />
    );
};
