import Color from 'color';
import UIPlugin from './ui-plugin';
import { ClusterizedFlatTree, Colors, Data, FlatTree, MetaClusterizedFlatTree } from '../types';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
declare const DEFAULT_COLOR: Color<string | number | ArrayLike<number> | Color<string | number | ArrayLike<number> | Color<string | number | ArrayLike<number> | Color<string | number | ArrayLike<number> | Color<string | number | ArrayLike<number> | Color<string | number | ArrayLike<number> | Color<string | number | ArrayLike<number> | Color<string | number | ArrayLike<number> | Color<string | number | ArrayLike<number> | Color<string | number | ArrayLike<number> | Color<string | number | ArrayLike<number> | Color<string | number | ArrayLike<number> | any | {
    [key: string]: any;
}> | {
    [key: string]: any;
}> | {
    [key: string]: any;
}> | {
    [key: string]: any;
}> | {
    [key: string]: any;
}> | {
    [key: string]: any;
}> | {
    [key: string]: any;
}> | {
    [key: string]: any;
}> | {
    [key: string]: any;
}> | {
    [key: string]: any;
}> | {
    [key: string]: any;
}> | {
    [key: string]: any;
}>;
export default class FlameChartPlugin extends UIPlugin {
    name: string;
    height: number;
    data: Data;
    userColors: Colors;
    flatTree: FlatTree;
    positionY: number;
    colors: Colors;
    selectedRegion: any;
    lastRandomColor: typeof DEFAULT_COLOR;
    hoveredRegion: any;
    metaClusterizedFlatTree: MetaClusterizedFlatTree;
    actualClusterizedFlatTree: ClusterizedFlatTree;
    initialClusterizedFlatTree: ClusterizedFlatTree;
    lastUsedColor: string | null;
    renderChartTimeout: number;
    constructor({ data, colors }: {
        data: any;
        colors: any;
    });
    init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine): void;
    handlePositionChange({ deltaX, deltaY }: {
        deltaX: number;
        deltaY: number;
    }): void;
    handleMouseUp(): void;
    setPositionY(y: number): void;
    reset(): void;
    calcMinMax(): void;
    handleSelect(region: any): void;
    handleHover(region: any): void;
    findNodeInCluster(region: any): {
        data: any;
        type: string;
    } | null;
    getColor(type?: string, defaultColor?: string): string;
    setData(data: Data): void;
    parseData(): void;
    initData(): void;
    reclusterizeClusteredFlatTree(): void;
    calcRect(start: number, duration: number, level: number): {
        x: number;
        y: number;
        w: number;
    };
    renderTooltip(): boolean;
    render(): void;
}
export {};
//# sourceMappingURL=flame-chart-plugin.d.ts.map