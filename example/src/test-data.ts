import { Node, TimeseriesPoint, WaterfallIntervals } from '../../src';

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

type TreeConfig = {
    count: number;
    start: number;
    end: number;
    minChild: number;
    thinning: number;
    maxChild: number;
    colorsMonotony: number;
    colorsCount: number;
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
}: TreeConfig): Node[] => {
    const rootNodes = generateRandomNesting(count, minChild, maxChild) as Node[];
    const types = Array(colorsCount)
        .fill(null)
        .map(() => randomString(10));
    let counter = 0;
    let typesCounter = 0;
    let currentType = types[typesCounter];

    const mappedNestingArrays = map(rootNodes, (nodes: Node[], parent?: Node) => {
        const itemsCount = nodes.length;
        const innerStart = parent?.start ? parent.start : start;
        const innerEnd = typeof parent?.duration === 'number' ? innerStart + parent?.duration : end;

        const timestamps =
            itemsCount > 1
                ? Array(itemsCount - 1)
                      .fill(null)
                      .map(() => rndFloat(innerStart, innerEnd))
                      .concat(innerStart, innerEnd)
                      .sort((a, b) => a - b)
                : [innerStart, innerEnd];

        nodes.forEach((item, index) => {
            const currentWindow = timestamps[index + 1] - timestamps[index];

            if (counter > colorsMonotony) {
                counter = 0;
                currentType = types[typesCounter];
                typesCounter++;

                if (typesCounter >= types.length) {
                    typesCounter = 0;
                }
            }

            const start = timestamps[index] + rndFloat(currentWindow, 0) * (rndFloat(thinning) / 100);
            const end = timestamps[index + 1] - rndFloat(currentWindow, 0) * (rndFloat(thinning) / 100);

            item.start = start;
            item.duration = end - start;
            item.name = randomString(14);
            item.type = currentType;

            counter++;
        });

        return nodes;
    });

    console.log('[generateRandomTree]', mappedNestingArrays);

    return mappedNestingArrays;
};

export const waterfallItems = [
    {
        name: 'foo',
        intervals: 'default',
        timing: {
            requestStart: 2050,
            responseStart: 2500,
            responseEnd: 2600,
        },
    },
    {
        name: 'bar',
        intervals: 'default',
        timing: {
            requestStart: 2120,
            responseStart: 2180,
            responseEnd: 2300,
        },
    },
    {
        name: 'bar2',
        intervals: 'default',
        timing: {
            requestStart: 2120,
            responseStart: 2180,
            responseEnd: 2300,
        },
    },
    {
        name: 'bar3',
        intervals: 'default',
        timing: {
            requestStart: 2130,
            responseStart: 2180,
            responseEnd: 2320,
        },
    },
    {
        name: 'bar4',
        intervals: 'default',
        timing: {
            requestStart: 2300,
            responseStart: 2350,
            responseEnd: 2400,
        },
    },
    {
        name: 'bar5',
        intervals: 'default',
        timing: {
            requestStart: 2500,
            responseStart: 2520,
            responseEnd: 2550,
        },
    },
];
export const waterfallIntervals: WaterfallIntervals = {
    default: [
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

export function generateTimeseriesData(inputs: TreeConfig) {
    const timeseriesData: TimeseriesPoint[] = [];
    const period = inputs.end - inputs.start;
    const numberOfPoints = 100;
    const kk = period / numberOfPoints;

    for (let timestamp = inputs.start; timestamp < inputs.end; timestamp += kk) {
        const value = Math.random() * 100;
        timeseriesData.push([timestamp, value]);
    }
    return timeseriesData;
}
