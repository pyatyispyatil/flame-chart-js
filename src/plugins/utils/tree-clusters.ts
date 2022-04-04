import type {
    ClusterizedFlatTree,
    MetaClusterizedFlatTree,
    ClusterizedFlatTreeNode,
    Data,
    FlatTree,
    FlatTreeNode,
    Node,
} from '../../types';

const MIN_BLOCK_SIZE = 1;
const STICK_DISTANCE = 0.25;
const MIN_CLUSTER_SIZE = MIN_BLOCK_SIZE * 2 + STICK_DISTANCE;

export const walk = (
    treeList: Data,
    cb: (child: Node, parent: any, level: number) => FlatTreeNode,
    parent = null,
    level = 0
) => {
    treeList.forEach((child) => {
        const res = cb(child, parent, level);

        if (child.children) {
            walk(child.children, cb, res || child, level + 1);
        }
    });
};

export const flatTree = (treeList: Data): FlatTree => {
    const result: FlatTree = [];
    let index = 0;

    walk(treeList, (node, parent, level) => {
        const newNode: FlatTreeNode = {
            ...node,
            end: node.start + node.duration,
            parent,
            level,
            index: index++,
        };

        result.push(newNode);

        return newNode;
    });

    return result.sort((a, b) => a.level - b.level || a.start - b.start);
};

export const getFlatTreeMinMax = (flatTree: FlatTree) => {
    let isFirst = true;
    let min = 0;
    let max = 0;

    flatTree.forEach(({ start, end }) => {
        if (isFirst) {
            min = start;
            max = end;
            isFirst = false;
        } else {
            min = min < start ? min : start;
            max = max > end ? max : end;
        }
    });

    return { min, max };
};

const calcClusterDuration = (nodes: FlatTreeNode[]) => {
    const firstNode = nodes[0];
    const lastNode = nodes[nodes.length - 1];

    return lastNode.start + lastNode.duration - firstNode.start;
};

const checkTimeboundNesting = (node: FlatTreeNode | ClusterizedFlatTreeNode, start: number, end: number) =>
    (node.start < end && node.end > start) || (node.start > start && node.end < end);

const defaultClusterizeCondition = (prevNode: FlatTreeNode, node: FlatTreeNode) =>
    prevNode.color === node.color && prevNode.type === node.type;

export function metaClusterizeFlatTree(
    flatTree: FlatTree,
    condition = defaultClusterizeCondition
): MetaClusterizedFlatTree {
    return flatTree
        .reduce<FlatTreeNode[][]>((acc, node) => {
            const lastCluster = acc[acc.length - 1];
            const lastNode = lastCluster && lastCluster[lastCluster.length - 1];

            if (lastNode && lastNode.level === node.level && condition(lastNode, node)) {
                lastCluster.push(node);
            } else {
                acc.push([node]);
            }

            return acc;
        }, [])
        .filter((nodes) => nodes.length)
        .map((nodes) => ({
            nodes,
        }));
}

export const clusterizeFlatTree = (
    metaClusterizedFlatTree: MetaClusterizedFlatTree,
    zoom: number,
    start: number,
    end: number,
    stickDistance = STICK_DISTANCE,
    minBlockSize = MIN_BLOCK_SIZE
): ClusterizedFlatTree => {
    let lastCluster = null;
    let lastNode = null;
    let index = 0;

    return metaClusterizedFlatTree
        .reduce<FlatTreeNode[][]>((acc, { nodes }) => {
            lastCluster = null;
            lastNode = null;
            index = 0;

            for (const node of nodes) {
                if (checkTimeboundNesting(node, start, end)) {
                    if (lastCluster && !lastNode) {
                        lastCluster[index] = node;
                        index++;
                    } else if (
                        lastNode &&
                        (node.start - (lastNode.start + lastNode.duration)) * zoom < stickDistance &&
                        node.duration * zoom < minBlockSize &&
                        lastNode.duration * zoom < minBlockSize
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
        }, [])
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
                nodes,
            };
        });
};

export const reclusterizeClusteredFlatTree = (
    clusteredFlatTree: ClusterizedFlatTree,
    zoom: number,
    start: number,
    end: number,
    stickDistance?: number,
    minBlockSize?: number
): ClusterizedFlatTree => {
    return clusteredFlatTree.reduce<ClusterizedFlatTree>((acc, cluster) => {
        if (checkTimeboundNesting(cluster, start, end)) {
            if (cluster.duration * zoom <= MIN_CLUSTER_SIZE) {
                acc.push(cluster);
            } else {
                acc.push(...clusterizeFlatTree([cluster], zoom, start, end, stickDistance, minBlockSize));
            }
        }

        return acc;
    }, []);
};
