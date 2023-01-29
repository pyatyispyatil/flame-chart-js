import { RenderEngine } from '../../engines/render-engine';
import { OffscreenRenderEngine } from '../../engines/offscreen-render-engine';

const castLevelToHeight = (level: number, minLevel: number, levelHeight: number, totalheight: number) => {
    return totalheight - (level - minLevel) * levelHeight;
};

export type ChartPoint = [number, number];

export type ChartPoints = ChartPoint[];

export type ChartLineType = 'smooth' | 'bar' | 'line';

export type ChartStyle = {
    fillColor: string;
    lineWidth: number;
    lineDash: number[];
    lineColor: string;
    type: ChartLineType;
};

export const defaultChartStyle: ChartStyle = {
    fillColor: 'rgba(0, 0, 0, 0.1)',
    lineWidth: 1,
    lineDash: [],
    lineColor: 'rgba(0, 0, 0, 0.5)',
    type: 'smooth',
};

export const renderChart = ({
    engine,
    points,
    style,
    min,
    max,
}: {
    engine: RenderEngine | OffscreenRenderEngine;
    points: ChartPoints;
    min: number;
    max: number;
    style?: Partial<ChartStyle>;
}) => {
    const resolvedStyle = {
        ...defaultChartStyle,
        ...(style ?? {}),
    };

    engine.setCtxValue('strokeStyle', resolvedStyle.lineColor);
    engine.setCtxValue('fillStyle', resolvedStyle.fillColor);
    engine.setCtxValue('lineWidth', resolvedStyle.lineWidth);
    engine.callCtx('setLineDash', resolvedStyle.lineDash);

    engine.ctx.beginPath();

    const levelHeight = (engine.height - engine.charHeight - 4) / (max - min);

    if (points.length > 1) {
        const xy = points.map(([time, level]) => [
            engine.timeToPosition(time),
            castLevelToHeight(level, min, levelHeight, engine.height),
        ]);

        engine.ctx.moveTo(xy[0][0], engine.height);
        engine.ctx.lineTo(xy[0][0], xy[0][1]);

        if (resolvedStyle.type === 'smooth' || !resolvedStyle.type) {
            for (let i = 1; i < xy.length - 2; i++) {
                const xc = (xy[i][0] + xy[i + 1][0]) / 2;
                const yc = (xy[i][1] + xy[i + 1][1]) / 2;

                engine.ctx.quadraticCurveTo(xy[i][0], xy[i][1], xc, yc);
            }

            const preLast = xy[xy.length - 2];
            const last = xy[xy.length - 1];

            engine.ctx.quadraticCurveTo(preLast[0], preLast[1], last[0], last[1]);
            engine.ctx.quadraticCurveTo(last[0], last[1], last[0], engine.height);
        } else if (resolvedStyle.type === 'line') {
            for (let i = 1; i < xy.length; i++) {
                engine.ctx.lineTo(xy[i][0], xy[i][1]);
            }
        } else if (resolvedStyle.type === 'bar') {
            for (let i = 0; i < xy.length; i++) {
                const currentPoint = xy[i];
                const prevPoint = xy[i - 1] || currentPoint;
                const nextPoint = xy[i + 1];

                const barWidthLeft = (currentPoint[0] - prevPoint[0]) / 2;
                const barWidthRight = nextPoint ? (nextPoint[0] - currentPoint[0]) / 2 : barWidthLeft;

                engine.ctx.lineTo(prevPoint[0] + barWidthLeft, currentPoint[1]);
                engine.ctx.lineTo(currentPoint[0] + barWidthRight, currentPoint[1]);

                if (nextPoint) {
                    engine.ctx.lineTo(currentPoint[0] + barWidthRight, nextPoint[1]);
                } else {
                    engine.ctx.lineTo(currentPoint[0] + barWidthRight, engine.height);
                }
            }

            engine.ctx.lineTo(xy[xy.length - 1][0], engine.height);
        }
    }

    engine.ctx.closePath();

    engine.ctx.stroke();
    engine.ctx.fill();
};

export const binarySearch = (array: ChartPoints, value: number, outside: boolean = true) => {
    if (array[0][0] >= value) {
        return outside ? array[0] : null;
    }

    if (array[array.length - 1][0] <= value) {
        return outside ? array[array.length - 1] : null;
    }

    if (array.length <= 1) {
        return array[0];
    }

    let start = 0;
    let end = array.length - 1;

    while (start <= end) {
        const mid = Math.ceil((end + start) / 2);

        if (value >= array[mid - 1][0] && value <= array[mid][0]) {
            const index = Math.abs(value - array[mid - 1][0]) < Math.abs(value - array[mid][0]) ? mid - 1 : mid;

            return array[index];
        }

        if (array[mid][0] < value) {
            start = mid + 1;
        } else {
            end = mid - 1;
        }
    }

    return null;
};
