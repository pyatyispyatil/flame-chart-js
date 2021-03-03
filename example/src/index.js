import FlameChart from './../../src/index.js';
import { generateRandomTree } from './../../src/test-data.js';

const canvas = document.getElementById('root');

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

canvas.width = window.innerWidth - 40;
canvas.height = window.innerHeight / 2;

const flameChart = new FlameChart({
    canvas,
    data: generateData(),
    timestamps,
    colors
});

flameChart.on('select', (node) => {
    nodeView.innerHTML = node ? JSON.stringify({
        ...node, children: undefined
    }, null, '  ') : '';
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth - 40;
    canvas.height = window.innerHeight / 2;

    flameChart.update();
});

updateButton.addEventListener('click', () => {
    flameChart.setData(generateData());
});

startInput.value = start;
durationInput.value = duration;
countInput.value = count;
levelsInput.value = levels;

startInput.addEventListener('change', (e) => start = parseInt(e.target.value));
durationInput.addEventListener('change', (e) => duration = parseInt(e.target.value));
countInput.addEventListener('change', (e) => count = parseInt(e.target.value));
levelsInput.addEventListener('change', (e) => levels = parseInt(e.target.value));

