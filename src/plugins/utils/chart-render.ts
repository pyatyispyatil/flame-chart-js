import { RenderEngine } from '../../engines/render-engine';
import { OffscreenRenderEngine } from '../../engines/offscreen-render-engine';
import { last } from '../../utils';
import { Timeseries, TimeseriesChart, TooltipField } from '../../types';
import { PreparedTimeseries, TimeseriesPreparedChart } from '../timeseries-plugin';

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

export const prepareTmeseries = (timeseries: Timeseries): PreparedTimeseries => {
    const timeboxes: { start: number; end: number }[] = [];

    const preparedTimeseries: TimeseriesPreparedChart[] = timeseries.map((chart) => ({
        group: chart.units && !chart.group ? chart.units : 'default',
        ...chart,
        style: {
            lineWidth: 1,
            fillColor: 'rgba(0, 0, 0, 0.15)',
            lineColor: 'rgba(0, 0, 0, 0.20)',
            lineDash: [],
            type: 'smooth',
            ...(chart.style ?? {}),
        },
    }));

    const summary: Record<string, { min: number; max: number }> = preparedTimeseries.reduce(
        (acc, { points, group, min, max }, index) => {
            if (!acc[group]) {
                acc[group] = {
                    min: min ?? points[0][1],
                    max: max ?? points[0][1],
                };
            }

            timeboxes[index] = {
                start: points[0][0],
                end: last(points)[0],
            };

            points.forEach(([time, value]) => {
                if (min === undefined) {
                    acc[group].min = Math.min(acc[group].min, value);
                }

                if (max === undefined) {
                    acc[group].max = Math.max(acc[group].max, value);
                }

                timeboxes[index].start = Math.min(timeboxes[index].start, time);
                timeboxes[index].end = Math.max(timeboxes[index].end, time);
            });

            return acc;
        },
        {}
    );

    const min = Math.min(...timeboxes.map(({ start }) => start));
    const max = Math.max(...timeboxes.map(({ end }) => end));

    return {
        summary,
        total: {
            min,
            max,
        },
        timeseries: preparedTimeseries,
        timeboxes: timeboxes,
    };
};

export const getMinMax = (
    points: ChartPoints,
    chart: TimeseriesChart,
    summary: Record<string, { min: number; max: number }>
): { min: number; max: number } => {
    return chart.dynamicMinMax
        ? points.reduce(
              (acc, [, value]) => {
                  acc.min = Math.min(acc.min, value);
                  acc.max = Math.max(acc.max, value);

                  return acc;
              },
              { min: chart.min ?? Infinity, max: chart.max ?? -Infinity }
          )
        : chart.group
        ? summary[chart.group]
        : {
              min: -Infinity,
              max: Infinity,
          };
};

export const renderChartTooltipFields = (timestamp: number, { timeseries }: PreparedTimeseries): TooltipField[] => {
    const targetPoints: Record<string, string[]> = timeseries.reduce((acc, { points, units, name, group }) => {
        const point = chartPointsBinarySearch(points, timestamp);
        const hasGroup = group !== units && group !== 'default';
        const resolvedGroup = hasGroup ? group : 'default';

        let result = '';

        if (point) {
            if (name) {
                result += name + ': ';
            }

            result += point[1].toFixed(2);

            if (units) {
                result += units;
            }
        }

        if (!acc[resolvedGroup]) {
            acc[resolvedGroup] = [];
        }

        acc[resolvedGroup].push(result);

        return acc;
    }, {});

    return Object.entries(targetPoints).reduce((acc: TooltipField[], [group, values]) => {
        if (group !== 'default') {
            acc.push({
                text: group,
                color: 'black',
            });
        }

        values.forEach((value) => {
            acc.push({
                text: value,
            });
        });

        return acc;
    }, []);
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

            const preLastPoint = xy[xy.length - 2];
            const lastPoint = last(xy);

            engine.ctx.quadraticCurveTo(preLastPoint[0], preLastPoint[1], lastPoint[0], lastPoint[1]);
            engine.ctx.quadraticCurveTo(lastPoint[0], lastPoint[1], lastPoint[0], engine.height);
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

            engine.ctx.lineTo(last(xy)[0], engine.height);
        }
    }

    engine.ctx.closePath();

    engine.ctx.stroke();
    engine.ctx.fill();
};

export const chartPointsBinarySearch = (
    array: ChartPoints,
    value: number,
    outside: boolean = true
): ChartPoint | null => {
    if (array[0][0] >= value) {
        return outside ? array[0] : null;
    }

    if (last(array)[0] <= value) {
        return outside ? last(array) : null;
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
