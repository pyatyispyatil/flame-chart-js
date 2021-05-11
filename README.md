# flame-chart-js

[![npm flame-chart-js package](https://img.shields.io/npm/v/flame-chart-js)](https://www.npmjs.com/package/flame-chart-js)

![image](https://user-images.githubusercontent.com/4976306/117810309-e0556300-b267-11eb-811e-180498fc2773.png)

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
    marks: [
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
        styles: customStyles // see section "Styles" below
    }
});

flameChart.on('select', (node) => {
    /*...*/
});
```

#### Public methods

```ts
// set zoom, which start argument is a left bound and end argument is a right bound 
setZoom = (start: number, end: number) => undefined;

// set only position of the flame-chart
setFlameChartPosition = ({ x: number, y: number }) => undefined;

// render all when animationFrame fired
render = () => undefined;

// set new data for the flame-chart
setData = (data: Data) => undefined;

// set marks for marks plugin
setMarks = (data: Marks) => undefined;

// resize canvas
resize = (width: number, height: number) => undefined; 

// apply new settings, which includes styles or something else
setSettings = (settings: Object) => undefined
```

#### Styles
##### Default styles
```json
{
  "main": {
    "blockHeight": 16,
    "blockPaddingLeftRight": 4,
    "backgroundColor": "white",
    "font": "10px sans-serif",
    "fontColor": "black",
    "tooltipHeaderFontColor": "black",
    "tooltipBodyFontColor": "#688f45",
    "tooltipBackgroundColor": "white"
  },
  "timeGrid": {
    "color": "rgb(126, 126, 126, 0.5)"
  },
  "timeGridPlugin": {
    "font": "10px sans-serif",
    "fontColor": "black"
  },
  "timeframeSelectorPlugin": {
    "font": "9px sans-serif",
    "fontColor": "black",
    "overlayColor": "rgba(112,112,112,0.5)",
    "knobColor": "rgb(131,131,131)",
    "knobSize": 6,
    "height": 60,
    "backgroundColor": "white"
  }
}
```

You can override whatever you want. For example:

```json
{
  "main": {
    "blockHeight": 20
  }
}
```
After applying this style, the blocks of the flame chart will be 20 pixels high instead of 16 pixels.

#### Data format

```ts
type Mark = {
    shortName: string,
    fullName: string,
    timestamp: number,
    color: string
};

type Marks = Array<Mark>;

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
flameChart.setMarks(newMarks);
```

#### Scaling

```js
window.addEventListener('resize', () => {
    flameChart.resize(window.innerWidth, window.innerHeight);
});
```
