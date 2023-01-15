import { useState } from 'react';
import { FlameChartWrapper } from './flame-chart-wrapper';
import { TreeSettings } from '../settings/tree-settings';
import { StylesSettings } from '../settings/styles-settings';
import { FlameChartNode } from '../../../../src';
import styles from './default-flame-chart.module.css';
import { Collapse } from '../shared/collapse';

export const DefaultFlameChart = () => {
    const [data, setData] = useState<FlameChartNode[]>();
    const [stylesSettings, setStylesSettings] = useState({});

    return (
        <div className={styles.root}>
            <div className={styles.sidebar}>
                <Collapse title='Tree settings' isCollapsed={false}>
                    <TreeSettings onChange={setData} />
                </Collapse>
                <Collapse title='Styles settings' isCollapsed={true}>
                    <StylesSettings onChange={setStylesSettings} />
                </Collapse>
            </div>
            {data && (
                <FlameChartWrapper
                    data={data}
                    settings={{
                        styles: stylesSettings,
                    }}
                    className={styles.flameChart}
                />
            )}
        </div>
    );
};
