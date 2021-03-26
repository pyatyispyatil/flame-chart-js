export const walk = (treeList, cb, level = 0) => {
    treeList.forEach((child) => {
        cb(child, level);

        if (child.children) {
            walk(child.children, cb, level + 1);
        }
    });
}

export const flatTree = (treeList) => {
    const result = [];
    let index = 0;

    walk(treeList, (node, level) => {
        result.push({
            node: {
                ...node,
                end: node.start + node.duration
            },
            level,
            index: index++
        });
    });

    return result;
}

export const debounce = (cb, delay) => {
    let timeout;

    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => cb(...args), delay);
    }
}

export const getPixelRatio = (ctx) => {
    const dpr = window.devicePixelRatio || 1;
    const bsr = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
}
