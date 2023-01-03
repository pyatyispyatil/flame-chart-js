import { describe, it, expect } from '@jest/globals';
import { TimeseriesPlugin } from './timeseries-plugin';

function createTimeseriesPlugin(start: number, end: number) {
    const tsp = new TimeseriesPlugin('name', 'pink', [
        [1, 10],
        [2, 20],
        [3, 30],
        [4, 40],
        [5, 50],
        [6, 60],
        [7, 70],
        [8, 80],
        [9, 90],
    ]);
    tsp.height = 105;

    let positions: [number, number][] = [];
    tsp.renderEngine = {
        positionX: -1,
        getRealView: () => -1,
        setCtxColor: (c) => c,
        timeToPosition: (ts) => ts,
        ctx: {
            beginPath: () => (positions = []),
            moveTo: (x, y) => positions.push([x, y]),
            lineTo: (x, y) => positions.push([x, y]),
            closePath: () => null,
            stroke: () => null,
            strokeText: () => null,
            fill: () => null,
        },
    } as unknown as any;

    tsp.interactionsEngine = {
        addHitRegion: () => null,
    } as unknown as any;

    tsp.renderEngine.positionX = start;
    tsp.renderEngine.getRealView = () => end;

    tsp.render();

    expect(positions[0][1]).toBe(tsp.height);
    expect(positions[positions.length - 1][1]).toBe(tsp.height);

    return positions;
}

describe('TimeseriesPlugin', () => {
    it('before start and after end', () => {
        const positions = createTimeseriesPlugin(0, 10);
        expect(positions).toEqual([
            [0, 105],
            [0, 92.5],
            [1, 92.5],
            [1, 92.5],
            [2, 92.5],
            [2, 80],
            [3, 80],
            [3, 67.5],
            [4, 67.5],
            [4, 55],
            [5, 55],
            [5, 42.5],
            [6, 42.5],
            [6, 30],
            [7, 30],
            [7, 17.5],
            [8, 17.5],
            [8, 5],
            [9, 5],
            [9, -7.5],
            [9, -7.5],
            [10, -7.5],
            [10, 105],
        ]);
    });

    it('in middle after end', () => {
        const positions = createTimeseriesPlugin(5, 10);

        expect(positions).toEqual([
            [5, 105],
            [5, 5],
            [5, 5],
            [5, 42.5],
            [6, 42.5],
            [6, 30],
            [7, 30],
            [7, 17.5],
            [8, 17.5],
            [8, 5],
            [9, 5],
            [9, -7.5],
            [9, -7.5],
            [15, -7.5],
            [15, 105],
        ]);
    });

    it('in after start', () => {
        const positions = createTimeseriesPlugin(11, 12);
        console.log(positions);
        expect(positions).toEqual([
            [11, 105],
            [11, -7.5],
            [11, -7.5],
            [23, -7.5],
            [23, 105],
        ]);
    });
});
