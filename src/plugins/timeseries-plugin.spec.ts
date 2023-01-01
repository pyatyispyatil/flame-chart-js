import { describe, it, expect } from '@jest/globals';
import { TimeseriesPlugin } from './timeseries-plugin';

describe('TimeseriesPlugin', () => {
    it('smoke test', () => {
        const tsp = new TimeseriesPlugin('name', 'pink', [
            [1, 10],
            [2, 20],
            [3, 30],
            [4, 40],
            [5, 50],
        ]);

        let positions: [number, number][] = [];
        tsp.renderEngine = {
            positionX: 1,
            getRealView: () => 3,
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
        tsp.render();
        console.log('[positions]', positions);

        expect(positions[0][1]).toBe(100);
        expect(positions[positions.length - 1][1]).toBe(100);

        tsp.renderEngine.positionX = 5;
        tsp.renderEngine.getRealView = () => 6;

        tsp.render();
        console.log('[positions]', positions);

        tsp.renderEngine.positionX = 0;
        tsp.render();
        console.log('[positions]', positions);

        expect(1).toBe(1);
    });
});
