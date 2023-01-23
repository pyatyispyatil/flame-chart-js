import { Waterfall, WaterfallItem, WaterfallItemMeta } from '../../types';

function getValueByChoice<V, P extends string, T extends Record<P, V>>(
    array: T[],
    property: P,
    comparator: (firstValue: V, secondValue: V) => V,
    defaultValue: V
): V {
    if (array.length) {
        return array.reduce((acc: V, { [property]: value }: T) => comparator(acc, value), array[0][property]);
    }

    return defaultValue;
}

export type PreparedWaterfallInterval = {
    start: number;
    end: number;
    color: string;
    type: 'block' | 'line';
    name: string;
};

export type PreparedWaterfallTextBlock = {
    start: number;
    end: number;
};

export type PreparedWaterfallItem = {
    intervals: PreparedWaterfallInterval[];
    textBlock: PreparedWaterfallTextBlock;
    timing: WaterfallItem['timing'];
    name: string;
    min: number;
    max: number;
    index: number;
    meta?: WaterfallItemMeta[];
};

export const parseWaterfall = (waterfall: Waterfall): PreparedWaterfallItem[] => {
    return waterfall.items
        .map(({ name, intervals, timing, meta }, index) => {
            const resolvedIntervals = typeof intervals === 'string' ? waterfall.intervals[intervals] : intervals;
            const preparedIntervals: PreparedWaterfallInterval[] = resolvedIntervals
                .map(({ start, end, color, type, name }) => ({
                    start: typeof start === 'string' ? timing[start] : start,
                    end: typeof end === 'string' ? timing[end] : end,
                    color,
                    name,
                    type,
                }))
                .filter(({ start, end }) => typeof start === 'number' && typeof end === 'number');
            const blocks = preparedIntervals.filter(({ type }) => type === 'block');

            const blockStart = getValueByChoice(blocks, 'start', Math.min, 0);
            const blockEnd = getValueByChoice(blocks, 'end', Math.max, 0);

            const min = getValueByChoice(preparedIntervals, 'start', Math.min, 0);
            const max = getValueByChoice(preparedIntervals, 'end', Math.max, 0);

            return {
                intervals: preparedIntervals,
                textBlock: {
                    start: blockStart,
                    end: blockEnd,
                },
                name,
                timing,
                min,
                max,
                index,
                meta,
            };
        })
        .filter(({ intervals }) => intervals.length)
        .sort((a, b) => a.min - b.min || b.max - a.max);
};
