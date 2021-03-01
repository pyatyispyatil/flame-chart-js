# flame-chart-js

### Installation
`npm i flame-chart-js`

### Demo
https://pyatyispyatil.github.io/flame-chart-js/example/

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
            type: 'sub-task'
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
    }
});
```

#### Updating

```js
flameChart.setData(newData);
```

#### Scaling

```js
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth - 40;
    canvas.height = window.innerHeight / 2;

    flameChart.update();
});
```
