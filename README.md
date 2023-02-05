# flame-chart-js

[![npm flame-chart-js package](https://img.shields.io/npm/v/flame-chart-js)](https://www.npmjs.com/package/flame-chart-js)

![image](https://user-images.githubusercontent.com/4976306/216842335-a771eb70-f8cd-46dc-ba60-3a399aaaf585.png)

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
                    color: '#AA0000',
                },
            ],
        },
    ],
    marks: [
        {
            shortName: 'DCL',
            fullName: 'DOMContentLoaded',
            timestamp: 500,
        },
    ],
    waterfall: {
        /* ... */
    },
    timeseries: [/* ... */],
    timeframeTimeseries: [/* ... */],
    colors: {
        task: '#FFFFFF',
        'sub-task': '#000000',
    },
    settings: {
        options: {
            tooltip: () => {
                /*...*/
            }, // see section "Custom Tooltip" below
            timeUnits: 'ms',
        },
        styles: customStyles, // see section "Styles" below
    },
});

flameChart.on('select', (node, type) => {
    /*...*/
});
```

#### Public methods

```ts
// set zoom, which start argument is a left bound and end argument is a right bound
type setZoom = (start: number, end: number) => void;

// set only position of the flame-chart
type setFlameChartPosition = ({ x: number, y: number }) => void;

// render all when animationFrame fired
type render = () => void;

// set new data for the flame-chart
type setData = (data: Data) => void;

// set marks for marks plugin
type setMarks = (data: Marks) => void;

// set chart data for timeseries plugin
type setTimeseries = (data: Timeseries) => void;

// resize canvas
type resize = (width: number, height: number) => void;

// apply new settings, which includes styles or something else
type setSettings = (settings: Object) => void;
```

#### Usage with plugins

```ts
import { FlameChartContainer, TimeGridPlugin, MarksPlugin, FlameChartPlugin } from 'flame-chart-js';

const canvas = document.getElementById('canvas');

canvas.width = 800;
canvas.height = 400;

const flameChart = new FlameChartContainer({
    canvas, // mandatory
    plugins: [
        new TimeGridPlugin({ styles: timeGridPluginStyles }),
        new MarksPlugin({ data: marks }),
        new FlameChartPlugin({ data: flameChartData1, colors: flameChartColors, name: 'flameChart1' }),
        new FlameChartPlugin({ data: flameChartData2, colors: flameChartColors, name: 'flameChart2' }),
    ],
    settings: {
        options: {
            tooltip: () => {
                /*...*/
            }, // see section "Custom Tooltip" below
            timeUnits: 'ms',
        },
        styles: customStyles, // see section "Styles" below
    },
});
```

#### Usage with React

You can use the [classic flame chart with react like this](https://github.com/pyatyispyatil/flame-chart-js/blob/master/example/src/components/charts/flame-chart-wrapper.tsx) or [like this with pluggins](https://github.com/pyatyispyatil/flame-chart-js/blob/master/example/src/components/charts/flame-chart-container-wrapper.tsx).

#### Settings

##### Styles

You can override whatever style you want. For example:

```json
{
    "main": {
        "blockHeight": 20
    }
}
```

After applying this style, the blocks of the flame chart will be 20 pixels high instead of 16 pixels.

To learn more about styles, you can take a look at [the example](https://pyatyispyatil.github.io/flame-chart-js) - 
all styles will be available in one of the dropdowns on the left side of the interface.

##### Custom Tooltip

You can override or prevent the tooltip render by defining this within the settings objet.

```ts
{
    options: {
        tooltip: undefined;
    }
}
```

For example:

```ts
// prevent tooltip render
chart.setSettings({ options: { tooltip: false } });

// override tooltip render
chart.setSettings({
    options: {
        tooltip: (data, renderEngine, mouse) => undefined,
    },
});
```

#### [Data types](https://github.com/pyatyispyatil/flame-chart-js/blob/master/src/types.ts#L1)

```ts
type Mark = {
    shortName: string;
    fullName: string;
    timestamp: number;
    color: string;
};

type Marks = Array<Mark>;

type Node = {
    name: string; // node name
    start: number; // node start time
    duration: number; // node duration
    type?: string; // node type (use it for custom colorization)
    color?: string; // node color (use it for current node colorization)
    children?: Array<Node>; // node children (same structure as for node)
};

type Nodes = Array<Node>;

type WaterfallItems = Array<{
    name: string;
    intervals: string | WaterfallInterval; // if you use a string, then the intervals will be taken from the array of intervals
    timing: {
        [string: key]: number; // The timing name must match the start and end fields within the described intervals
    };
}>;

type WaterfallInterval = {
    name: string;
    color: string;
    type: 'block' | 'line';
    start: string; // timing name
    end: string; // timing name
};

type WaterfallIntervals = {
    [string: intervalName]: WaterfallInterval;
};

type Waterfall = {
    items: WaterfallItems;
    intervals: WaterfallIntervals;
};

type TimeseriesChart = {
  points: [number, number][]; // data points to render - the first element of the internal array is the timestamp and the second element is the value of the point
  group?: string; // group to calculate common minimum, maximum for multiple charts
  units?: string; // points to be used for grouping (if the group field is missing) and for rendering the tooltip (for example '%', 'mb', 'kb/s')
  name?: string; // the name will be used to display the tooltip
  style?: Partial<ChartStyle>;
  min?: number; // if absent, then min and max will be calculated from points
  max?: number; // same
  dynamicMinMax?: boolean; // dynamically calculate minimum and maximum based on current zoom level 
};

type Timeseries = TimeseriesChart[];
```

#### Updating

```js
flameChart.setData(newData);
flameChart.setMarks(newMarks);
flameChart.setWaterfall(newWaterfall);
flameChart.setTimeseries(newTimeseries);
```

#### Scaling

```js
window.addEventListener('resize', () => {
    flameChart.resize(window.innerWidth, window.innerHeight);
});
```

#### Plugins

##### You can create your own plugin

```ts
import { UIPlugin } from 'flame-chart-js';

class MyPlugin extends UIPlugin {
    constructor({ name = 'myOwnPlugin' }) {
        super(name);
    }

    height = 100; // height of the plugin in pixels

    // this method will be called on each render
    override render() {
        // do something
        this.renderEngine.addRectToRenderQueue('red', 10, 10, 20);
    }
}
```

## Local Development

```bash
npm i && npm start
```
