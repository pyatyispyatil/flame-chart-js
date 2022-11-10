import {
    flatTree,
    clusterizeFlatTree,
    metaClusterizeFlatTree,
    reclusterizeClusteredFlatTree,
    getFlatTreeMinMax,
} from './utils/tree-clusters';
import Color from 'color';
import UIPlugin from './ui-plugin';
import {
    ClusterizedFlatTree,
    ClusterizedFlatTreeNode,
    Colors,
    Data,
    FlatTree,
    MetaClusterizedFlatTree,
} from '../types';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
import { FRAME_FLAG_IS_HIGHLIGHTED, FRAME_FLAG_IS_INACTIVE, FRAME_FLAG_IS_THIRD_PARTY } from '../const';

const DEFAULT_COLOR = Color.hsl(180, 30, 70);

export default class FlameChartPlugin extends UIPlugin {
    name = 'flameChartPlugin';

    height: number;
    canvasHeight: number;
    withSelectLogic: boolean;

    data: Data;
    userColors: Colors;
    flatTree: FlatTree;
    positionY: number;
    colors: Colors;
    selectedRegion;
    lastRandomColor: typeof DEFAULT_COLOR;
    hoveredRegion;
    metaClusterizedFlatTree: MetaClusterizedFlatTree;
    actualClusterizedFlatTree: ClusterizedFlatTree;
    initialClusterizedFlatTree: ClusterizedFlatTree;
    lastUsedColor: string | null;
    renderChartTimeout: number;

    constructor({ data, colors }) {
        super();

        this.data = data;
        this.userColors = colors;
        this.canvasHeight = 5000;
        this.withSelectLogic = true;

        this.parseData();
        this.reset(true, 0, false);
    }

    override init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine) {
        super.init(renderEngine, interactionsEngine);

        this.interactionsEngine.on('change-position', this.handlePositionChange.bind(this));
        this.interactionsEngine.on('click', this.handleSelect.bind(this));
        this.interactionsEngine.on('hover', this.handleHover.bind(this));
        this.interactionsEngine.on('up', this.handleMouseUp.bind(this));
        this.interactionsEngine.on('mouseout', this.handleMouseOut.bind(this));
        this.interactionsEngine.on('double', this.handleMouseDbClick.bind(this));
        this.interactionsEngine.on('mouseright', this.handleMouseRightClick.bind(this));
        this.toggleSelectLogic = this.toggleSelectLogic.bind(this);

        this.initData();
    }

    override toggleSelectLogic(selectLogic) {
        this.withSelectLogic = selectLogic;
    }

    handleMouseOut() {
        this.emit('mouseout', {});
    }

    handleMouseDbClick() {
        this.interactionsEngine.clearCursor();
        if (this.selectedRegion && this.selectedRegion.data) {
            this.emit(
                'dblclick',
                this.selectedRegion ? { ...this.selectedRegion.data, ...this.selectedRegion.data.source } : {},
                'flame-chart-node'
            );
        }
    }

    handlePositionChange({ deltaX, deltaY }: { deltaX: number; deltaY: number }) {
        const startPositionY = this.positionY;
        const startPositionX = this.renderEngine.parent.positionX;
        this.interactionsEngine.setCursor('grabbing');
        const inverted = this.renderEngine.getInverted();

        const changeToPosition = !inverted ? this.positionY + deltaY : this.positionY - deltaY;
        if (changeToPosition >= 0 && changeToPosition < this.canvasHeight) {
            this.setPositionY(changeToPosition);
        } else if (changeToPosition < 0) {
            this.setPositionY(0);
        }

        this.renderEngine.tryToChangePosition(deltaX);

        if (startPositionX !== this.renderEngine.parent.positionX || startPositionY !== this.positionY) {
            this.renderEngine.parent.render();
        }
    }

    handleMouseUp(hoveredRegion, mouse, isClick) {
        this.interactionsEngine.clearCursor();
        if (isClick && this.selectedRegion && this.selectedRegion.data) {
            this.emit(
                'mouseup',
                this.selectedRegion ? { ...this.selectedRegion.data, ...this.selectedRegion.data.source } : {},
                'flame-chart-node'
            );
        }
    }

    handleMouseRightClick(region, mouse) {
        this.interactionsEngine.clearCursor();
        const selectedRegion = region ? this.findNodeInCluster(region) : null;

        this.emit(
            'rightClick',
            selectedRegion ? { ...selectedRegion.data, ...selectedRegion.data.source } : undefined,
            mouse
        );
    }

    setPositionY(y: number) {
        this.positionY = y;
    }

    reset(keepYposition: boolean, newYPosition: number, resetSelected: boolean) {
        this.colors = {};
        this.lastRandomColor = DEFAULT_COLOR;
        if (!keepYposition) {
            this.positionY = newYPosition;
        }
        if (resetSelected) {
            this.selectedRegion = null;
        }
    }

    calcMinMax() {
        const { flatTree } = this;

        const { min, max } = getFlatTreeMinMax(flatTree);

        this.min = min;
        this.max = max;
    }

    handleSelect(region) {
        const selectedRegion = region ? this.findNodeInCluster(region) : null;
        if (this.selectedRegion !== selectedRegion) {
            this.selectedRegion = selectedRegion;
            if (selectedRegion && selectedRegion.data) {
                const { end } = selectedRegion.data;
                const { start } = selectedRegion.data.source;

                const zoom = this.renderEngine.width / (end - start);

                if (this.withSelectLogic) {
                    this.renderEngine.setPositionX(start);
                    this.renderEngine.setZoom(zoom);
                }
            }
            if (this.withSelectLogic) {
                this.renderEngine.render();
            }
            this.emit('mousedown', this.selectedRegion && this.selectedRegion.data, 'flame-chart-node');
        }
    }

    handleHover(region) {
        this.hoveredRegion = this.findNodeInCluster(region);
    }

    findNodeInCluster(region) {
        const mouse = this.interactionsEngine.getMouse();

        if (region && region.type === 'cluster') {
            if (this.withSelectLogic) {
                this.interactionsEngine.setCursor('pointer');
            } else {
                this.interactionsEngine.setCursor('cell');
            }
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
        } else {
            this.interactionsEngine.clearCursor();
        }
        return null;
    }

    createNewColors(type, isWithFaded) {
        const color = new Color(this.userColors[type]);
        const colorFaded = new Color(this.userColors[type]).alpha(0.2);
        this.colors[type] = color.rgb().toString();
        this.colors[type + '_f'] = colorFaded.rgb().toString();
        return this.colors[type + isWithFaded];
    }

    getColor(type, specialType, defaultColor, isFaded) {
        const isWithFaded = isFaded ? '_f' : '';
        if (defaultColor) {
            return defaultColor;
        } else if (specialType) {
            if (this.colors[specialType]) {
                return this.colors[specialType + isWithFaded];
            } else if (this.userColors[specialType]) {
                return this.createNewColors(specialType, isWithFaded);
            }
        } else if (this.colors[type]) {
            return this.colors[type + isWithFaded];
        } else if (this.userColors[type]) {
            return this.createNewColors(type, isWithFaded);
        } else {
            this.lastRandomColor = this.lastRandomColor.rotate(27);
            this.colors[type] = this.lastRandomColor.rgb().toString();
            return this.colors[type];
        }
    }

    setData(data: Data, keepYposition: boolean, newYPosition: number, resetSelected: boolean) {
        this.data = data;
        if (Array.isArray(data)) {
            this.canvasHeight = this.getFlamegraphHeight(data[0]) * this.renderEngine.blockHeight + 50;
        }
        this.parseData();
        this.initData();
        this.reset(keepYposition, newYPosition, resetSelected);

        this.renderEngine.recalcMinMax();
        if (resetSelected) {
            this.renderEngine.resetParentView();
        }
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
        const offset = level * (this.renderEngine.blockHeight + 1) - this.positionY;
        const inverted = this.renderEngine.getInverted();

        return {
            x: this.renderEngine.timeToPosition(start),
            y: !inverted ? offset : this.renderEngine.height - offset - this.renderEngine.blockHeight,
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
                        source: { start, duration, name },
                        children,
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

    override renderNodeStroke() {
        if (this.hoveredRegion && this.hoveredRegion.type === 'node') {
            const { level: hoveredLevel } = this.hoveredRegion.data;
            const { start: hoveredStart, duration: hoveredDuration } = this.hoveredRegion.data.source;
            const { x, y, w } = this.calcRect(hoveredStart, hoveredDuration, hoveredLevel);
            this.renderEngine.renderNodeStrokeFromData({
                x,
                y,
                w,
                h: this.renderEngine.blockHeight,
                color: 'rgba(55, 58, 74,0.7)',
            });
        }
    }

    override renderSelectedNodeMask() {
        if (this.selectedRegion && this.selectedRegion.type === 'node') {
            const { level } = this.selectedRegion.data;
            const { start, duration } = this.selectedRegion.data.source;

            const { x, y, w } = this.calcRect(start, duration, level);
            this.renderEngine.renderOuterNodeMask({
                x,
                y,
                w,
                h: this.renderEngine.blockHeight,
                color: 'rgba(55, 58, 74,0.7)',
            });
        }
    }

    getFlamegraphHeight(flamegraphObject, level = 0) {
        if (flamegraphObject?.children?.length > 0) {
            return Math.max(...flamegraphObject.children.map((child) => this.getFlamegraphHeight(child, level + 1)));
        }
        return level;
    }

    override render() {
        const { width, blockHeight, height, minTextWidth } = this.renderEngine;
        this.lastUsedColor = null;

        this.reclusterizeClusteredFlatTree();

        const processCluster = (cb) => (cluster: ClusterizedFlatTreeNode) => {
            const { start, duration, level } = cluster;
            const { x, y, w } = this.calcRect(start, duration, level);

            if (x + w > 0 && x < width && y + blockHeight > 0 && y < height) {
                cb(cluster, x, y, w);
            }
        };

        const renderCluster = (cluster: ClusterizedFlatTreeNode, x: number, y: number, w: number) => {
            const { type, specialType, nodes, color, isThirdParty, isHighlighted, isInactive } = cluster;
            let flags = 0;

            if (isThirdParty) {
                flags |= FRAME_FLAG_IS_THIRD_PARTY;
            }
            if (isHighlighted) {
                flags |= FRAME_FLAG_IS_HIGHLIGHTED;
            }
            if (isInactive) {
                flags |= FRAME_FLAG_IS_INACTIVE;
            }

            const mouse = this.interactionsEngine.getMouse();

            if (mouse.y >= y && mouse.y <= y + blockHeight) {
                addHitRegion(cluster, x, y, w);
            }
            const calculatedColor = this.getColor(type, specialType, color, isInactive);

            if (w >= 0.25) {
                this.renderEngine.addRectToRenderQueue(calculatedColor, x, y, w, flags);
            }

            if (w >= minTextWidth && nodes.length === 1) {
                this.renderEngine.addTextToRenderQueue(nodes[0].source.name, x, y, w, calculatedColor, flags);
            }
        };

        const addHitRegion = (cluster, x: number, y: number, w: number) => {
            this.interactionsEngine.addHitRegion('cluster', cluster, x, y, w, blockHeight);
        };

        this.actualClusterizedFlatTree.forEach(processCluster(renderCluster));

        clearTimeout(this.renderChartTimeout);

        this.renderChartTimeout = setTimeout(() => {
            this.interactionsEngine.clearHitRegions();
            this.actualClusterizedFlatTree.forEach(processCluster(addHitRegion));
        }, 16);
    }
}
