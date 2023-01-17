import { describe, it, expect } from '@jest/globals';
import { clusterizeFlatTree, flatTree, metaClusterizeFlatTree, reclusterizeClusteredFlatTree } from './tree-clusters';
import { Data } from '../../types';

const data: Data = [
    {
        children: [
            {
                children: [
                    {
                        children: [],
                        start: 536.1650838600234,
                        duration: 2.461531364710936,
                        name: 'MhxhARxSxzsGT',
                        type: 'dUGYl',
                    },
                    {
                        children: [],
                        start: 538.6556924085829,
                        duration: 0.0689690274144823,
                        name: 'GTUYcE',
                        type: 'dUGYl',
                    },
                    {
                        children: [],
                        start: 538.7280951432377,
                        duration: 2.9309201647754435,
                        name: 'KTdZsYg',
                        type: 'dUGYl',
                    },
                ],
                start: 536.1510397400183,
                duration: 55.127917361818845,
                name: 'ZhzOuVaDQIp',
                type: 'dUGYl',
            },
            {
                children: [],
                start: 594.290771087428,
                duration: 371.3241221156734,
                name: 'QtboRAlO',
                type: 'dUGYl',
            },
        ],
        start: 535.327387346647,
        duration: 4318.8956400700545,
        name: 'uctgLKhJRHx',
        type: 'dUGYl',
    },
];

describe('tree clusters', () => {
    it('flatTree', () => {
        const result = flatTree(data);

        expect(result).toMatchSnapshot();
    });

    it('metaClusterizeFlatTree', () => {
        const result = metaClusterizeFlatTree(flatTree(data));

        expect(result).toMatchSnapshot();
    });

    it('clusterizeFlatTree', () => {
        const metaClusterizedFlatTree = metaClusterizeFlatTree(flatTree(data));
        const result = clusterizeFlatTree(metaClusterizedFlatTree, 0.26955555555555555, 500, 5000);

        expect(result).toMatchSnapshot();
    });

    it('reclusterizeClusteredFlatTree', () => {
        const metaClusterizedFlatTree = metaClusterizeFlatTree(flatTree(data));
        const clusterizedFlatTree = clusterizeFlatTree(metaClusterizedFlatTree, 0.26955555555555555, 500, 5000);
        const result = reclusterizeClusteredFlatTree(clusterizedFlatTree, 0.26955555555555555, 500, 5000);

        expect(result).toMatchSnapshot();
    });
});
