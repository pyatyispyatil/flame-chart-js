import { describe, it, expect } from '@jest/globals';
import { clusterizeFlatTree, flatTree, metaClusterizeFlatTree, reclusterizeClusteredFlatTree } from './tree-clusters';
import { FlameChartNodes } from '../../types';

const data: FlameChartNodes = [
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
// import { clusterizeFlatTree, flatTree, metaClusterizeFlatTree, reclusterizeClusteredFlatTree } from './tree-clusters';

// const data = [
//     {
//         start: 0.16474517919551923,
//         end: 4.495510815746062,
//         duration: 4.330765636550543,
//         name: 'EwzdOgt',
//         type: 'wnTOxfON',
//         children: [
//             {
//                 start: 0.20057822535714454,
//                 end: 4.4430247477528395,
//                 duration: 4.242446522395695,
//                 name: 'XkhQPhWCTuDqx',
//                 type: 'wnTOxfON',
//                 children: [],
//             },
//         ],
//     },
//     {
//         start: 4.508069066201776,
//         end: 9.859908953776461,
//         duration: 5.351839887574685,
//         name: 'ThHEri',
//         type: 'wnTOxfON',
//         children: [
//             {
//                 start: 4.508507047607622,
//                 end: 4.5510423177725645,
//                 duration: 0.04253527016494285,
//                 name: 'vxNOUnENFDQE',
//                 type: 'wnTOxfON',
//                 children: [],
//             },
//             {
//                 start: 4.588760367894359,
//                 end: 9.848699863262404,
//                 duration: 5.2599394953680445,
//                 name: 'gGUATPcziMM',
//                 type: 'wnTOxfON',
//                 children: [],
//             },
//         ],
//     },
// ];
// const flatTreeData = [
//     {
//         start: 0.16474517919551923,
//         end: 4.495510815746062,
//         duration: 4.330765636550543,
//         name: 'EwzdOgt',
//         type: 'wnTOxfON',
//         parent: null,
//         children: [
//             {
//                 start: 0.20057822535714454,
//                 end: 4.4430247477528395,
//                 duration: 4.242446522395695,
//                 name: 'XkhQPhWCTuDqx',
//                 type: 'wnTOxfON',
//                 children: [],
//             },
//         ],
//         level: 0,
//         index: 0,
//     },
//     {
//         parent: null,
//         start: 4.508069066201776,
//         end: 9.859908953776461,
//         duration: 5.351839887574685,
//         name: 'ThHEri',
//         type: 'wnTOxfON',
//         children: [
//             {
//                 start: 4.508507047607622,
//                 end: 4.5510423177725645,
//                 duration: 0.04253527016494285,
//                 name: 'vxNOUnENFDQE',
//                 type: 'wnTOxfON',
//                 children: [],
//             },
//             {
//                 start: 4.588760367894359,
//                 end: 9.848699863262404,
//                 duration: 5.2599394953680445,
//                 name: 'gGUATPcziMM',
//                 type: 'wnTOxfON',
//                 children: [],
//             },
//         ],
//         level: 0,
//         index: 2,
//     },
//     {
//         parent: {
//             parent: null,
//             start: 0.16474517919551923,
//             end: 4.495510815746062,
//             duration: 4.330765636550543,
//             name: 'EwzdOgt',
//             type: 'wnTOxfON',
//             children: [
//                 {
//                     start: 0.20057822535714454,
//                     end: 4.4430247477528395,
//                     duration: 4.242446522395695,
//                     name: 'XkhQPhWCTuDqx',
//                     type: 'wnTOxfON',
//                     children: [],
//                 },
//             ],
//             level: 0,
//             index: 0,
//         },
//         start: 0.20057822535714454,
//         end: 4.4430247477528395,
//         duration: 4.242446522395695,
//         name: 'XkhQPhWCTuDqx',
//         type: 'wnTOxfON',
//         children: [],
//         level: 1,
//         index: 1,
//     },
//     {
//         parent: {
//             parent: null,
//             start: 4.508069066201776,
//             end: 9.859908953776461,
//             duration: 5.351839887574685,
//             name: 'ThHEri',
//             type: 'wnTOxfON',
//             children: [
//                 {
//                     start: 4.508507047607622,
//                     end: 4.5510423177725645,
//                     duration: 0.04253527016494285,
//                     name: 'vxNOUnENFDQE',
//                     type: 'wnTOxfON',
//                     children: [],
//                 },
//                 {
//                     start: 4.588760367894359,
//                     end: 9.848699863262404,
//                     duration: 5.2599394953680445,
//                     name: 'gGUATPcziMM',
//                     type: 'wnTOxfON',
//                     children: [],
//                 },
//             ],
//             level: 0,
//             index: 2,
//         },
//         start: 4.508507047607622,
//         end: 4.5510423177725645,
//         duration: 0.04253527016494285,
//         name: 'vxNOUnENFDQE',
//         type: 'wnTOxfON',
//         children: [],
//         level: 1,
//         index: 3,
//     },
//     {
//         parent: {
//             parent: null,
//             start: 4.508069066201776,
//             end: 9.859908953776461,
//             duration: 5.351839887574685,
//             name: 'ThHEri',
//             type: 'wnTOxfON',
//             children: [
//                 {
//                     start: 4.508507047607622,
//                     end: 4.5510423177725645,
//                     duration: 0.04253527016494285,
//                     name: 'vxNOUnENFDQE',
//                     type: 'wnTOxfON',
//                     children: [],
//                 },
//                 {
//                     start: 4.588760367894359,
//                     end: 9.848699863262404,
//                     duration: 5.2599394953680445,
//                     name: 'gGUATPcziMM',
//                     type: 'wnTOxfON',
//                     children: [],
//                 },
//             ],
//             level: 0,
//             index: 2,
//         },
//         start: 4.588760367894359,
//         end: 9.848699863262404,
//         duration: 5.2599394953680445,
//         name: 'gGUATPcziMM',
//         type: 'wnTOxfON',
//         children: [],
//         level: 1,
//         index: 4,
//     },
// ];
// const metaClusterizedFlatTree = [
//     {
//         nodes: [
//             {
//                 parent: null,
//                 start: 0.16474517919551923,
//                 end: 4.495510815746062,
//                 duration: 4.330765636550543,
//                 name: 'EwzdOgt',
//                 type: 'wnTOxfON',
//                 children: [
//                     {
//                         start: 0.20057822535714454,
//                         end: 4.4430247477528395,
//                         duration: 4.242446522395695,
//                         name: 'XkhQPhWCTuDqx',
//                         type: 'wnTOxfON',
//                         children: [],
//                     },
//                 ],
//                 level: 0,
//                 index: 0,
//             },
//             {
//                 parent: null,
//                 start: 4.508069066201776,
//                 end: 9.859908953776461,
//                 duration: 5.351839887574685,
//                 name: 'ThHEri',
//                 type: 'wnTOxfON',
//                 children: [
//                     {
//                         start: 4.508507047607622,
//                         end: 4.5510423177725645,
//                         duration: 0.04253527016494285,
//                         name: 'vxNOUnENFDQE',
//                         type: 'wnTOxfON',
//                         children: [],
//                     },
//                     {
//                         start: 4.588760367894359,
//                         end: 9.848699863262404,
//                         duration: 5.2599394953680445,
//                         name: 'gGUATPcziMM',
//                         type: 'wnTOxfON',
//                         children: [],
//                     },
//                 ],
//                 level: 0,
//                 index: 2,
//             },
//         ],
//     },
//     {
//         nodes: [
//             {
//                 parent: {
//                     parent: null,
//                     start: 0.16474517919551923,
//                     end: 4.495510815746062,
//                     duration: 4.330765636550543,
//                     name: 'EwzdOgt',
//                     type: 'wnTOxfON',
//                     children: [
//                         {
//                             start: 0.20057822535714454,
//                             end: 4.4430247477528395,
//                             duration: 4.242446522395695,
//                             name: 'XkhQPhWCTuDqx',
//                             type: 'wnTOxfON',
//                             children: [],
//                         },
//                     ],
//                     level: 0,
//                     index: 0,
//                 },
//                 start: 0.20057822535714454,
//                 end: 4.4430247477528395,
//                 duration: 4.242446522395695,
//                 name: 'XkhQPhWCTuDqx',
//                 type: 'wnTOxfON',
//                 children: [],
//                 level: 1,
//                 index: 1,
//             },
//             {
//                 parent: {
//                     parent: null,
//                     start: 4.508069066201776,
//                     end: 9.859908953776461,
//                     duration: 5.351839887574685,
//                     name: 'ThHEri',
//                     type: 'wnTOxfON',
//                     children: [
//                         {
//                             start: 4.508507047607622,
//                             end: 4.5510423177725645,
//                             duration: 0.04253527016494285,
//                             name: 'vxNOUnENFDQE',
//                             type: 'wnTOxfON',
//                             children: [],
//                         },
//                         {
//                             start: 4.588760367894359,
//                             end: 9.848699863262404,
//                             duration: 5.2599394953680445,
//                             name: 'gGUATPcziMM',
//                             type: 'wnTOxfON',
//                             children: [],
//                         },
//                     ],
//                     level: 0,
//                     index: 2,
//                 },
//                 start: 4.508507047607622,
//                 end: 4.5510423177725645,
//                 duration: 0.04253527016494285,
//                 name: 'vxNOUnENFDQE',
//                 type: 'wnTOxfON',
//                 children: [],
//                 level: 1,
//                 index: 3,
//             },
//             {
//                 parent: {
//                     parent: null,
//                     start: 4.508069066201776,
//                     end: 9.859908953776461,
//                     duration: 5.351839887574685,
//                     name: 'ThHEri',
//                     type: 'wnTOxfON',
//                     children: [
//                         {
//                             start: 4.508507047607622,
//                             end: 4.5510423177725645,
//                             duration: 0.04253527016494285,
//                             name: 'vxNOUnENFDQE',
//                             type: 'wnTOxfON',
//                             children: [],
//                         },
//                         {
//                             start: 4.588760367894359,
//                             end: 9.848699863262404,
//                             duration: 5.2599394953680445,
//                             name: 'gGUATPcziMM',
//                             type: 'wnTOxfON',
//                             children: [],
//                         },
//                     ],
//                     level: 0,
//                     index: 2,
//                 },
//                 start: 4.588760367894359,
//                 end: 9.848699863262404,
//                 duration: 5.2599394953680445,
//                 name: 'gGUATPcziMM',
//                 type: 'wnTOxfON',
//                 children: [],
//                 level: 1,
//                 index: 4,
//             },
//         ],
//     },
// ];
// const clusterizedFlatTree = [
//     {
//         color: void 0,
//         start: 0.16474517919551923,
//         end: 4.495510815746062,
//         duration: 4.330765636550543,
//         type: 'wnTOxfON',
//         level: 0,
//         nodes: [
//             {
//                 parent: null,
//                 start: 0.16474517919551923,
//                 end: 4.495510815746062,
//                 duration: 4.330765636550543,
//                 name: 'EwzdOgt',
//                 type: 'wnTOxfON',
//                 children: [
//                     {
//                         start: 0.20057822535714454,
//                         end: 4.4430247477528395,
//                         duration: 4.242446522395695,
//                         name: 'XkhQPhWCTuDqx',
//                         type: 'wnTOxfON',
//                         children: [],
//                     },
//                 ],
//                 level: 0,
//                 index: 0,
//             },
//         ],
//     },
//     {
//         color: void 0,
//         start: 4.508069066201776,
//         end: 9.859908953776461,
//         duration: 5.351839887574685,
//         type: 'wnTOxfON',
//         level: 0,
//         nodes: [
//             {
//                 parent: null,
//                 start: 4.508069066201776,
//                 end: 9.859908953776461,
//                 duration: 5.351839887574685,
//                 name: 'ThHEri',
//                 type: 'wnTOxfON',
//                 children: [
//                     {
//                         start: 4.508507047607622,
//                         end: 4.5510423177725645,
//                         duration: 0.04253527016494285,
//                         name: 'vxNOUnENFDQE',
//                         type: 'wnTOxfON',
//                         children: [],
//                     },
//                     {
//                         start: 4.588760367894359,
//                         end: 9.848699863262404,
//                         duration: 5.2599394953680445,
//                         name: 'gGUATPcziMM',
//                         type: 'wnTOxfON',
//                         children: [],
//                     },
//                 ],
//                 level: 0,
//                 index: 2,
//             },
//         ],
//     },
//     {
//         color: void 0,
//         start: 0.20057822535714454,
//         end: 4.4430247477528395,
//         duration: 4.242446522395695,
//         type: 'wnTOxfON',
//         level: 1,
//         nodes: [
//             {
//                 parent: {
//                     parent: null,
//                     start: 0.16474517919551923,
//                     end: 4.495510815746062,
//                     duration: 4.330765636550543,
//                     name: 'EwzdOgt',
//                     type: 'wnTOxfON',
//                     children: [
//                         {
//                             start: 0.20057822535714454,
//                             end: 4.4430247477528395,
//                             duration: 4.242446522395695,
//                             name: 'XkhQPhWCTuDqx',
//                             type: 'wnTOxfON',
//                             children: [],
//                         },
//                     ],
//                     level: 0,
//                     index: 0,
//                 },
//                 start: 0.20057822535714454,
//                 end: 4.4430247477528395,
//                 duration: 4.242446522395695,
//                 name: 'XkhQPhWCTuDqx',
//                 type: 'wnTOxfON',
//                 children: [],
//                 level: 1,
//                 index: 1,
//             },
//         ],
//     },
//     {
//         color: void 0,
//         start: 4.508507047607622,
//         end: 4.5510423177725645,
//         duration: 0.04253527016494285,
//         type: 'wnTOxfON',
//         level: 1,
//         nodes: [
//             {
//                 parent: {
//                     parent: null,
//                     start: 4.508069066201776,
//                     end: 9.859908953776461,
//                     duration: 5.351839887574685,
//                     name: 'ThHEri',
//                     type: 'wnTOxfON',
//                     children: [
//                         {
//                             start: 4.508507047607622,
//                             end: 4.5510423177725645,
//                             duration: 0.04253527016494285,
//                             name: 'vxNOUnENFDQE',
//                             type: 'wnTOxfON',
//                             children: [],
//                         },
//                         {
//                             start: 4.588760367894359,
//                             end: 9.848699863262404,
//                             duration: 5.2599394953680445,
//                             name: 'gGUATPcziMM',
//                             type: 'wnTOxfON',
//                             children: [],
//                         },
//                     ],
//                     level: 0,
//                     index: 2,
//                 },
//                 start: 4.508507047607622,
//                 end: 4.5510423177725645,
//                 duration: 0.04253527016494285,
//                 name: 'vxNOUnENFDQE',
//                 type: 'wnTOxfON',
//                 children: [],
//                 level: 1,
//                 index: 3,
//             },
//         ],
//     },
//     {
//         color: void 0,
//         start: 4.588760367894359,
//         end: 9.848699863262404,
//         duration: 5.2599394953680445,
//         type: 'wnTOxfON',
//         level: 1,
//         nodes: [
//             {
//                 parent: {
//                     parent: null,
//                     start: 4.508069066201776,
//                     end: 9.859908953776461,
//                     duration: 5.351839887574685,
//                     name: 'ThHEri',
//                     type: 'wnTOxfON',
//                     children: [
//                         {
//                             start: 4.508507047607622,
//                             end: 4.5510423177725645,
//                             duration: 0.04253527016494285,
//                             name: 'vxNOUnENFDQE',
//                             type: 'wnTOxfON',
//                             children: [],
//                         },
//                         {
//                             start: 4.588760367894359,
//                             end: 9.848699863262404,
//                             duration: 5.2599394953680445,
//                             name: 'gGUATPcziMM',
//                             type: 'wnTOxfON',
//                             children: [],
//                         },
//                     ],
//                     level: 0,
//                     index: 2,
//                 },
//                 start: 4.588760367894359,
//                 end: 9.848699863262404,
//                 duration: 5.2599394953680445,
//                 name: 'gGUATPcziMM',
//                 type: 'wnTOxfON',
//                 children: [],
//                 level: 1,
//                 index: 4,
//             },
//         ],
//     },
// ];
// const reclusterizedClusteredFlatTree = [
//     {
//         color: void 0,
//         start: 0.16474517919551923,
//         end: 4.495510815746062,
//         duration: 4.330765636550543,
//         type: 'wnTOxfON',
//         level: 0,
//         nodes: [
//             {
//                 parent: null,
//                 start: 0.16474517919551923,
//                 end: 4.495510815746062,
//                 duration: 4.330765636550543,
//                 name: 'EwzdOgt',
//                 type: 'wnTOxfON',
//                 children: [
//                     {
//                         start: 0.20057822535714454,
//                         end: 4.4430247477528395,
//                         duration: 4.242446522395695,
//                         name: 'XkhQPhWCTuDqx',
//                         type: 'wnTOxfON',
//                         children: [],
//                     },
//                 ],
//                 level: 0,
//                 index: 0,
//             },
//         ],
//     },
//     {
//         color: void 0,
//         start: 4.508069066201776,
//         end: 9.859908953776461,
//         duration: 5.351839887574685,
//         type: 'wnTOxfON',
//         level: 0,
//         nodes: [
//             {
//                 parent: null,
//                 start: 4.508069066201776,
//                 end: 9.859908953776461,
//                 duration: 5.351839887574685,
//                 name: 'ThHEri',
//                 type: 'wnTOxfON',
//                 children: [
//                     {
//                         start: 4.508507047607622,
//                         end: 4.5510423177725645,
//                         duration: 0.04253527016494285,
//                         name: 'vxNOUnENFDQE',
//                         type: 'wnTOxfON',
//                         children: [],
//                     },
//                     {
//                         start: 4.588760367894359,
//                         end: 9.848699863262404,
//                         duration: 5.2599394953680445,
//                         name: 'gGUATPcziMM',
//                         type: 'wnTOxfON',
//                         children: [],
//                     },
//                 ],
//                 level: 0,
//                 index: 2,
//             },
//         ],
//     },
//     {
//         color: void 0,
//         start: 0.20057822535714454,
//         end: 4.4430247477528395,
//         duration: 4.242446522395695,
//         type: 'wnTOxfON',
//         level: 1,
//         nodes: [
//             {
//                 parent: {
//                     parent: null,
//                     start: 0.16474517919551923,
//                     end: 4.495510815746062,
//                     duration: 4.330765636550543,
//                     name: 'EwzdOgt',
//                     type: 'wnTOxfON',
//                     children: [
//                         {
//                             start: 0.20057822535714454,
//                             end: 4.4430247477528395,
//                             duration: 4.242446522395695,
//                             name: 'XkhQPhWCTuDqx',
//                             type: 'wnTOxfON',
//                             children: [],
//                         },
//                     ],
//                     level: 0,
//                     index: 0,
//                 },
//                 start: 0.20057822535714454,
//                 end: 4.4430247477528395,
//                 duration: 4.242446522395695,
//                 name: 'XkhQPhWCTuDqx',
//                 type: 'wnTOxfON',
//                 children: [],
//                 level: 1,
//                 index: 1,
//             },
//         ],
//     },
//     {
//         color: void 0,
//         start: 4.508507047607622,
//         end: 4.5510423177725645,
//         duration: 0.04253527016494285,
//         type: 'wnTOxfON',
//         level: 1,
//         nodes: [
//             {
//                 parent: {
//                     parent: null,
//                     start: 4.508069066201776,
//                     end: 9.859908953776461,
//                     duration: 5.351839887574685,
//                     name: 'ThHEri',
//                     type: 'wnTOxfON',
//                     children: [
//                         {
//                             start: 4.508507047607622,
//                             end: 4.5510423177725645,
//                             duration: 0.04253527016494285,
//                             name: 'vxNOUnENFDQE',
//                             type: 'wnTOxfON',
//                             children: [],
//                         },
//                         {
//                             start: 4.588760367894359,
//                             end: 9.848699863262404,
//                             duration: 5.2599394953680445,
//                             name: 'gGUATPcziMM',
//                             type: 'wnTOxfON',
//                             children: [],
//                         },
//                     ],
//                     level: 0,
//                     index: 2,
//                 },
//                 start: 4.508507047607622,
//                 end: 4.5510423177725645,
//                 duration: 0.04253527016494285,
//                 name: 'vxNOUnENFDQE',
//                 type: 'wnTOxfON',
//                 children: [],
//                 level: 1,
//                 index: 3,
//             },
//         ],
//     },
//     {
//         color: void 0,
//         start: 4.588760367894359,
//         end: 9.848699863262404,
//         duration: 5.2599394953680445,
//         type: 'wnTOxfON',
//         level: 1,
//         nodes: [
//             {
//                 parent: {
//                     parent: null,
//                     start: 4.508069066201776,
//                     end: 9.859908953776461,
//                     duration: 5.351839887574685,
//                     name: 'ThHEri',
//                     type: 'wnTOxfON',
//                     children: [
//                         {
//                             start: 4.508507047607622,
//                             end: 4.5510423177725645,
//                             duration: 0.04253527016494285,
//                             name: 'vxNOUnENFDQE',
//                             type: 'wnTOxfON',
//                             children: [],
//                         },
//                         {
//                             start: 4.588760367894359,
//                             end: 9.848699863262404,
//                             duration: 5.2599394953680445,
//                             name: 'gGUATPcziMM',
//                             type: 'wnTOxfON',
//                             children: [],
//                         },
//                     ],
//                     level: 0,
//                     index: 2,
//                 },
//                 start: 4.588760367894359,
//                 end: 9.848699863262404,
//                 duration: 5.2599394953680445,
//                 name: 'gGUATPcziMM',
//                 type: 'wnTOxfON',
//                 children: [],
//                 level: 1,
//                 index: 4,
//             },
//         ],
//     },
// ];

// describe('tree clusters', () => {
//     it('flatTree', () => {
//         expect(flatTree(data)).toStrictEqual(flatTreeData);
//     });
//     it('metaClusterizeFlatTree', () => {
//         expect(metaClusterizeFlatTree(flatTreeData)).toStrictEqual(metaClusterizedFlatTree);
//     });
//     it('clusterizeFlatTree', () => {
//         const result = clusterizeFlatTree(metaClusterizedFlatTree, 1, 0, 500);
//         expect(result).toStrictEqual(clusterizedFlatTree);
//     });
//     it('reclusterizeClusteredFlatTree', () => {
//         const result = reclusterizeClusteredFlatTree(clusterizedFlatTree, 1, 0, 500);
//         expect(result).toStrictEqual(reclusterizedClusteredFlatTree);
//         expect(clusterizedFlatTree).toStrictEqual(reclusterizedClusteredFlatTree);
//     });
// });
