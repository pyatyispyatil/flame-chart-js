import 'reset-css';
import styles from './app.module.css';
import { useCallback, useState } from 'react';
import { Collapse } from './shared/collapse';
import { RadioGroup } from './shared/radio-group';
import { TreeSettings } from './settings/tree-settings';
import { StylesSettings } from './settings/styles-settings';
import {
    generateRandomMarks,
    generateRandomTree,
    generateRandomWaterfallItems,
    MarksConfig,
    TreeConfig,
    WaterfallConfig,
} from '../test-data';
import { DefaultFlameChart } from './charts/default-flame-chart';
import { FlameChartNode, FlameChartNodes, Marks, WaterfallItems } from '../../../src';
import { CustomFlameChart } from './charts/custom-flame-chart';
import { NodeTypes } from './charts/flame-chart-wrapper';
import { SelectedData } from './charts/selected-data';
import { WaterfallSettings } from './settings/waterfall-settings';
import { MarksSettings } from './settings/marks-settings';

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
    const [flameChartData, setFlameChartData] = useState<FlameChartNode[] | null>(null);
    const [customFlameChartData, setCustomFlameChartData] = useState<FlameChartNodes[] | null>(null);
    const [waterfallData, setWaterfallData] = useState<WaterfallItems | null>(null);
    const [marksData, setMarksData] = useState<Marks | null>(null);
    const [selectedData, setSelectedData] = useState<NodeTypes>(null);

    const generateTree = useCallback((chart: ChartType, config?: TreeConfig) => {
        setIsGenerating(true);
        setTreeConfig(config);

        setTimeout(() => {
            if (config) {
                if (chart === ChartType.Default) {
                    const data = generateRandomTree(config);

                    setFlameChartData(data);
                } else if (chart === ChartType.Custom) {
                    const data1 = generateRandomTree(config);
                    const data2 = generateRandomTree(config);

                    setCustomFlameChartData([data1, data2]);
                }
            }

            setIsGenerating(false);
        });
    }, []);

    const generateWaterfall = useCallback((config?: WaterfallConfig) => {
        setIsGenerating(true);

        setTimeout(() => {
            if (config) {
                const data = generateRandomWaterfallItems(config);

                setWaterfallData(data);
            }

            setIsGenerating(false);
        });
    }, []);

    const generateMarks = useCallback((config?: MarksConfig) => {
        if (config) {
            const data = generateRandomMarks(config);

            setMarksData(data);
        }
    }, []);

    const handleChartChange = useCallback(
        (value: string) => {
            setCurrentChart(value as ChartType);

            generateTree(value as ChartType, treeConfig);
        },
        [treeConfig, generateTree]
    );

    return (
        <div className={styles.root}>
            <div className={styles.sidebar}>
                <Collapse title='Variants'>
                    <RadioGroup value={currentChart} options={flameChartVariants} onChange={handleChartChange} />
                </Collapse>
                <Collapse title='Flame chart data settings' isCollapsed={false}>
                    <TreeSettings
                        onChange={(config) => generateTree(currentChart, config)}
                        isGenerating={isGenerating}
                    />
                </Collapse>
                <Collapse title='Waterfall data settings' isCollapsed={false}>
                    <WaterfallSettings onChange={(config) => generateWaterfall(config)} isGenerating={isGenerating} />
                </Collapse>
                <Collapse title='Marks data settings' isCollapsed={false}>
                    <MarksSettings onChange={(config) => generateMarks(config)} isGenerating={isGenerating} />
                </Collapse>
                <Collapse title='Style settings' isCollapsed={true}>
                    <StylesSettings onChange={setStylesSettings} />
                </Collapse>
                {selectedData?.node && (
                    <Collapse title='Selected node' isCollapsed={false}>
                        <SelectedData data={selectedData} />
                    </Collapse>
                )}
            </div>
            {currentChart === 'default' && flameChartData && waterfallData && marksData && (
                <DefaultFlameChart
                    flameChartData={flameChartData}
                    waterfallData={waterfallData}
                    marksData={marksData}
                    stylesSettings={stylesSettings}
                    onSelect={setSelectedData}
                />
            )}
            {currentChart === 'custom' && customFlameChartData && (
                <CustomFlameChart flameChartData={customFlameChartData} stylesSettings={stylesSettings} />
            )}
        </div>
    );
};
