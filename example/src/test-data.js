const randomString = (length, minLength = 4) => {
    const chars = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
    const rndLength = rnd(length, minLength);

    return Array(rndLength).fill(null).map(() => chars[rnd(chars.length - 1)]).join('');
}

const rnd = (max, min = 0) => Math.round(Math.random() * (max - min)) + min;
const rndFloat = (max, min = 0) => Math.random() * (max - min) + min;

const generateRandomLevel = (count, parent, minChild = 1, maxChild = 10) => {
    const childrenCount = count ? rnd(Math.min(count, maxChild), Math.min(count, minChild)) : 0;
    const items = Array(childrenCount).fill(null).map(() => ({ children: [], parent }));
    let rest = count - childrenCount;

    if (parent) {
        parent.children = items;
    }

    return {
        rest,
        items
    };
}

const generateRandomNesting = (count, minChild, maxChild, parent) => {
    const levels = []
    let currentLevel = 0;
    let rest = count;

    while (rest > 0) {
        if (!levels.length) {
            const layer = generateRandomLevel(rest, parent, minChild, maxChild);

            levels.push([layer.items]);
            rest = layer.rest;
        } else {
            const level = levels[levels.length - 1];
            const innerLevel = [];

            for (let i = 0; i < level.length; i++) {
                for (let j = 0; j < level[i].length; j++) {
                    const layer = generateRandomLevel(rest, level[i][j], minChild, maxChild);

                    rest = layer.rest;
                    innerLevel.push(layer.items);
                }
            }

            if (!innerLevel.length) {
                return {
                    root: [],
                    rest
                };
            }

            levels.push(innerLevel);
        }

        currentLevel++;
    }

    console.log('Total count:', levels.reduce((acc, level) => level.reduce((acc, subLevel) => acc + subLevel.length, acc), 0));

    return {
        root: levels[0][0],
        rest
    };
}

const map = (treeList, cb, parent = null) => {
    return cb(treeList, parent).map(({ children, ...item }) => ({
        ...item,
        children: map(children, cb, item)
    }));
};

export const generateRandomTree = ({ count, start, end, minChild, maxChild }) => {
    const { root: nestingArrays } = generateRandomNesting(count, minChild, maxChild, null);

    const mappedNestingArrays = map(nestingArrays, (items, parent) => {
        const neighborsCount = items.length;
        const innerStart = parent && parent.start ? parent.start : start;
        const innerEnd = parent && parent.end ? parent.end : end;

        const timestamps = Array(neighborsCount * 2)
            .fill(null)
            .map(() => rndFloat(innerStart, innerEnd))
            .sort((a, b) => a - b);

        items.forEach((item, index) => {
            item.start = timestamps[index * 2];
            item.duration = timestamps[index * 2 + 1] - timestamps[index * 2];
            item.end = timestamps[index * 2 + 1];
            item.name = randomString(14);
            item.parent = null;
        });

        return items;
    });

    console.log('Data:', mappedNestingArrays);

    return mappedNestingArrays
}
