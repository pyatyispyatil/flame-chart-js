import { Data, FlameChart, WaterfallIntervals } from '../../src/index';
import { defaultTimeGridStyles } from '../../src/engines/time-grid';
import { defaultRenderStyles } from '../../src/engines/basic-render-engine';
import { defaultTimeGridPluginStyles } from '../../src/plugins/time-grid-plugin';
import { defaultTimeframeSelectorPluginStyles } from '../../src/plugins/timeframe-selector-plugin';
import { defaultTogglePluginStyles } from '../../src/plugins/toggle-plugin';
import { defaultWaterfallPluginStyles } from '../../src/plugins/waterfall-plugin';

import { generateRandomTree } from './test-data';
import { query, initQuery } from './query';
import {
    initView,
    getInputValues,
    setNodeView,
    onApplyStyles,
    onUpdate,
    onExport,
    onImport,
    getWrapperWH,
    getCanvas,
} from './view';

export interface TreeConfigItem {
    name: string;
    value: number;
    units?: string;
}

const treeConfig: TreeConfigItem[] = [
    { name: 'count', value: 100000 },
    { name: 'start', value: 500 },
    { name: 'end', value: 5000 },
    { name: 'minChild', value: 1 },
    { name: 'maxChild', value: 3 },
    { name: 'thinning', units: '%', value: 12 },
    { name: 'colorsMonotony', value: 40 },
    { name: 'colorsCount', value: 10 },
];

const marks = [
    {
        shortName: 'DCL',
        fullName: 'DOMContentLoaded',
        timestamp: 2000,
        color: '#d7c44c',
    },
    {
        shortName: 'LE',
        fullName: 'LoadEvent',
        timestamp: 2100,
        color: '#4fd24a',
    },
    {
        shortName: 'TTI',
        fullName: 'Time To Interactive',
        timestamp: 3000,
        color: '#4b7ad7',
    },
];

const colors = {
    task: '#696969',
    event: '#a4775b',
};

const inputs = getInputValues(treeConfig);
const generateData = () => generateRandomTree(inputs);

let currentData: Data = query ? [] : generateData();

const [width, height] = getWrapperWH();
const canvas = getCanvas();

canvas.width = width;
canvas.height = height;

const testItems = [
    {
        name: 'foo',
        intervals: 'default',
        timing: {
            requestStart: 2050,
            responseStart: 2500,
            responseEnd: 2600,
        },
    },
    {
        name: 'bar',
        intervals: 'default',
        timing: {
            requestStart: 2120,
            responseStart: 2180,
            responseEnd: 2300,
        },
    },
    {
        name: 'bar2',
        intervals: 'default',
        timing: {
            requestStart: 2120,
            responseStart: 2180,
            responseEnd: 2300,
        },
    },
    {
        name: 'bar3',
        intervals: 'default',
        timing: {
            requestStart: 2130,
            responseStart: 2180,
            responseEnd: 2320,
        },
    },
    {
        name: 'bar4',
        intervals: 'default',
        timing: {
            requestStart: 2300,
            responseStart: 2350,
            responseEnd: 2400,
        },
    },
    {
        name: 'bar5',
        intervals: 'default',
        timing: {
            requestStart: 2500,
            responseStart: 2520,
            responseEnd: 2550,
        },
    },
];
const testIntervals: WaterfallIntervals = {
    default: [
        {
            name: 'waiting',
            color: 'rgb(207,196,152)',
            type: 'block',
            start: 'requestStart',
            end: 'responseStart',
        },
        {
            name: 'downloading',
            color: 'rgb(207,180,81)',
            type: 'block',
            start: 'responseStart',
            end: 'responseEnd',
        },
    ],
};

const flameChart = new FlameChart({
    canvas,
    data: currentData,
    marks,
    waterfall: {
        items: testItems,
        intervals: testIntervals,
    },
    colors,
});

flameChart.on('select', (node, type) => {
    setNodeView(
        node
            ? `${type}\r\n${JSON.stringify(
                  {
                      ...node,
                      source: {
                          ...node.source,
                          children: '[]',
                      },
                      parent: undefined,
                  },
                  null,
                  '  '
              )}`
            : ''
    );
});

window.addEventListener('resize', () => {
    const [width, height] = getWrapperWH();

    flameChart.resize(width, height);
});

onApplyStyles((styles) => {
    flameChart.setSettings({
        styles,
    });
});

onUpdate(() => {
    currentData = generateData();

    flameChart.setData(currentData);
});

onImport((data) => {
    currentData = JSON.parse(data);

    flameChart.setData(currentData);
});

onExport(() => {
    return JSON.stringify(currentData);
});

initQuery(flameChart);
initView(treeConfig, {
    main: defaultRenderStyles,
    timeGrid: defaultTimeGridStyles,
    timeGridPlugin: defaultTimeGridPluginStyles,
    timeframeSelectorPlugin: defaultTimeframeSelectorPluginStyles,
    waterfallPlugin: defaultWaterfallPluginStyles,
    togglePlugin: defaultTogglePluginStyles,
});
