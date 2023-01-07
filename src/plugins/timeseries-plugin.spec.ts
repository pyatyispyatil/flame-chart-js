import { describe, it, expect } from '@jest/globals';
import { TimeseriesPlugin } from './timeseries-plugin';

function createTimeseriesPlugin(start: number, end: number) {
    const tsp = new TimeseriesPlugin({
        name: 'name',
        data: [
            [0, 0],
            [1, 10],
            [2, 20],
            [3, 30],
            [4, 40],
            [5, 50],
            [6, 60],
            [7, 70],
            [8, 80],
            [9, 90],
            [10, 100],
        ],
    });
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
        expect(positions).toMatchSnapshot();
    });

    it('in middle after end', () => {
        const positions = createTimeseriesPlugin(5, 10);

        expect(positions).toMatchSnapshot();
    });

    it('start after end', () => {
        const positions = createTimeseriesPlugin(11, 12);

        expect(positions).toMatchSnapshot();
    });
});
