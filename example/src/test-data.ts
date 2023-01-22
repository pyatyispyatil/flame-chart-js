import { FlameChartNode, WaterfallIntervals, WaterfallItems } from '../../src';

const chars = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';

const randomString = (length, minLength = 4) => {
    const rndLength = rnd(length, minLength);
    let str = '';

    for (let i = rndLength; i--; ) {
        str += chars[rnd(chars.length - 1)];
    }

    return str;
};

const rnd = (max, min = 0) => Math.round(Math.random() * (max - min)) + min;
const rndFloat = (max, min = 0) => Math.random() * (max - min) + min;
const rndItem = <T>(arr: T[]): T => arr[rnd(arr.length - 1)];

type Level = {
    children?: Level[];
};

type Layer = { rest: number; children: Level[] };

const generateRandomLevel = (count: number, minChild = 1, maxChild = 10): Layer => {
    const childrenCount = count ? rnd(Math.min(count, maxChild), Math.min(count, minChild)) : 0;
    const children = Array(childrenCount)
        .fill(null)
        .map((): Level => ({ children: [] }));
    const rest = count - childrenCount;

    return {
        rest,
        children,
    };
};

const generateRandomNesting = (count: number, minChild: number, maxChild: number) => {
    const levels: Level[][][] = [];

    let rest = count;
    let isStopped = false;

    while (rest > 0 && !isStopped) {
        if (!levels.length) {
            const layer = generateRandomLevel(rest, Math.min(minChild, 1), maxChild);

            levels.push([layer.children]);
            rest = layer.rest;
        } else {
            const level: Level[][] = levels[levels.length - 1];
            const innerLevel: Level[][] = [];

            level.forEach((subLevel) => {
                subLevel.forEach((subSubLevel) => {
                    const layer = generateRandomLevel(rest, minChild, maxChild);

                    subSubLevel.children = layer.children;
                    rest = layer.rest;
                    innerLevel.push(layer.children);
                });
            });

            if (!innerLevel.length) {
                isStopped = true;
            } else {
                levels.push(innerLevel);
            }
        }
    }

    console.log(
        'Total count:',
        levels.reduce((acc, level) => level.reduce((acc, subLevel) => acc + subLevel.length, acc), 0)
    );

    return levels[0][0];
};

const map = <T extends { children?: T[] }>(nodes: T[], cb: (nodes: T[], parent?: T) => T[], parent?: T): T[] => {
    return cb(nodes, parent).map((item) => {
        item.children = item.children ? map(item.children, cb, item) : [];

        return item;
    });
};

export type TreeConfig = {
    count: number;
    start: number;
    end: number;
    minChild: number;
    thinning: number;
    maxChild: number;
    colorsMonotony: number;
    colorsCount: number;
};

export type WaterfallConfig = {
    count: number;
    itemsOnLine: number;
    thinning: number;
    basesCount: number;
    baseThinning: number;
    start: number;
    end: number;
};

export const treeConfigDefaults: TreeConfig = {
    count: 100000,
    start: 500,
    end: 5000,
    minChild: 1,
    maxChild: 3,
    thinning: 12,
    colorsMonotony: 40,
    colorsCount: 10,
};

export const waterfallConfigDefaults: WaterfallConfig = {
    count: 100,
    thinning: 15,
    itemsOnLine: 5,
    basesCount: 4,
    baseThinning: 40,
    start: 0,
    end: 4500,
};

export const generateRandomTimestamps = (
    count: number,
    thinning: number,
    start: number,
    end: number
): { start: number; end: number; duration: number }[] => {
    const timestamps =
        count > 1
            ? Array(count - 1)
                  .fill(null)
                  .map(() => rndFloat(start, end))
                  .concat(start, end)
                  .sort((a, b) => a - b)
            : [start, end];

    return Array(count)
        .fill(null)
        .map((_, index) => {
            const currentWindow = timestamps[index + 1] - timestamps[index];
            const start = timestamps[index] + rndFloat(currentWindow, 0) * (rndFloat(thinning) / 100);
            const end = timestamps[index + 1] - rndFloat(currentWindow, 0) * (rndFloat(thinning) / 100);
            const duration = end - start;

            return { start, end, duration };
        });
};

export const generateRandomTree = ({
    count,
    start,
    end,
    minChild,
    maxChild,
    thinning,
    colorsMonotony,
    colorsCount,
}: TreeConfig): FlameChartNode[] => {
    const rootNodes = generateRandomNesting(count, minChild, maxChild) as FlameChartNode[];
    const types = Array(colorsCount)
        .fill(null)
        .map(() => randomString(10));
    let counter = 0;
    let typesCounter = 0;
    let currentType = types[typesCounter];

    const mappedNestingArrays = map(rootNodes, (nodes: FlameChartNode[], parent?: FlameChartNode) => {
        const itemsCount = nodes.length;
        const innerStart = parent?.start ? parent.start : start;
        const innerEnd = typeof parent?.duration === 'number' ? innerStart + parent?.duration : end;

        const timestamps = generateRandomTimestamps(itemsCount, thinning, innerStart, innerEnd);

        nodes.forEach((item, index) => {
            if (counter > colorsMonotony) {
                counter = 0;
                currentType = types[typesCounter];
                typesCounter++;

                if (typesCounter >= types.length) {
                    typesCounter = 0;
                }
            }

            item.start = timestamps[index].start;
            item.duration = timestamps[index].duration;
            item.name = randomString(14);
            item.type = currentType;

            counter++;
        });

        return nodes;
    });

    console.log('[generateRandomTree]', mappedNestingArrays);

    return mappedNestingArrays;
};

export const generateRandomWaterfallItems = ({
    count,
    itemsOnLine,
    basesCount,
    baseThinning,
    thinning,
    start,
    end,
}: WaterfallConfig): WaterfallItems => {
    const items: WaterfallItems = [];
    const types = Object.keys(waterfallIntervals);
    const bases = generateRandomTimestamps(basesCount, baseThinning, start, end);

    for (let i = 0; i < count; i += itemsOnLine) {
        const base = bases[Math.floor(rndFloat(basesCount))];
        const timestamps = generateRandomTimestamps(itemsOnLine, thinning, base.start, base.end);

        items.push(
            ...timestamps.map(({ start, end }) => ({
                name: randomString(14),
                timing: {
                    requestStart: start,
                    responseStart: rndFloat(start, end),
                    responseEnd: end,
                },
                intervals: rndItem(types),
            }))
        );
    }

    console.log('[generateRandomWaterfallItems]', items);

    return items;
};

export const waterfallIntervals: WaterfallIntervals = {
    js: [
        {
            name: 'waiting',
            color: 'rgb(207,196,152)',
            type: 'block',
            start: 'requestStart',
            end: 'responseStart',
        },
        {
            name: 'downloading',
            color: 'rgb(207,180,81)',
            type: 'block',
            start: 'responseStart',
            end: 'responseEnd',
        },
    ],
    css: [
        {
            name: 'waiting',
            color: 'rgb(144,188,210)',
            type: 'block',
            start: 'requestStart',
            end: 'responseStart',
        },
        {
            name: 'downloading',
            color: 'rgb(90,169,208)',
            type: 'block',
            start: 'responseStart',
            end: 'responseEnd',
        },
    ],
};

export const marks = [
    {
        shortName: 'DCL',
        fullName: 'DOMContentLoaded',
        timestamp: 2000,
        color: '#d7c44c',
    },
    {
        shortName: 'LE',
        fullName: 'LoadEvent',
        timestamp: 2100,
        color: '#4fd24a',
    },
    {
        shortName: 'TTI',
        fullName: 'Time To Interactive',
        timestamp: 3000,
        color: '#4b7ad7',
    },
];
