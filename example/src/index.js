import FlameChart from './../../src/index.js';
import { generateRandomTree } from './test-data.js';

const wrapper = document.getElementById('wrapper');
const canvas = document.getElementById('canvas');

const nodeView = document.getElementById('selected-node');
const inputsContainer = document.getElementById('inputs');

const updateButton = document.getElementById('button');

const inputsData = [
    { name: 'count', value: 75000 },
    { name: 'start', value: 500 },
    { name: 'end', value: 5000 },
    { name: 'minChild', value: 0 },
    { name: 'maxChild', value: 3 },
    { name: 'thinning', units: '%', value: 12 },
    { name: 'colorsMonotony', value: 40 },
    { name: 'colorsCount', value: 10 },
];

const addInputs = (inputsDict) => inputsDict.map(({ name, value, units }, index) => {
    const input = document.createElement('input');
    const label = document.createElement('label');
    const div = document.createElement('div');

    div.classList.add('inputWrapper');

    label.classList.add('inputLabel');
    label.setAttribute('for', name);
    label.innerHTML = `${name}${units ? `(${units})` : ''}:`;

    input.id = name;
    input.value = value;
    input.classList.add('input');
    input.setAttribute('type', 'number');
    input.addEventListener('change', (e) => inputsDict[index].value = parseInt(e.target.value));

    div.appendChild(label);
    div.appendChild(input);

    inputsContainer.appendChild(div);
});

const getInputValues = () => inputsData.reduce((acc, {name, value}) => {
    acc[name] = value;
    return acc;
}, {})

addInputs(inputsData);

const performanceInput = document.getElementById('performance');
let performance = true;
performanceInput.checked = performance;

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

const generateData = () => generateRandomTree(getInputValues());

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
        fetch(decodeURIComponent(args.file), {
            method: 'GET',
            mode: 'no-cors'
        })
            .then((res) => res.text())
            .then((data) => {
                flameChart.setData(JSON.parse(data));
                flameChart.resetView();
            });
    }
}
