import {
    FlameChartContainer,
    FlameChartNodes,
    FlameChartPlugin,
    FlameChartStyles,
    TimeGridPlugin,
    TogglePlugin,
} from '../../../../src';
import { FlameChartContainerStyles } from '../../../../src/flame-chart-container';
import styles from './default-flame-chart.module.css';
import { FlameChartContainerComponent } from '../../../../src/wrappers/react/flame-chart-container-component';
import { useEffect, useMemo, useState } from 'react';

export type CustomFlameChartProps = {
    flameChartData?: FlameChartNodes[];
    stylesSettings?: FlameChartContainerStyles<FlameChartStyles>;
};

export const CustomFlameChart = ({ flameChartData = [], stylesSettings }: CustomFlameChartProps) => {
    const [instance, setInstance] = useState<null | FlameChartContainer>(null);

    const flameChartPlugins = useMemo(
        () => [
            new FlameChartPlugin({
                name: 'flameChart1',
                data: flameChartData[0],
            }),
            new FlameChartPlugin({
                name: 'flameChart2',
                data: flameChartData[1],
            }),
            new FlameChartPlugin({
                name: 'flameChart3',
                data: flameChartData[0],
            }),
            new FlameChartPlugin({
                name: 'flameChart4',
                data: flameChartData[1],
            }),
        ],
        [],
    );
    const plugins = useMemo(
        () => [
            new TimeGridPlugin(),
            new TogglePlugin('FlameChart 1'),
            flameChartPlugins[0],
            new TogglePlugin('FlameChart 2'),
            flameChartPlugins[1],
            new TogglePlugin('FlameChart 3'),
            flameChartPlugins[2],
            new TogglePlugin('FlameChart 4'),
            flameChartPlugins[3],
        ],
        [],
    );

    useEffect(() => {
        if (instance) {
            flameChartPlugins[0].setData(flameChartData[0]);
            flameChartPlugins[1].setData(flameChartData[1]);
            flameChartPlugins[2].setData(flameChartData[0]);
            flameChartPlugins[3].setData(flameChartData[1]);
        }
    }, [flameChartData, instance]);

    const settings = useMemo(
        () => ({
            styles: stylesSettings,
        }),
        [stylesSettings],
    );

    return (
        <FlameChartContainerComponent
            settings={settings}
            instance={setInstance}
            plugins={plugins}
            className={styles.flameChart}
        />
    );
};
