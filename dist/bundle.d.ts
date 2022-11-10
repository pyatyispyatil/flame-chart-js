import { EventEmitter, Listener } from 'events';
import Color from 'color';

interface Mark {
    shortName: string;
    fullName: string;
    timestamp: number;
    color: string;
}
declare type Marks = Array<Mark>;
interface Node {
    name: string;
    start: number;
    duration: number;
    type?: string;
    color?: string;
    children?: Array<Node>;
    specialType?: string;
    isThirdParty?: boolean;
    isHighlighted?: boolean;
    isInactive?: boolean;
    matched?: boolean;
}
declare type Data = Array<Node>;
declare type WaterfallItems = Array<{
    name: string;
    intervals: WaterfallInterval[] | string;
    timing: {
        [key: string]: number;
    };
}>;
declare type WaterfallInterval = {
    name: string;
    color: string;
    type: 'block' | 'line';
    start: string;
    end: string;
};
interface WaterfallIntervals {
    [intervalName: string]: WaterfallInterval[];
}
interface Waterfall {
    items: WaterfallItems;
    intervals: WaterfallIntervals;
}
declare type Colors = Record<string, string>;
interface Mouse {
    x: number;
    y: number;
    isInsideFg?: boolean;
}
interface Dot {
    x: number;
    y: number;
}
declare type Dots = [Dot, Dot, Dot];
interface Rect {
    x: number;
    y: number;
    w: number;
    flags: number;
}
interface RectRenderQueue {
    [color: string]: Rect[];
}
interface Text {
    text: string;
    x: number;
    y: number;
    w: number;
    textMaxWidth: number;
    color?: string;
    flags: number;
}
interface Stroke {
    color: string;
    x: number;
    y: number;
    w: number;
    h: number;
}
declare type FlatTreeNode = {
    source: Node;
    end: number;
    parent: FlatTreeNode | null;
    level: number;
    index: number;
};
declare type FlatTree = FlatTreeNode[];
interface MetaClusterizedFlatTreeNode {
    nodes: FlatTreeNode[];
}
declare type MetaClusterizedFlatTree = MetaClusterizedFlatTreeNode[];
interface ClusterizedFlatTreeNode {
    start: number;
    end: number;
    duration: number;
    type?: string;
    color?: string;
    level: number;
    nodes: FlatTreeNode[];
    specialType?: string;
    isThirdParty?: boolean;
    isHighlighted: boolean;
    isInactive: boolean;
}
declare type ClusterizedFlatTree = ClusterizedFlatTreeNode[];
interface TooltipField {
    color?: string;
    text: string;
}
interface HitRegion {
    type: string;
    data: any;
    x: number;
    y: number;
    w: number;
    h: number;
    cursor?: string;
    id?: number;
}

declare type RenderEngineArgs = {
    canvas: HTMLCanvasElement;
    settings: RenderSettings;
    plugins: UIPlugin[];
};
declare class RenderEngine extends BasicRenderEngine {
    plugins: UIPlugin[];
    children: OffscreenRenderEngine[];
    requestedRenders: number[];
    freeSpace: number;
    lastPartialAnimationFrame: number | null;
    lastGlobalAnimationFrame: number | null;
    constructor({ canvas, settings, plugins }: RenderEngineArgs);
    makeInstance(): OffscreenRenderEngine;
    calcMinMax(): void;
    setMinMax(min: number, max: number): void;
    setSettings(data: any): void;
    resize(width: any, height: any): boolean;
    recalcChildrenSizes(): void;
    getChildrenSizes(): {
        width: number;
        position: number;
        height: number;
    }[];
    setZoom(zoom: number): boolean;
    setPositionX(x: number): number;
    renderPlugin(index: number): void;
    partialRender(id?: number): void;
    shallowRender(): void;
    render(): void;
}

declare global {
    interface CanvasRenderingContext2D {
        roundRect(x: any, y: any, w: any, h: any, r: any): any;
    }
}
declare type RenderOptions = {
    tooltip?: ((data: any, renderEngine: RenderEngine | OffscreenRenderEngine, mouse: Mouse | null) => boolean | void) | boolean;
    timeUnits: string;
    inverted: boolean;
};
declare type RenderStyles = {
    blockHeight: number;
    blockPaddingLeftRight: number;
    backgroundColor: string;
    font: string;
    fontColor: string;
    fontColorInactive: string;
    tooltipHeaderFontColor: string;
    tooltipBodyFontColor: string;
    tooltipBackgroundColor: string;
    headerHeight: number;
    headerColor: string;
    headerStrokeColor: string;
    headerTitleLeftPadding: number;
};
declare type RenderSettings = {
    options?: Partial<RenderOptions>;
    styles?: Partial<RenderStyles>;
};
declare class BasicRenderEngine extends EventEmitter {
    width: number;
    height: number;
    isSafari: boolean;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    pixelRatio: number;
    options: RenderOptions;
    timeUnits: any;
    inverted: any;
    styles: RenderStyles;
    blockPaddingLeftRight: number;
    blockHeight: number;
    blockPaddingTopBottom: number;
    charHeight: number;
    placeholderWidth: number;
    avgCharWidth: number;
    minTextWidth: number;
    textRenderQueue: Text[];
    strokeRenderQueue: Stroke[];
    rectRenderQueue: RectRenderQueue;
    lastUsedColor: string | null;
    lastUsedStrokeColor: string | null;
    zoom: number;
    positionX: number;
    min: number;
    max: number;
    constructor(canvas: HTMLCanvasElement, settings: RenderSettings);
    setSettings({ options, styles }: RenderSettings): void;
    reset(): void;
    setCtxColor(color: string): void;
    setStrokeColor(color: string): void;
    setCtxFont(font: string): void;
    drawLine(x1: number, y1: number, x2: number, y2: number, color: string, width: number): void;
    drawLines(x: number, y: number, w: number, h: number): void;
    fillRect(x: number, y: number, w: number, h: number): void;
    fillText(text: string, x: number, y: number): void;
    renderBlock(originalColor: string, x: number, y: number, w: number, flags?: number): void;
    renderStroke(color: string, x: number, y: number, w: number, h: number): void;
    renderHoverStroke(color: any, x: any, y: any, w: any, h: any): void;
    shadowRect(x: any, y: any, w: any, h: any, repeats: any, color: any): void;
    clear(w?: number, h?: number, x?: number, y?: number): void;
    timeToPosition(time: number): number;
    pixelToTime(width: number): number;
    setZoom(zoom: number): void;
    setPositionX(x: number): number;
    addRectToRenderQueue(color: string, x: number, y: number, w: number, flags: any): void;
    addTextToRenderQueue(text: string, x: number, y: number, w: number, color: string, flags: any): void;
    addStrokeToRenderQueue(color: string, x: number, y: number, w: number, h: number): void;
    resolveRectRenderQueue(): void;
    resolveTextRenderQueue(): void;
    resolveStrokeRenderQueue(): void;
    setMinMax(min: number, max: number): void;
    getTimeUnits(): any;
    getInverted(): any;
    tryToChangePosition(positionDelta: number): void;
    getInitialZoom(): number;
    getRealView(): number;
    resetView(): void;
    resize(width?: number, height?: number): boolean;
    applyCanvasSize(): void;
    copy(engine: OffscreenRenderEngine): void;
    renderTooltipFromData(fields: TooltipField[], mouse: Mouse): void;
    renderOuterNodeMask(fields: any): void;
    drawTriangleMark(fields: any): void;
    renderNodeStrokeFromData(fields: any): void;
    renderShape(color: string, dots: Dots, posX: number, posY: number): void;
    renderTriangle(color: string, x: number, y: number, width: number, height: number, direction: 'bottom' | 'left' | 'right' | 'top'): void;
    renderCircle(color: string, x: number, y: number, radius: number): void;
}

interface OffscreenRenderEngineOptions {
    width: number;
    height: number;
    parent: RenderEngine;
    id: number | undefined;
}
declare class OffscreenRenderEngine extends BasicRenderEngine {
    parent: RenderEngine;
    id: number | undefined;
    children: OffscreenRenderEngine[];
    flexible: boolean;
    collapsed: boolean;
    position: number;
    constructor({ width, height, parent, id }: OffscreenRenderEngineOptions);
    makeChild(): OffscreenRenderEngine;
    setFlexible(): void;
    collapse(): void;
    expand(): void;
    setSettingsOverrides(settings: RenderSettings): void;
    resize({ width, height, position }: {
        width?: number;
        height?: number;
        position?: number;
    }, isParentCall?: boolean): void;
    setMinMax(min: number, max: number): void;
    setSettings(settings: RenderSettings): void;
    tryToChangePosition(positionDelta: number): void;
    recalcMinMax(): void;
    getTimeUnits(): any;
    getInverted(): any;
    getAccuracy(): number;
    standardRender(): void;
    renderTooltipFromData(fields: TooltipField[], mouse: Mouse): void;
    renderNodeStrokeFromData(fields: any): void;
    resetParentView(): void;
    render(): void;
}

declare class InteractionsEngine extends EventEmitter {
    private renderEngine;
    private readonly canvas;
    private hitRegions;
    private instances;
    mouse: Mouse;
    selectedRegion: HitRegion | null;
    private hoveredRegion;
    private moveActive;
    private isRightClick;
    private mouseDownPosition;
    private mouseDownHoveredInstance;
    private hoveredInstance;
    private currentCursor;
    constructor(canvas: HTMLCanvasElement, renderEngine: RenderEngine);
    makeInstance(renderEngine: OffscreenRenderEngine): SeparatedInteractionsEngine;
    reset(): void;
    destroy(): void;
    initListeners(): void;
    removeListeners(): void;
    handleMouseOut(): void;
    handleMouseWheel(e: any): void;
    handleMouseDown(e: any): void;
    handleMouseUp(): void;
    handleMouseMove(e: any): void;
    handleMouseDBCLick(): void;
    checkRegionHover(): void;
    getHoveredRegion(): HitRegion | null | undefined;
    clearHitRegions(): void;
    addHitRegion(type: any, data: any, x: number, y: number, w: number, h: number, cursor: string): void;
    setCursor(cursor: string): void;
    clearCursor(): void;
}

declare class SeparatedInteractionsEngine extends EventEmitter {
    static count: number;
    parent: InteractionsEngine;
    renderEngine: OffscreenRenderEngine;
    private readonly id;
    hitRegions: HitRegion[];
    static getId(): number;
    constructor(parent: InteractionsEngine, renderEngine: OffscreenRenderEngine);
    resend(event: any, ...args: any[]): void;
    getMouse(): {
        x: number;
        y: number;
    };
    getGlobalMouse(): Mouse;
    clearHitRegions(): void;
    addHitRegion(type: any, data: any, x: number, y: number, w: number, h: number, cursor?: string): void;
    setCursor(cursor: string): void;
    clearCursor(): void;
}

declare abstract class UIPlugin<S = {}> extends EventEmitter {
    abstract name: string;
    abstract height?: number;
    interactionsEngine: SeparatedInteractionsEngine;
    renderEngine: OffscreenRenderEngine;
    min?: number;
    max?: number;
    styles?: S;
    protected constructor();
    init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine): void;
    postInit?(): any;
    render?(): any;
    setSettings?(settings: {
        styles: S;
    }): void;
    toggleSelectLogic?(selectLogic: boolean): void;
    renderTooltip?(): any;
    renderSelectedNodeMask?(): any;
    renderNodeStroke?(): any;
    postRender?(): any;
}

declare const DEFAULT_COLOR: Color<string | number | Color<string | number | Color<string | number | Color<string | number | Color<string | number | Color<string | number | Color<string | number | Color<string | number | Color<string | number | Color<string | number | Color<string | number | Color<string | number | any | ArrayLike<number> | {
    [key: string]: any;
}> | ArrayLike<number> | {
    [key: string]: any;
}> | ArrayLike<number> | {
    [key: string]: any;
}> | ArrayLike<number> | {
    [key: string]: any;
}> | ArrayLike<number> | {
    [key: string]: any;
}> | ArrayLike<number> | {
    [key: string]: any;
}> | ArrayLike<number> | {
    [key: string]: any;
}> | ArrayLike<number> | {
    [key: string]: any;
}> | ArrayLike<number> | {
    [key: string]: any;
}> | ArrayLike<number> | {
    [key: string]: any;
}> | ArrayLike<number> | {
    [key: string]: any;
}> | ArrayLike<number> | {
    [key: string]: any;
}>;
declare class FlameChartPlugin extends UIPlugin {
    name: string;
    height: number;
    canvasHeight: number;
    withSelectLogic: boolean;
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
    toggleSelectLogic(selectLogic: any): void;
    handleMouseOut(): void;
    handleMouseDbClick(): void;
    handlePositionChange({ deltaX, deltaY }: {
        deltaX: number;
        deltaY: number;
    }): void;
    handleMouseUp(hoveredRegion: any, mouse: any, isClick: any): void;
    handleMouseRightClick(region: any, mouse: any): void;
    setPositionY(y: number): void;
    reset(keepYposition: boolean, newYPosition: number, resetSelected: boolean): void;
    calcMinMax(): void;
    handleSelect(region: any): void;
    handleHover(region: any): void;
    findNodeInCluster(region: any): {
        data: any;
        type: string;
    } | null;
    createNewColors(type: any, isWithFaded: any): string;
    getColor(type: any, specialType: any, defaultColor: any, isFaded: any): any;
    setData(data: Data, keepYposition: boolean, newYPosition: number, resetSelected: boolean): void;
    parseData(): void;
    initData(): void;
    reclusterizeClusteredFlatTree(): void;
    calcRect(start: number, duration: number, level: number): {
        x: number;
        y: number;
        w: number;
    };
    renderTooltip(): boolean;
    renderNodeStroke(): void;
    renderSelectedNodeMask(): void;
    getFlamegraphHeight(flamegraphObject: any, level?: number): number;
    render(): void;
}

declare type TogglePluginStyles = {
    height: number;
    color: string;
    strokeColor: string;
    dotsColor: string;
    fontColor: string;
    font: string;
    triangleWidth: number;
    triangleHeight: number;
    triangleColor: string;
    leftPadding: number;
};
declare type TogglePluginSettings = {
    styles?: Partial<TogglePluginStyles>;
};
declare class TogglePlugin extends UIPlugin<TogglePluginStyles> {
    name: string;
    styles: TogglePluginStyles;
    height: number;
    title: string;
    resizeActive: boolean;
    resizeStartHeight: number;
    resizeStartPosition: number;
    constructor(title: string, settings: TogglePluginSettings);
    setSettings({ styles }: TogglePluginSettings): void;
    init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine): void;
    getPrevEngine(): OffscreenRenderEngine;
    getNextEngine(): OffscreenRenderEngine;
    render(): void;
}

declare type FlameChartContainerStyles<Styles> = {
    main?: Partial<RenderStyles>;
} & Styles;
interface FlameChartContainerSettings<Styles> {
    options?: Partial<RenderOptions>;
    styles?: FlameChartContainerStyles<Styles>;
}
interface FlameChartContainerOptions<Styles> {
    canvas: HTMLCanvasElement;
    plugins: any[];
    settings: FlameChartContainerSettings<Styles>;
}
declare class FlameChartContainer<Styles> extends EventEmitter {
    renderEngine: RenderEngine;
    interactionsEngine: InteractionsEngine;
    plugins: UIPlugin[];
    constructor({ canvas, plugins, settings }: FlameChartContainerOptions<Styles>);
    render(): void;
    resize(width: number, height: number): void;
    execOnPlugins(fnName: string, ...args: any[]): void;
    setSettings(settings: FlameChartContainerSettings<Styles>): void;
    toggleSelectLogic(toggleSelect: boolean): void;
    off(type: string | number, listener: Listener): void;
    setZoom(start: number, end: number): void;
}

declare type FlameChartStyles = {
    togglePlugin?: Partial<TogglePluginStyles>;
};
declare type FlameChartSettings = {
    headers?: Partial<{
        waterfall: string;
        flameChart: string;
    }>;
} & FlameChartContainerSettings<FlameChartStyles>;
declare type FlameChartOptions = {
    canvas: HTMLCanvasElement;
    data?: Data;
    marks?: Marks;
    waterfall?: Waterfall;
    colors?: Colors;
    settings?: FlameChartSettings;
    plugins?: UIPlugin[];
};
declare class FlameChart extends FlameChartContainer<FlameChartStyles> {
    setData: (data: Data, keepYposition: any, newYPosition: any, resetSelected: any) => void;
    setMarks: (data: Marks) => void;
    setWaterfall: (data: Waterfall) => void;
    setFlameChartPosition: ({ x, y }: {
        x: number;
        y: number;
    }) => void;
    constructor({ canvas, data, colors, settings, plugins }: FlameChartOptions);
}

export { FlameChartContainer, FlameChartContainerOptions, FlameChartContainerSettings, FlameChartOptions, FlameChartPlugin, FlameChartSettings, FlameChartStyles, TogglePlugin, UIPlugin, FlameChart as default };
