import 'reset-css';
import styles from './app.module.css';
import { useCallback, useState } from 'react';
import { Collapse } from './shared/collapse';
import { RadioGroup } from './shared/radio-group';
import { TreeSettings } from './settings/tree-settings';
import { StylesSettings } from './settings/styles-settings';
import { generateRandomTree, TreeConfig } from '../test-data';
import { DefaultFlameChart } from './charts/default-flame-chart';
import { FlameChartNode, FlameChartNodes } from '../../../src';
import { CustomFlameChart } from './charts/custom-flame-chart';

enum ChartType {
    Default = 'default',
    Custom = 'custom',
}

const flameChartVariants = [
    {
        value: ChartType.Default,
        label: 'Default',
    },
    {
        value: ChartType.Custom,
        label: 'Custom',
    },
];

export const App = () => {
    const [treeConfig, setTreeConfig] = useState<TreeConfig>();
    const [stylesSettings, setStylesSettings] = useState({});
    const [currentChart, setCurrentChart] = useState(ChartType.Default);
    const [isGenerating, setIsGenerating] = useState(false);
    const [data, setData] = useState<FlameChartNode[] | null>(null);
    const [customData, setCustomData] = useState<FlameChartNodes[] | null>(null);

    const generate = useCallback((chart: ChartType, config?: TreeConfig) => {
        setIsGenerating(true);
        setTreeConfig(config);

        setTimeout(() => {
            if (config) {
                if (chart === ChartType.Default) {
                    const data = generateRandomTree(config);

                    setData(data);
                } else if (chart === ChartType.Custom) {
                    const data1 = generateRandomTree(config);
                    const data2 = generateRandomTree(config);

                    setCustomData([data1, data2]);
                }
            }

            setIsGenerating(false);
        });
    }, []);

    const handleChartChange = useCallback(
        (value: string) => {
            setCurrentChart(value as ChartType);

            generate(value as ChartType, treeConfig);
        },
        [treeConfig, generate]
    );

    return (
        <div className={styles.root}>
            <div className={styles.sidebar}>
                <Collapse title='Variants'>
                    <RadioGroup value={currentChart} options={flameChartVariants} onChange={handleChartChange} />
                </Collapse>
                <Collapse title='Tree settings' isCollapsed={false}>
                    <TreeSettings onChange={(config) => generate(currentChart, config)} isGenerating={isGenerating} />
                </Collapse>
                <Collapse title='Styles settings' isCollapsed={true}>
                    <StylesSettings onChange={setStylesSettings} />
                </Collapse>
            </div>
            {currentChart === 'default' && data && <DefaultFlameChart data={data} stylesSettings={stylesSettings} />}
            {currentChart === 'custom' && customData && (
                <CustomFlameChart data={customData} stylesSettings={stylesSettings} />
            )}
        </div>
    );
};
