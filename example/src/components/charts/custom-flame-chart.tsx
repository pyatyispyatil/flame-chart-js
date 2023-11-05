import { FlameChartNodes, FlameChartPlugin, FlameChartStyles, TimeGridPlugin, TogglePlugin } from '../../../../src';
import { FlameChartContainerStyles } from '../../../../src/flame-chart-container';
import styles from './default-flame-chart.module.css';
import { FlameChartContainerComponent } from '../../../../src/wrappers/react/flame-chart-container-component';
import { useMemo } from 'react';

export type CustomFlameChartProps = {
    flameChartData: FlameChartNodes[];
    stylesSettings?: FlameChartContainerStyles<FlameChartStyles>;
};

export const CustomFlameChart = ({ flameChartData, stylesSettings }: CustomFlameChartProps) => {
    const plugins = useMemo(() => {
        return [
            new TimeGridPlugin(),
            new TogglePlugin('FlameChart 1'),
            new FlameChartPlugin({
                name: 'flameChart1',
                data: flameChartData[0],
            }),
            new TogglePlugin('FlameChart 2'),
            new FlameChartPlugin({
                name: 'flameChart2',
                data: flameChartData[1],
            }),
        ];
    }, [flameChartData]);

    const settings = useMemo(
        () => ({
            styles: stylesSettings,
        }),
        [stylesSettings],
    );

    return <FlameChartContainerComponent settings={settings} plugins={plugins} className={styles.flameChart} />;
};
