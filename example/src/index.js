import FlameChart from './../../src/index.js';
import { generateRandomTree } from './test-data.js';
import { query, initQuery } from './query.js';
import {
    initView,
    getInputValues,
    setNodeView,
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

const timestamps = [
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

const flameChart = new FlameChart({
    canvas,
    data: currentData,
    timestamps,
    colors,
    settings: {
        performance
    }
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
initView(flameChart, treeConfig);
