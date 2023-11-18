import 'reset-css';
import styles from './app.module.css';
import { useCallback, useState } from 'react';
import { Collapse } from './shared/collapse';
import { RadioGroup } from './shared/radio-group';
import { TreeSettings } from './settings/tree-settings';
import { StylesSettings } from './settings/styles-settings';
import {
    generateRandomCpuAndMemTimeseries,
    generateRandomCpuTimeseries,
    generateRandomMarks,
    generateRandomTree,
    generateRandomWaterfallItems,
    MarksConfig,
    TimeseriesConfig,
    TreeConfig,
    WaterfallConfig,
} from '../test-data';
import { DefaultFlameChart } from './charts/default-flame-chart';
import { FlameChartNode, FlameChartNodes, Marks, Timeseries, WaterfallItems } from '../../../src';
import { CustomFlameChart } from './charts/custom-flame-chart';
import { NodeTypes } from '../../../src/wrappers/react/flame-chart-component';
import { SelectedData } from './charts/selected-data';
import { WaterfallSettings } from './settings/waterfall-settings';
import { MarksSettings } from './settings/marks-settings';
import { TimeseriesSettings } from './settings/timeseries-settings';
import { examplePatterns, PatternsSettings } from './settings/patterns-settings';

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
    const [state, setState] = useState<{
        flameChartData: FlameChartNode[];
        customFlameChartData: FlameChartNodes[];
        waterfallData: WaterfallItems;
        marksData: Marks;
        timeseriesData: Timeseries;
        timeframeTimeseriesData: Timeseries;
    }>({
        flameChartData: [],
        customFlameChartData: [[], []],
        waterfallData: [],
        marksData: [],
        timeseriesData: [],
        timeframeTimeseriesData: [],
    });
    const [treeConfig, setTreeConfig] = useState<TreeConfig>();
    const [stylesSettings, setStylesSettings] = useState({});
    const [patternsSettings, setPatternsSettings] = useState(examplePatterns);
    const [currentChart, setCurrentChart] = useState(ChartType.Default);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedData, setSelectedData] = useState<NodeTypes>(null);

    const generateTree = useCallback(
        (config: TreeConfig, chartType?: ChartType) => {
            setIsGenerating(true);
            setTreeConfig(config);

            setTimeout(() => {
                if (config) {
                    if ((chartType || currentChart) === ChartType.Default) {
                        setState((state) => ({ ...state, flameChartData: generateRandomTree(config) }));
                    } else if ((chartType || currentChart) === ChartType.Custom) {
                        setState((state) => ({
                            ...state,
                            customFlameChartData: [generateRandomTree(config), generateRandomTree(config)],
                        }));
                    }
                }

                setIsGenerating(false);
            });
        },
        [currentChart],
    );

    const generateWaterfall = useCallback((config: WaterfallConfig) => {
        setIsGenerating(true);

        setTimeout(() => {
            setState((state) => ({ ...state, waterfallData: generateRandomWaterfallItems(config) }));
            setIsGenerating(false);
        });
    }, []);

    const generateMarks = useCallback((config: MarksConfig) => {
        setState((state) => ({ ...state, marksData: generateRandomMarks(config) }));
    }, []);

    const generateTimeseries = useCallback((config: TimeseriesConfig) => {
        setState((state) => ({
            ...state,
            timeseriesData: generateRandomCpuAndMemTimeseries(config),
            timeframeTimeseriesData: generateRandomCpuTimeseries(config),
        }));
    }, []);

    const handleChartChange = useCallback(
        (value: ChartType) => {
            setCurrentChart(value);

            generateTree(treeConfig!, value);
        },
        [treeConfig, generateTree],
    );

    return (
        <div className={styles.root}>
            <div className={styles.sidebar}>
                <div className={styles.version}>v{window.app.version}</div>
                <Collapse title='Variants'>
                    <RadioGroup value={currentChart} options={flameChartVariants} onChange={handleChartChange} />
                </Collapse>
                <Collapse title='Flame chart data settings' isCollapsed={true}>
                    <TreeSettings onChange={generateTree} isGenerating={isGenerating} />
                </Collapse>
                <Collapse title='Waterfall data settings' isCollapsed={true}>
                    <WaterfallSettings onChange={generateWaterfall} isGenerating={isGenerating} />
                </Collapse>
                <Collapse title='Marks data settings' isCollapsed={true}>
                    <MarksSettings onChange={generateMarks} isGenerating={isGenerating} />
                </Collapse>
                <Collapse title='Timeseries data settings' isCollapsed={true}>
                    <TimeseriesSettings onChange={generateTimeseries} isGenerating={isGenerating} />
                </Collapse>
                <Collapse title='Style settings' isCollapsed={true}>
                    <StylesSettings onChange={setStylesSettings} />
                </Collapse>
                <Collapse title='Patterns settings' isCollapsed={true}>
                    <PatternsSettings onChange={setPatternsSettings} value={patternsSettings} />
                </Collapse>
                {selectedData?.node && (
                    <Collapse title='Selected node' isCollapsed={true}>
                        <SelectedData data={selectedData} />
                    </Collapse>
                )}
            </div>
            {currentChart === 'default' && (
                <DefaultFlameChart
                    flameChartData={state.flameChartData}
                    waterfallData={state.waterfallData}
                    marksData={state.marksData}
                    timeseriesData={state.timeseriesData}
                    timeframeTimeseriesData={state.timeframeTimeseriesData}
                    stylesSettings={stylesSettings}
                    patternsSettings={patternsSettings}
                    onSelect={setSelectedData}
                />
            )}
            {currentChart === 'custom' && (
                <CustomFlameChart flameChartData={state.customFlameChartData} stylesSettings={stylesSettings} />
            )}
        </div>
    );
};
