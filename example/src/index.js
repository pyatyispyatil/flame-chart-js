import FlameChart from './../../src/index.js';
import { defaultTimeGridSettings } from '../../src/engines/time-grid.js';
import { defaultRenderSettings } from '../../src/engines/basic-render-engine.js';
import { defaultTimeGridPluginSettings } from './../../src/plugins/time-grid-plugin.js';
import { defaultTimeframeSelectorPluginSettings } from './../../src/plugins/timeframe-selector-plugin.js';
import { generateRandomTree } from './test-data.js';
import { query, initQuery } from './query.js';
import {
    initView,
    getInputValues,
    setNodeView,
    onApplyStyles,
    onUpdate,
    onExport,
    onImport,
    getWrapperWH,
    getCanvas
} from './view.js';

const treeConfig = [
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
        color: '#d7c44c'
    },
    {
        shortName: 'LE',
        fullName: 'LoadEvent',
        timestamp: 2100,
        color: '#4fd24a'
    },
    {
        shortName: 'TTI',
        fullName: 'Time To Interactive',
        timestamp: 3000,
        color: '#4b7ad7'
    }
];

const colors = {
    task: '#696969',
    event: '#a4775b'
};

const generateData = () => generateRandomTree(getInputValues(treeConfig));

let currentData = query ? [] : generateData();

const [width, height] = getWrapperWH();
const canvas = getCanvas();

canvas.width = width;
canvas.height = height;

const testItems = [
    {
        name: 'foo',
        intervals: 'default',
        timing: {
            requestStart: 50,
            responseStart: 500,
            responseEnd: 600
        }
    },
    {
        name: 'bar',
        intervals: 'default',
        timing: {
            requestStart: 120,
            responseStart: 180,
            responseEnd: 300
        }
    },
    {
        name: 'bar2',
        intervals: 'default',
        timing: {
            requestStart: 120,
            responseStart: 180,
            responseEnd: 300
        }
    },
    {
        name: 'bar3',
        intervals: 'default',
        timing: {
            requestStart: 130,
            responseStart: 180,
            responseEnd: 320
        }
    },
    {
        name: 'bar4',
        intervals: 'default',
        timing: {
            requestStart: 300,
            responseStart: 350,
            responseEnd: 400
        }
    },
    {
        name: 'bar5',
        intervals: 'default',
        timing: {
            requestStart: 500,
            responseStart: 520,
            responseEnd: 550
        }
    }
];
const testIntervals = {
    default: [
        {
            name: 'waiting',
            color: 'rgb(207,196,152)',
            type: 'block',
            start: 'requestStart',
            end: 'responseStart'
        },
        {
            name: 'downloading',
            color: 'rgb(207,180,81)',
            type: 'block',
            start: 'responseStart',
            end: 'responseEnd'
        }
    ]
};

const flameChart = new FlameChart({
    canvas,
    data: currentData,
    marks,
    waterfall: {
        items: testItems,
        intervals: testIntervals
    },
    colors
});

flameChart.on('select', (node) => {
    setNodeView(node ? JSON.stringify({
        ...node,
        end: node.start + node.duration,
        children: undefined,
        parent: undefined
    }, null, '  ') : '');
});

window.addEventListener('resize', () => {
    flameChart.resize(...getWrapperWH());
});

onApplyStyles((styles) => {
    flameChart.setSettings({
        styles
    });
})

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
})

initQuery(flameChart);
initView(flameChart, treeConfig, {
    ...defaultRenderSettings.styles,
    ...defaultTimeGridSettings.styles,
    ...defaultTimeGridPluginSettings.styles,
    ...defaultTimeframeSelectorPluginSettings.styles
});
