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

const calcClusterDuration = (nodes) => {
    const firstNode = nodes[0].node;
    const lastNode = nodes[nodes.length - 1].node;

    return lastNode.start + lastNode.duration - firstNode.start;
}

const checkTimeboundNesting = (node, start, end) => (
    (
        node.start < end && node.end > start
    ) || (
        node.start > start && node.end < end
    )
)

export const metaClusterizeFlatTree = (flatTree) => {
    return flatTree
        .reduce((acc, item) => {
            const lastCluster = acc[acc.length - 1];
            const lastItem = lastCluster && lastCluster[lastCluster.length - 1];

            if (
                lastItem
                && lastItem.node.color === item.node.color
                && lastItem.node.type === item.node.type
                && lastItem.level === item.level
            ) {
                lastCluster.push(item);
            } else {
                acc.push([item]);
            }

            return acc;
        }, [])
        .filter((nodes) => nodes.length)
        .map((nodes) => ({
            nodes
        }))
}

export const clusterizeFlatTree = (metaClusterizedFlatTree, zoom, start, end) => {
    let lastCluster = null;
    let lastItem = null;
    let index = 0;
    let clusters = [];

    return metaClusterizedFlatTree
        .reduce((acc, { nodes }) => {
            lastCluster = null;
            lastItem = null;
            index = 0;

            for (let item of nodes) {
                if (checkTimeboundNesting(item.node, start, end)) {
                    if (lastCluster && !lastItem) {
                        lastCluster[index] = item;
                        index++;
                    } else if (
                        lastItem
                        && (item.node.start - (lastItem.node.start + lastItem.node.duration)) * zoom < 0.5
                        && item.node.duration * zoom < 2
                        && lastItem.node.duration * zoom < 2
                    ) {
                        lastCluster[index] = item;
                        index++;
                    } else {
                        lastCluster = [item];
                        index = 1;

                        acc.push(lastCluster);
                    }
                    lastItem = item;
                }
            }

            return acc;
        }, clusters)
        .map((nodes) => {
            const { node, level } = nodes[0];
            const duration = calcClusterDuration(nodes);

            return {
                start: node.start,
                end: node.start + duration,
                duration,
                type: node.type,
                color: node.color,
                level,
                nodes
            };
        });
}

export const reclusterizeClusteredFlatTree = (clusteredFlatTree, zoom, start, end) => {
    return clusteredFlatTree
        .reduce((acc, item) => {
            if (checkTimeboundNesting(item, start, end)) {
                if (item.duration * zoom <= 4) {
                    acc.push(item);
                } else {
                    acc.push(...clusterizeFlatTree([item], zoom, start, end));
                }
            }

            return acc;
        }, [])
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
