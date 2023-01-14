import { FlameChartWrapper } from './flame-chart-wrapper';
import { TreeSettings } from '../settings/tree-settings';
import { useState } from 'react';
import { FlameChartNode } from '../../../../src';
import styles from './default-flame-chart.module.css';

export const DefaultFlameChart = () => {
    const [data, setData] = useState<FlameChartNode[]>();

    return (
        <div>
            {data && <FlameChartWrapper data={data} className={styles.flameChart} />}
            <TreeSettings onChange={setData} />
        </div>
    );
};
