import { ClusterizedFlatTree, MetaClusterizedFlatTree, Data, FlatTree, FlatTreeNode, Node } from '../../types';
export declare const walk: (treeList: Data, cb: (child: Node, parent: any, level: number) => FlatTreeNode, parent?: FlatTreeNode | Node | null, level?: number) => void;
export declare const flatTree: (treeList: Data) => FlatTree;
export declare const getFlatTreeMinMax: (flatTree: FlatTree) => {
    min: number;
    max: number;
};
export declare function metaClusterizeFlatTree(flatTree: FlatTree, condition?: (prevNode: FlatTreeNode, node: FlatTreeNode) => boolean): MetaClusterizedFlatTree;
export declare const clusterizeFlatTree: (metaClusterizedFlatTree: MetaClusterizedFlatTree, zoom: number, start?: number, end?: number, stickDistance?: number, minBlockSize?: number) => ClusterizedFlatTree;
export declare const reclusterizeClusteredFlatTree: (clusteredFlatTree: ClusterizedFlatTree, zoom: number, start: number, end: number, stickDistance?: number | undefined, minBlockSize?: number | undefined) => ClusterizedFlatTree;
//# sourceMappingURL=tree-clusters.d.ts.map