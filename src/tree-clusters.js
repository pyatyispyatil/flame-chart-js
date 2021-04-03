const MIN_BLOCK_SIZE = 1;
const STICK_DISTANCE = 0.25;
const MIN_CLUSTER_SIZE = MIN_BLOCK_SIZE * 2 + STICK_DISTANCE;

const calcClusterDuration = (nodes) => {
    const firstNode = nodes[0];
    const lastNode = nodes[nodes.length - 1];

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
        .reduce((acc, node) => {
            const lastCluster = acc[acc.length - 1];
            const lastNode = lastCluster && lastCluster[lastCluster.length - 1];

            if (
                lastNode
                && lastNode.color === node.color
                && lastNode.type === node.type
                && lastNode.level === node.level
            ) {
                lastCluster.push(node);
            } else {
                acc.push([node]);
            }

            return acc;
        }, [])
        .filter((nodes) => nodes.length)
        .map((nodes) => ({
            nodes,
            parents: [...new Set(nodes.map(({ parent }) => parent))]
        }))
}

export const clusterizeFlatTree = (metaClusterizedFlatTree, zoom, start, end) => {
    let lastCluster = null;
    let lastNode = null;
    let index = 0;
    let clusters = [];

    return metaClusterizedFlatTree
        .reduce((acc, { nodes }) => {
            lastCluster = null;
            lastNode = null;
            index = 0;

            for (let node of nodes) {
                if (checkTimeboundNesting(node, start, end)) {
                    if (lastCluster && !lastNode) {
                        lastCluster[index] = node;
                        index++;
                    } else if (
                        lastNode
                        && (node.start - (lastNode.start + lastNode.duration)) * zoom < STICK_DISTANCE
                        && node.duration * zoom < MIN_BLOCK_SIZE
                        && lastNode.duration * zoom < MIN_BLOCK_SIZE
                    ) {
                        lastCluster[index] = node;
                        index++;
                    } else {
                        lastCluster = [node];
                        index = 1;

                        acc.push(lastCluster);
                    }
                    lastNode = node;
                }
            }

            return acc;
        }, clusters)
        .map((nodes) => {
            const node = nodes[0];
            const duration = calcClusterDuration(nodes);

            return {
                start: node.start,
                end: node.start + duration,
                duration,
                type: node.type,
                color: node.color,
                level: node.level,
                nodes
            };
        });
}

export const reclusterizeClusteredFlatTree = (clusteredFlatTree, zoom, start, end) => {
    return clusteredFlatTree
        .reduce((acc, cluster) => {
            if (checkTimeboundNesting(cluster, start, end)) {
                if (cluster.duration * zoom <= MIN_CLUSTER_SIZE) {
                    acc.push(cluster);
                } else {
                    acc.push(...clusterizeFlatTree([cluster], zoom, start, end));
                }
            }

            return acc;
        }, [])
}
