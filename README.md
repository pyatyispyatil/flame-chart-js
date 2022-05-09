# flame-chart-js

[![npm flame-chart-js package](https://img.shields.io/npm/v/flame-chart-js)](https://www.npmjs.com/package/flame-chart-js)

![image](https://user-images.githubusercontent.com/4976306/118173754-aa1a0e00-b436-11eb-99e8-0b4ec10551e6.png)

### Installation

`npm i flame-chart-js`

### Demo

https://pyatyispyatil.github.io/flame-chart-js

### Roadmap

You can find some [plans on the wiki](https://github.com/pyatyispyatil/flame-chart-js/wiki/Roadmap)

### Usage

#### Initialization


You can ignore any of the marks, data, or waterfall arguments to initialize only the items you want. The flame chart will automatically adjust and hide unused plugins.

```js
import FlameChart from 'flame-chart-js';

const canvas = document.getElementById('canvas');

canvas.width = 800;
canvas.height = 400;

const flameChart = new FlameChart({
    canvas, // mandatory
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
    waterfall: { /* ... */ },
    colors: {
        'task': '#FFFFFF',
        'sub-task': '#000000'
    },
    settings: {
        options: {
            tooltip: () => {/*...*/}, // see section "Custom Tooltip" below
            timeUnits: 'ms'
        },
        styles: customStyles // see section "Styles" below
    }
});

flameChart.on('select', (node, type) => {
    /*...*/
});
```

#### Public methods

```ts
// set zoom, which start argument is a left bound and end argument is a right bound 
setZoom = (start: number, end: number) => void;

// set only position of the flame-chart
setFlameChartPosition = ({ x: number, y: number }) => void;

// render all when animationFrame fired
render = () => void;

// set new data for the flame-chart
setData = (data: Data) => void;

// set marks for marks plugin
setMarks = (data: Marks) => void;

// resize canvas
resize = (width: number, height: number) => void;

// apply new settings, which includes styles or something else
setSettings = (settings: Object) => void;
```

#### Settings

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
    "tooltipBackgroundColor": "white",
    "headerHeight": 14,
    "headerColor": "rgba(112, 112, 112, 0.25)",
    "headerStrokeColor": "rgba(112, 112, 112, 0.5)",
    "headerTitleLeftPadding": 16
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
    "overlayColor": "rgba(112, 112, 112, 0.5)",
    "graphStrokeColor": "rgb(0, 0, 0, 0.2)",
    "graphFillColor": "rgb(0, 0, 0, 0.25)",
    "bottomLineColor": "rgb(0, 0, 0, 0.25)",
    "knobColor": "rgb(131, 131, 131)",
    "knobStrokeColor": "white",
    "knobSize": 6,
    "height": 60,
    "backgroundColor": "white"
  },
  "waterfallPlugin": {
    "defaultHeight": 150
  },
  "togglePlugin": {
    "height": 16,
    "color": "rgb(202,202,202, 0.25)",
    "strokeColor": "rgb(138,138,138, 0.50)",
    "dotsColor": "rgb(97,97,97)",
    "fontColor": "black",
    "font": "10px sans-serif",
    "triangleWidth": 10,
    "triangleHeight": 7,
    "triangleColor": "black",
    "leftPadding": 10
  }
}
```

You can override whatever style you want. For example:

```json
{
  "main": {
    "blockHeight": 20
  }
}
```

After applying this style, the blocks of the flame chart will be 20 pixels high instead of 16 pixels.

##### Custom Tooltip

You can override or prevent the tooltip render by defining this within the settings objet.

```ts
{
  options: {
    tooltip: undefined
  }
}
```

For example:

```ts
// prevent tooltip render
chart.setSettings({ options: { tooltip: false }});

// override tooltip render
chart.setSettings({ 
  options: {
      tooltip : (data, renderEngine, mouse) => undefined
  }
});
```

#### [Data types](https://github.com/pyatyispyatil/flame-chart-js/blob/master/src/types.ts#L1)

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

type WaterfallItems = Array<{
    name: string,
    intervals: string | WaterfallInterval,
    timing: {
        [string: key]: number
    }
}>

type WaterfallInterval = {
    name: string,
    color: string,
    type: 'block' | 'line',
    start: string, // timing name
    end: string // timing name
}

type WaterfallIntervals = {
    [string: intervalName]: WaterfallInterval
}

type Waterfall = {
    items: WaterfallItems,
    intervals: WaterfallIntervals
}
```

#### Updating

```js
flameChart.setData(newData);
flameChart.setMarks(newMarks);
flameChart.setWaterfall(newWaterfall);
```

#### Scaling

```js
window.addEventListener('resize', () => {
    flameChart.resize(window.innerWidth, window.innerHeight);
});
```
