import FlameChart from './../../src/index.js';
import { generateRandomTree } from './../../src/test-data.js';

const wrapper = document.getElementById('wrapper');
const canvas = document.getElementById('canvas');

const nodeView = document.getElementById('selected-node');

const updateButton = document.getElementById('button');

const startInput = document.getElementById('start');
const durationInput = document.getElementById('duration');
const countInput = document.getElementById('count');
const levelsInput = document.getElementById('levels');

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

let duration = 5000;
let start = 500;
let count = 500;
let levels = 10;

const generateData = () => generateRandomTree(levels, count, start, duration);

const getWrapperWH = () => {
    const style = window.getComputedStyle(wrapper, null);

    return [
        parseInt(style.getPropertyValue('width')),
        parseInt(style.getPropertyValue('height')) - 4
    ];
}

const [width, height] = getWrapperWH();

const query = location.search

canvas.width = width;
canvas.height = height;

const flameChart = new FlameChart({
    canvas,
    data: query ? [] : generateData(),
    timestamps,
    colors,
    config: {
        performance: true
    }
});

flameChart.on('select', (node) => {
    nodeView.innerHTML = node ? JSON.stringify({
        ...node,
        end: node.start + node.duration,
        children: undefined
    }, null, '  ') : '';
});

window.addEventListener('resize', () => {
    flameChart.resize(...getWrapperWH());
});

updateButton.addEventListener('click', () => {
    flameChart.setData(generateData());
});

if (query) {
    const args = query
        .split('?')
        .map((arg) => arg.split('='))
        .reduce((acc, [key, value]) => {
            acc[key] = value;

            return acc;
        }, {});

    if (args.file) {
        fetch(args.file)
            .then((res) => res.text())
            .then((data) => {
                flameChart.setData(JSON.parse(data));
                flameChart.resetView();
            });
    }
}

startInput.value = start;
durationInput.value = duration;
countInput.value = count;
levelsInput.value = levels;

startInput.addEventListener('change', (e) => start = parseInt(e.target.value));
durationInput.addEventListener('change', (e) => duration = parseInt(e.target.value));
countInput.addEventListener('change', (e) => count = parseInt(e.target.value));
levelsInput.addEventListener('change', (e) => levels = parseInt(e.target.value));

