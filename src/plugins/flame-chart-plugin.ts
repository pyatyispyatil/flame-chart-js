import {
    flatTree,
    clusterizeFlatTree,
    metaClusterizeFlatTree,
    reclusterizeClusteredFlatTree,
    getFlatTreeMinMax
} from './utils/tree-clusters.js';
import Color from 'color';
import { EventEmitter } from 'events';
import { Data } from "../types";
import { RenderEngine } from "../engines/render-engine";
import {InteractionsEngine, SeparatedInteractionsEngine} from "../engines/interactions-engine";

const DEFAULT_COLOR = Color.hsl(180, 30, 70);

interface FlameChartPluginCreationOptions {
    data: Data;
    colors: Record<any, any>;
}

export default class FlameChartPlugin extends EventEmitter {
    private data: Data;
    private userColors: Record<any, any>;
    private renderEngine: RenderEngine | undefined;
    private interactionsEngine: SeparatedInteractionsEngine | undefined;
    private colors: Record<any, any> = {};
    // TODO: review this any type as it wants to import something from color package
    private lastRandomColor: any;
    private selectedRegion: any;
    private flatTree: any[] = [];
    private hoveredRegion: { data: any; type: string; } | undefined;
    private initialClusterizedFlatTree: any;
    private metaClusterizedFlatTree: any;
    private lastUsedColor: any;
    private actualClusterizedFlatTree: any;
    private renderChartTimeout: number | undefined;

    positionY = 0;
    min = 0;
    max = 0;

    constructor({
                    data,
                    colors
                }: FlameChartPluginCreationOptions) {
        super();

        this.data = data;
        this.userColors = colors;

        // TODO: seems like this function takes 0 params
        this.parseData();
        this.reset();
    }

    init(renderEngine: RenderEngine, interactionsEngine: SeparatedInteractionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;

        this.interactionsEngine.on('change-position', this.handlePositionChange.bind(this));
        this.interactionsEngine.on('select', this.handleSelect.bind(this));
        this.interactionsEngine.on('hover', this.handleHover.bind(this));

        this.initData();
    }

    handlePositionChange({ deltaX, deltaY }: { deltaX: number, deltaY: number }) {
        const startPositionY = this.positionY;
        // @ts-ignore TODO: complains that parent can be undefined in render engine, I was not sure about typings on that
        const startPositionX = this.renderEngine.parent.positionX;

        if (this.positionY + deltaY >= 0) {
            this.setPositionY(this.positionY + deltaY);
        } else {
            this.setPositionY(0);
        }

        // @ts-ignore TODO: this.renderEngine can be undefined as it is not defined in the constructor
        this.renderEngine.tryToChangePosition(deltaX)

        // @ts-ignore TODO: complains that parent can be undefined in render engine, I was not sure about typings on that
        if (startPositionX !== this.renderEngine.parent.positionX || startPositionY !== this.positionY) {
            // @ts-ignore TODO: complains that parent can be undefined in render engine, I was not sure about typings on that
            this.renderEngine.parent.render();
        }
    }

    setPositionY(y: number) {
        this.positionY = y;
    }

    reset() {
        this.colors = {};
        this.lastRandomColor = DEFAULT_COLOR;

        this.positionY = 0;
        this.userColors = {};
        this.selectedRegion = null;
    }

    calcMinMax() {
        const { flatTree } = this;

        const { min, max } = getFlatTreeMinMax(flatTree);

        this.min = min;
        this.max = max;
    }

    handleSelect(region: any) {
        // @ts-ignore TODO: complains that interactionsEngine is undefined as it is not defined in constructor
        // TOOD: not used? findNodeInCluster does not take mouse in
        // const mouse = this.interactionsEngine.getMouse();
        const selectedRegion = region ? this.findNodeInCluster(region) : null;

        if (this.selectedRegion !== selectedRegion) {
            this.selectedRegion = selectedRegion;

            // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
            this.renderEngine.render();

            this.emit('select', this.selectedRegion && this.selectedRegion.data);
        }
    }

    handleHover(region) {
        this.hoveredRegion = this.findNodeInCluster(region);
    }

    findNodeInCluster(region) {
        // @ts-ignore TODO: I am not seeing getMouse in InteractionsEngine class, if this is supposed to be its instance?
        const mouse = this.interactionsEngine.getMouse();

        if (region && region.type === 'cluster') {
            const hoveredNode = region.data.nodes.find(({ level, start, duration }) => {
                const { x, y, w } = this.calcRect(start, duration, level);

                // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
                return mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + this.renderEngine.blockHeight;
            });

            if (hoveredNode) {
                return {
                    data: hoveredNode,
                    type: 'node'
                };
            }
        }
    }

    getColor(type: string, defaultColor: string) {
        if (defaultColor) {
            return defaultColor;
        } else if (this.colors[type]) {
            return this.colors[type];
        } else if (this.userColors[type]) {
            const color = new Color(this.userColors[type]);

            this.colors[type] = color.rgb().toString();

            return this.colors[type];
        } else {
            this.lastRandomColor = this.lastRandomColor.rotate(27);
            this.colors[type] = this.lastRandomColor.rgb().toString();

            return this.colors[type];
        }
    }

    setData(data: Data) {
        this.data = data;

        this.parseData();
        this.initData();

        this.reset();

        // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
        this.renderEngine.recalcMinMax();
        // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
        this.renderEngine.resetParentView();
    }

    parseData() {
        this.flatTree = flatTree(this.data);

        this.calcMinMax();
    }

    initData() {
        this.metaClusterizedFlatTree = metaClusterizeFlatTree(this.flatTree);
        this.initialClusterizedFlatTree = clusterizeFlatTree(
            this.metaClusterizedFlatTree,
            // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
            this.renderEngine.zoom,
            this.min,
            this.max
        );

        this.reclusterizeClusteredFlatTree();
    }

    reclusterizeClusteredFlatTree() {
        // @ts-ignore TODO: expects 6 args but got 4?
        this.actualClusterizedFlatTree = reclusterizeClusteredFlatTree(
            this.initialClusterizedFlatTree,
            // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
            this.renderEngine.zoom,
            // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
            this.renderEngine.positionX,
            // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
            this.renderEngine.positionX + this.renderEngine.getRealView()
        );
    }

    calcRect(start: number, duration: number, level: number) {
        // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
        const w = (duration * this.renderEngine.zoom);

        return {
            // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
            x: this.renderEngine.timeToPosition(start),
            // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
            y: (level * (this.renderEngine.blockHeight + 1)) - this.positionY,
            w: w <= 0.1 ? 0.1 : w >= 3 ? w - 1 : w - w / 3
        }
    }

    renderTooltip() {
        if (this.hoveredRegion) {
            const { data: { start, duration, children, name } } = this.hoveredRegion;
            // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
            const timeUnits = this.renderEngine.getTimeUnits();

            const selfTime = duration - (children ? children.reduce((acc, { duration }) => acc + duration, 0) : 0);

            // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
            const nodeAccuracy = this.renderEngine.getAccuracy() + 2;
            const header = `${name}`;
            const dur = `duration: ${duration.toFixed(nodeAccuracy)} ${timeUnits} ${children && children.length ? `(self ${selfTime.toFixed(nodeAccuracy)} ${timeUnits})` : ''}`;
            const st = `start: ${start.toFixed(nodeAccuracy)}`;

            // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor, I am not seeing getGlobalMouse on InteractionsEngine class?
            this.renderEngine.renderTooltipFromData(header, [dur, st], this.interactionsEngine.getGlobalMouse());

            return true;
        }
    }

    render() {
        // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
        const {
            width,
            blockHeight,
            height,
            minTextWidth
        } = this.renderEngine!;
        this.lastUsedColor = null;

        this.reclusterizeClusteredFlatTree();

        const processCluster = (cb) => (cluster) => {
            const {
                start,
                duration,
                level,
            } = cluster;
            const { x, y, w } = this.calcRect(start, duration, level);

            if (x + w > 0
                && x < width
                && y + blockHeight > 0
                && y < height) {
                cb(cluster, x, y, w);
            }
        };

        const renderCluster = (cluster, x, y, w) => {
            const {
                type,
                nodes,
                color
            } = cluster;
            // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor, also getMouse does not exist on InteractionsEngine class if its supposed to be its instance?
            const mouse = this.interactionsEngine.getMouse();

            if (mouse.y >= y && mouse.y <= y + blockHeight) {
                addHitRegion(cluster, x, y, w);
            }

            if (w >= 0.25) {
                // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
                this.renderEngine.addRectToRenderQueue(this.getColor(type, color), x, y, w);
            }

            if (w >= minTextWidth && nodes.length === 1) {
                // @ts-ignore TODO: complains that renderEngine is undefined as it is not defined in constructor
                this.renderEngine.addTextToRenderQueue(nodes[0].name, x, y, w);
            }
        }

        const addHitRegion = (cluster, x, y, w) => {
            // @ts-ignore TODO: complains that interactionsEngine is undefined as it is not defined in constructor
            this.interactionsEngine.addHitRegion('cluster', cluster, x, y, w, blockHeight);
        }

        // @ts-ignore TODO: complains that interactionsEngine is undefined as it is not defined in constructor
        this.interactionsEngine.clearHitRegions();
        this.actualClusterizedFlatTree.forEach(processCluster(renderCluster));

        if (this.selectedRegion && this.selectedRegion.type === 'node') {
            const { start, duration, level } = this.selectedRegion.data;
            const { x, y, w } = this.calcRect(start, duration, level);

            // @ts-ignore TODO: complains that interactionsEngine is undefined as it is not defined in constructor
            this.renderEngine.addStrokeToRenderQueue('green', x, y, w, this.renderEngine.blockHeight);
        }

        clearTimeout(this.renderChartTimeout);

        this.renderChartTimeout = setTimeout(() => {
            // @ts-ignore TODO: complains that interactionsEngine is undefined as it is not defined in constructor
            this.interactionsEngine.clearHitRegions();
            this.actualClusterizedFlatTree.forEach(processCluster(addHitRegion));
        }, 16);
    }
}
