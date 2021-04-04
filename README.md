# flame-chart-js

[![npm flame-chart-js package](https://img.shields.io/npm/v/flame-chart-js)](https://www.npmjs.com/package/flame-chart-js)

![image](https://user-images.githubusercontent.com/4976306/113360257-15f65a80-9352-11eb-9658-4a191843cef7.png)

### Installation

`npm i flame-chart-js`

### Demo

https://pyatyispyatil.github.io/flame-chart-js/example/dist/index.html

### Usage

#### Initialization

```js
import FlameChart from 'flame-chart-js';

const canvas = document.getElementById('canvas');

canvas.width = 800;
canvas.height = 400;

const flameChart = new FlameChart({
    canvas,
    data: [
        {
            name: 'foo',
            start: 300,
            duration: 200,
            type: 'task',
            children: [
                {
                    name: 'foo',
                    start: 310,
                    duration: 50,
                    type: 'sub-task',
                    color: '#AA0000'
                }
            ]
        }
    ],
    timestamps: [
        {
            shortName: 'DCL',
            fullName: 'DOMContentLoaded',
            timestamp: 500
        }
    ],
    colors: {
        'task': '#FFFFFF',
        'sub-task': '#000000'
    },
    settings: {
        performance: true
    }
});

flameChart.on('select', (node) => {/*...*/});
```

#### Settings

`performance: boolean (default: true)` - turn on brief visualization when nearby blocks are sticking together.
This greatly improves performance, but sometimes reduces detail.

#### Data format

```ts
type Node = {
    name: string, // node name
    start: number, // node start time
    duration: number, // node duration
    type?: string, // node type (use it for custom colorization)
    color?: string, // node color (use it for current node colorization)
    children?: Array<Node>, // node children (same structure as for node)
};

type Data = Array<Node>;
```

#### Updating

```js
flameChart.setData(newData);
flameChart.setTimestamps(newTimestamps);
```

#### Scaling

```js
window.addEventListener('resize', () => {
    flameChart.resize(window.innerWidth, window.innerHeight);
});
```
