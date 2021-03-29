import FlameChart from './../../src/index.js';
import { generateRandomTree } from './test-data.js';

const wrapper = document.getElementById('wrapper');
const canvas = document.getElementById('canvas');

const nodeView = document.getElementById('selected-node');

const updateButton = document.getElementById('button');

const inputsData = {
    count: 50000,
    start: 500,
    end: 5000,
    minChild: 1,
    maxChild: 3
};

const addInputs = (inputsDict) => Object.entries(inputsDict).map(([name, initialValue]) => {
    const input = document.getElementById(name);

    input.value = initialValue;
    input.addEventListener('change', (e) => inputsDict[name] = parseInt(e.target.value));
})

addInputs(inputsData);

const performanceInput = document.getElementById('performance');

let performance = true;

performanceInput.addEventListener('change', (e) => {
    performance = e.target.checked;

    flameChart.setSettings({
        performance
    });
});


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

const generateData = () => generateRandomTree(inputsData);

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
    settings: {
        performance
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

