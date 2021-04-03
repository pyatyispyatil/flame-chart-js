export const walk = (treeList, cb, parent = null, level = 0) => {
    treeList.forEach((child) => {
        const res = cb(child, parent, level);

        if (child.children) {
            walk(child.children, cb, res || child, level + 1);
        }
    });
}

export const flatTree = (treeList) => {
    const result = [];
    let index = 0;

    walk(treeList, (node, parent, level) => {
        const newNode = {
            ...node,
            end: node.start + node.duration,
            parent,
            level,
            index: index++
        };

        result.push(newNode);

        return newNode;
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
