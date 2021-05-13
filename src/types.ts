export interface Mark {
    shortName: string,
    fullName: string,
    timestamp: number,
    color: string
}

export type Marks = Mark[];

export interface Node {
    /**
     * Node name
     */
    name: string;

    /**
     * Node start time
     */
    start: number;

    /**
     * Node duration
     */
    duration: number;

    /**
     * Node type (use it for custom colorization)
     */
    type?: string;

    /**
     * node color (use it for current node colorization)
     */
    color?: string;

    /**
     * node children (same structure as for node)
     */
    children?: Node[];
}

export type FlatTreeNode = Node & {
    end: number,
    parent: any,
    level: number,
    index: number
}

export type FlatTree = FlatTreeNode[];

export type MetaclusterizedFlatTree = {
    nodes: FlatTreeNode[],
    parents: any[]
}[];

export interface ClusterizedFlatTree {
    start: number;
    end: number;
    level: number;
}

export interface Plugin {
    min?: number;
    [key: string]: any;
}

export type Data = Node[];
export type Plugins = Plugin[];

export interface TimeGridStyleSettings {
    color: string;
}

export interface MainStyleSettings {
    blockHeight: number;
    blockPaddingLeftRight: number;
    backgroundColor: string;
    font: string;
    fontColor: string;
    tooltipHeaderFontColor: string;
    tooltipBodyFontColor: string;
    tooltipBackgroundColor: string;
}

export interface Settings {
    timeUnits: 'ms' | string;
    performance?: boolean;
    styles: {
        timeGrid: TimeGridStyleSettings,
        main: MainStyleSettings;
    }
}

export interface FlameChartCreationOptions {
    canvas: HTMLCanvasElement,
    data: Data,
    marks: Marks,
    colors: any,
    settings: Settings,
    plugins: Plugins
}

export interface Stroke {
    color: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface Rect {
    x: number;
    y: number;
    w: number;
}

export interface Text {
    text: string;
    x: number;
    y: number;
    w: number;
    textMaxWidth: number;
}

export interface Mouse {
    x: number;
    y: number;
}
