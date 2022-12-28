export const EVENT_NAMES = ['down', 'up', 'move', 'click', 'select'] as const;

export interface Mark {
    shortName: string;
    fullName: string;
    timestamp: number;
    color: string;
}

export type Marks = Array<Mark>;

export interface Node {
    name: string; // node name
    start: number; // node start time
    duration: number; // node duration
    type?: string; // node type (use it for custom colorization)
    color?: string; // node color (use it for current node colorization)
    children?: Array<Node>; // node children (same structure as for node)
}

export type Data = Array<Node>;

export type WaterfallItems = Array<{
    name: string;
    intervals: WaterfallInterval[] | string;
    timing: {
        [key: string]: number;
    };
}>;

export type WaterfallInterval = {
    name: string;
    color: string;
    type: 'block' | 'line';
    start: string; // timing name
    end: string; // timing name
};

export interface WaterfallIntervals {
    [intervalName: string]: WaterfallInterval[];
}

export interface Waterfall {
    items: WaterfallItems;
    intervals: WaterfallIntervals;
}

export type Colors = Record<string, string>;
export interface Mouse {
    x: number;
    y: number;
}

interface Dot {
    x: number;
    y: number;
}
export type Dots = [Dot, Dot, Dot];

interface Rect {
    x: number;
    y: number;
    w: number;
}
export interface RectRenderQueue {
    [color: string]: Rect[];
}

export interface Text {
    text: string;
    x: number;
    y: number;
    w: number;
    textMaxWidth: number;
}

export interface Stroke {
    color: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

export type FlatTreeNode = {
    source: Node;
    end: number;
    parent: FlatTreeNode | null;
    level: number;
    index: number;
};

export type FlatTree = FlatTreeNode[];

export interface MetaClusterizedFlatTreeNode {
    nodes: FlatTreeNode[];
}

export type MetaClusterizedFlatTree = MetaClusterizedFlatTreeNode[];

export interface ClusterizedFlatTreeNode {
    start: number;
    end: number;
    duration: number;
    type?: string;
    color?: string;
    level: number;
    nodes: FlatTreeNode[];
}

export type ClusterizedFlatTree = ClusterizedFlatTreeNode[];

export interface TooltipField {
    color?: string;
    text: string;
}

export const enum RegionTypes {
    WATERFALL_NODE = 'waterfall-node',
    CLUSTER = 'cluster',
    TIMEFRAME_AREA = 'timeframeArea',
    TIMEFRAME_KNOB = 'timeframeKnob',
    KNOB_RESIZE = 'knob-resize',
    TOGGLE = 'toggle',
    TIMESTAMP = 'timestamp',
}

export const enum CursorTypes {
    TEXT = 'text',
    ROW_RESIZE = 'row-resize',
    POINTER = 'pointer',
    EW_RESIZE = 'ew-resize',
}

export interface HitRegion<S = any> {
    type: RegionTypes;
    data: S;
    x: number;
    y: number;
    w: number;
    h: number;
    cursor?: CursorTypes;
    id?: number;
}
