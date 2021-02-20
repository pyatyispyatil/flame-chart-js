const randomString = (length, minLength = 4) => {
    const chars = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
    const rndLength = rnd(length, minLength);

    return Array(rndLength).fill(null).map(() => chars[rnd(chars.length)]).join('');
}

const rnd = (max, min = 0) => Math.floor(Math.random() * (max - min)) + min;

export const generateRandomTree = (levels, count, start, width) => {
    const rndCount = rnd(count);
    const childrenCount = rndCount ? rndCount : count ? 1 : 0;
    let counter = count - childrenCount;
    let prevStart = start;
    let prevWidth = 0;

    return new Array(childrenCount).fill(null)
        .map(() => {
            let children;

            const currentStart = (prevStart + prevWidth) + rnd(width - prevWidth - (prevStart - start));
            const currentWidth = rnd(width - (currentStart - start), 1);

            prevWidth = currentWidth;
            prevStart = currentStart;

            if (counter && levels) {
                children = generateRandomTree(levels - 1, counter, currentStart, currentWidth);
                counter -= children.length;
            }

            return {
                name: randomString(10),
                start: currentStart,
                duration: currentWidth,
                children
            }
        })
}