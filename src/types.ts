type Mark = {
    shortName: string,
    fullName: string,
    timestamp: number,
    color: string
};

export type Marks = Array<Mark>;

export type Node = {
    name: string, // node name
    start: number, // node start time
    duration: number, // node duration
    type?: string, // node type (use it for custom colorization)
    color?: string, // node color (use it for current node colorization)
    children?: Array<Node>, // node children (same structure as for node)
};

export type Data = Array<Node>;

type WaterfallItems = Array<{
    name: string,
    intervals: string | WaterfallInterval,
    timing: {
        [key: string]: number
    }
}>

type WaterfallInterval = {
    name: string,
    color: string,
    type: 'block' | 'line',
    start: string, // timing name
    end: string // timing name
}

type WaterfallIntervals = {
    [intervalName: string]: WaterfallInterval
}

export type Waterfall = {
    items: WaterfallItems,
    intervals: WaterfallIntervals
}

export type Colors = Record<string, string>;
export interface Mouse {
    x: number;
    y: number;
}

type Dot = { x: number, y: number };
export type Dots = [Dot, Dot, Dot];
