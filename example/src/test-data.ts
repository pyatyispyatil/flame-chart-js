import { Node } from '../../src/index';

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
    children: Level[];
    parent: Level;
} | null;

type Layer = { rest: number; items: Level[] };

const generateRandomLevel = (count: number, minChild = 1, maxChild = 10, parent: Level): Layer => {
    const childrenCount = count ? rnd(Math.min(count, maxChild), Math.min(count, minChild)) : 0;
    const items = Array(childrenCount)
        .fill(null)
        .map((): Level => ({ children: [], parent }));
    const rest = count - childrenCount;

    if (parent) {
        parent.children = items;
    }

    return {
        rest,
        items,
    };
};

const generateRandomNesting = (count: number, minChild: number, maxChild: number, parent: Level) => {
    const levels: any[] = [];

    let rest = count;
    let isStopped = false;

    while (rest > 0 && !isStopped) {
        if (!levels.length) {
            const layer = generateRandomLevel(rest, Math.min(minChild, 1), maxChild, parent);

            levels.push([layer.items]);
            rest = layer.rest;
        } else {
            const level: Level[][] = levels[levels.length - 1];
            const innerLevel: Level[][] = [];

            for (const ll of level) {
                for (const l of ll) {
                    const layer = generateRandomLevel(rest, minChild, maxChild, l);

                    rest = layer.rest;
                    innerLevel.push(layer.items);
                }
            }

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

    return {
        root: levels[0][0],
        rest,
    };
};

const map = (treeList, cb, parent = null) => {
    return cb(treeList, parent).map((item) => {
        item.children = map(item.children, cb, item);

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
    const { root: nestingArrays } = generateRandomNesting(count, minChild, maxChild, null);
    const types = Array(colorsCount)
        .fill(null)
        .map(() => randomString(10));
    let counter = 0;
    let typesCounter = 0;
    let currentType = types[typesCounter];

    const mappedNestingArrays = map(nestingArrays, (items: Node[], parent: Node) => {
        const itemsCount = items.length;
        const innerStart = parent?.start ? parent.start : start;
        const innerEnd = parent?.duration ? innerStart + parent?.duration : end;

        const timestamps =
            itemsCount > 1
                ? Array(itemsCount - 1)
                      .fill(null)
                      .map(() => rndFloat(innerStart, innerEnd))
                      .concat(innerStart, innerEnd)
                      .sort((a, b) => a - b)
                : [innerStart, innerEnd];

        items.forEach((item, index) => {
            const currentWindow = timestamps[index + 1] - timestamps[index];

            if (counter > colorsMonotony) {
                counter = 0;
                currentType = types[typesCounter];
                typesCounter++;

                if (typesCounter >= types.length) {
                    typesCounter = 0;
                }
            }

            item.start = timestamps[index] + rndFloat(currentWindow, 0) * (rndFloat(thinning) / 100);
            const end = timestamps[index + 1] - rndFloat(currentWindow, 0) * (rndFloat(thinning) / 100);
            item.duration = end - item.start;
            item.name = randomString(14);
            item.type = currentType;
            // ??? fix ?item.parent = null;

            counter++;
        });

        return items;
    });

    console.log('Data:', mappedNestingArrays);

    return mappedNestingArrays;
};
