import {
    clusterizeFlatTree,
    flatTree,
    getFlatTreeMinMax,
    metaClusterizeFlatTree,
    reclusterizeClusteredFlatTree,
} from './utils/tree-clusters';
import Color from 'color';
import UIPlugin from './ui-plugin';
import {
    ClusterizedFlatTree,
    ClusterizedFlatTreeNode,
    Colors,
    Data,
    FlatTree,
    FlatTreeNode,
    HitRegion,
    MetaClusterizedFlatTree,
    RegionTypes,
} from '../types';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';

type ClusterNode = { data: FlatTreeNode; type: string };

const DEFAULT_COLOR = Color.hsl(180, 30, 70);

export class FlameChartPlugin extends UIPlugin {
    name: string;

    height = 0;

    data: Data;
    userColors: Colors;
    flatTree: FlatTree = [];
    positionY = 0;
    colors: Colors = {};
    selectedRegion: ClusterNode | null = null;
    hoveredRegion: ClusterNode | null = null;
    lastRandomColor: typeof DEFAULT_COLOR = DEFAULT_COLOR;
    metaClusterizedFlatTree: MetaClusterizedFlatTree = [];
    actualClusterizedFlatTree: ClusterizedFlatTree = [];
    initialClusterizedFlatTree: ClusterizedFlatTree = [];
    lastUsedColor: string | null = null;
    renderChartTimeout = -1;

    constructor({ data, colors = {} }: { data: Data; colors: Colors | undefined }, name = 'flameChartPlugin') {
        super();

        this.name = name;
        this.data = data;
        this.userColors = colors;

        this.parseData();
        this.reset();
    }

    override init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine) {
        super.init(renderEngine, interactionsEngine);

        this.interactionsEngine.on('change-position', this.handlePositionChange.bind(this));
        this.interactionsEngine.on('select', this.handleSelect.bind(this));
        this.interactionsEngine.on('hover', this.handleHover.bind(this));
        this.interactionsEngine.on('up', this.handleMouseUp.bind(this));

        this.initData();
    }

    handlePositionChange({ deltaX, deltaY }: { deltaX: number; deltaY: number }) {
        const startPositionY = this.positionY;
        const startPositionX = this.renderEngine.parent.positionX;

        this.interactionsEngine.setCursor('grabbing');

        if (this.positionY + deltaY >= 0) {
            this.setPositionY(this.positionY + deltaY);
        } else {
            this.setPositionY(0);
        }

        this.renderEngine.tryToChangePosition(deltaX);

        if (startPositionX !== this.renderEngine.parent.positionX || startPositionY !== this.positionY) {
            this.renderEngine.parent.render();
        }
    }

    handleMouseUp() {
        this.interactionsEngine.clearCursor();
    }

    setPositionY(y: number) {
        this.positionY = y;
    }

    reset() {
        this.colors = {};
        this.lastRandomColor = DEFAULT_COLOR;

        this.positionY = 0;
        this.selectedRegion = null;
    }

    calcMinMax() {
        const { flatTree } = this;

        const { min, max } = getFlatTreeMinMax(flatTree);

        this.min = min;
        this.max = max;
    }

    handleSelect(region: HitRegion<ClusterizedFlatTreeNode>) {
        const selectedRegion = this.findNodeInCluster(region);

        if (this.selectedRegion !== selectedRegion) {
            this.selectedRegion = selectedRegion;

            this.renderEngine.render();

            this.emit('select', this.selectedRegion?.data, 'flame-chart-node');
        }
    }

    handleHover(region: HitRegion<ClusterizedFlatTreeNode>) {
        this.hoveredRegion = this.findNodeInCluster(region);
    }

    findNodeInCluster(region: HitRegion<ClusterizedFlatTreeNode>): ClusterNode | null {
        const mouse = this.interactionsEngine.getMouse();

        if (region && region.type === RegionTypes.CLUSTER) {
            const hoveredNode = region.data.nodes.find(({ level, source: { start, duration } }) => {
                const { x, y, w } = this.calcRect(start, duration, level);

                return mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + this.renderEngine.blockHeight;
            });

            if (hoveredNode) {
                return {
                    data: hoveredNode,
                    type: 'node',
                };
            }
        }
        return null;
    }

    getColor(type: string = '_default', defaultColor?: string) {
        if (defaultColor) {
            return defaultColor;
        } else if (this.colors[type]) {
            return this.colors[type];
        } else if (this.userColors[type]) {
            const color = new Color(this.userColors[type]);

            this.colors[type] = color.rgb().toString();

            return this.colors[type];
        }
        this.lastRandomColor = this.lastRandomColor.rotate(27);
        this.colors[type] = this.lastRandomColor.rgb().toString();

        return this.colors[type];
    }

    setData(data: Data) {
        this.data = data;

        this.parseData();
        this.initData();

        this.reset();

        this.renderEngine.recalcMinMax();
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
            this.renderEngine.zoom,
            this.min,
            this.max
        );

        this.reclusterizeClusteredFlatTree();
    }

    reclusterizeClusteredFlatTree() {
        this.actualClusterizedFlatTree = reclusterizeClusteredFlatTree(
            this.initialClusterizedFlatTree,
            this.renderEngine.zoom,
            this.renderEngine.positionX,
            this.renderEngine.positionX + this.renderEngine.getRealView()
        );
    }

    calcRect(start: number, duration: number, level: number) {
        const w = duration * this.renderEngine.zoom;

        return {
            x: this.renderEngine.timeToPosition(start),
            y: level * (this.renderEngine.blockHeight + 1) - this.positionY,
            w: w <= 0.1 ? 0.1 : w >= 3 ? w - 1 : w - w / 3,
        };
    }

    override renderTooltip() {
        if (this.hoveredRegion) {
            if (this.renderEngine.options.tooltip === false) {
                return true;
            } else if (typeof this.renderEngine.options.tooltip === 'function') {
                this.renderEngine.options.tooltip(
                    this.hoveredRegion,
                    this.renderEngine,
                    this.interactionsEngine.getGlobalMouse()
                );
            } else {
                const {
                    data: {
                        source: { start, duration, name, children },
                    },
                } = this.hoveredRegion;
                const timeUnits = this.renderEngine.getTimeUnits();

                const selfTime = duration - (children ? children.reduce((acc, { duration }) => acc + duration, 0) : 0);

                const nodeAccuracy = this.renderEngine.getAccuracy() + 2;
                const header = `${name}`;
                const dur = `duration: ${duration.toFixed(nodeAccuracy)} ${timeUnits} ${
                    children?.length ? `(self ${selfTime.toFixed(nodeAccuracy)} ${timeUnits})` : ''
                }`;
                const st = `start: ${start.toFixed(nodeAccuracy)}`;

                this.renderEngine.renderTooltipFromData(
                    [{ text: header }, { text: dur }, { text: st }],
                    this.interactionsEngine.getGlobalMouse()
                );
            }

            return true;
        }
        return false;
    }

    override render() {
        const { width, blockHeight, height, minTextWidth } = this.renderEngine;
        this.lastUsedColor = null;

        this.reclusterizeClusteredFlatTree();

        const processCluster = (cb: (cluster: ClusterizedFlatTreeNode, x: number, y: number, w: number) => void) => {
            return (cluster: ClusterizedFlatTreeNode) => {
                const { start, duration, level } = cluster;
                const { x, y, w } = this.calcRect(start, duration, level);

                if (x + w > 0 && x < width && y + blockHeight > 0 && y < height) {
                    cb(cluster, x, y, w);
                }
            };
        };

        const renderCluster = (cluster: ClusterizedFlatTreeNode, x: number, y: number, w: number) => {
            const { type, nodes, color, intervals, level } = cluster;
            const mouse = this.interactionsEngine.getMouse();

            if (mouse.y >= y && mouse.y <= y + blockHeight) {
                addHitRegion(cluster, x, y, w);
            }

            if (w >= 0.25) {
                this.renderEngine.addRectToRenderQueue(this.getColor(type, color), x, y, w);
                if (intervals) {
                    intervals.forEach((interval) => {
                        const {
                            w: intervalWidth,
                            x,
                            y,
                        } = this.calcRect(interval.start, interval.end - interval.start, level);
                        if (w - intervalWidth >= 0.25) {
                            this.renderEngine.addRectToRenderQueue('white', x, y, intervalWidth, true);
                        }
                    });
                }
            }

            if (w >= minTextWidth && nodes.length === 1) {
                this.renderEngine.addTextToRenderQueue(nodes[0].source.name, x, y, w);
            }
        };

        const addHitRegion = (cluster: ClusterizedFlatTreeNode, x: number, y: number, w: number) => {
            this.interactionsEngine.addHitRegion(RegionTypes.CLUSTER, cluster, x, y, w, blockHeight);
        };

        this.actualClusterizedFlatTree.forEach(processCluster(renderCluster));

        if (this.selectedRegion && this.selectedRegion.type === 'node') {
            const {
                source: { start, duration },
                level,
            } = this.selectedRegion.data;
            const { x, y, w } = this.calcRect(start, duration, level);

            this.renderEngine.addStrokeToRenderQueue('green', x, y, w, this.renderEngine.blockHeight);
        }

        clearTimeout(this.renderChartTimeout);

        this.renderChartTimeout = setTimeout(() => {
            this.interactionsEngine.clearHitRegions();
            this.actualClusterizedFlatTree.forEach(processCluster(addHitRegion));
        }, 16);
    }
}
export default FlameChartPlugin;
