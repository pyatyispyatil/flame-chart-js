import {
    flatTree,
    clusterizeFlatTree,
    metaClusterizeFlatTree,
    reclusterizeClusteredFlatTree,
    getFlatTreeMinMax
} from './utils/tree-clusters.js';
import Color from 'color';
import UIPlugin from './ui-plugin.js';

const DEFAULT_COLOR = Color.hsl(180, 30, 70);

export default class FlameChartPlugin extends UIPlugin {
    constructor({
                    data,
                    colors
                }) {
        super();

        this.data = data;
        this.userColors = colors;
        this.currentHoveredNode = null
        this.canvasHeight = 5000
        this.parseData(this.data);
        this.reset();
    }

    init(renderEngine, interactionsEngine) {
        super.init(renderEngine, interactionsEngine);

        this.interactionsEngine.on('change-position', this.handlePositionChange.bind(this));
        this.interactionsEngine.on('down', this.handleSelect.bind(this));
        this.interactionsEngine.on('hover', this.handleHover.bind(this));
        this.interactionsEngine.on('up', this.handleMouseUp.bind(this));

        this.initData();
    }

    handlePositionChange({ deltaX, deltaY }) {
        const startPositionY = this.positionY;
        const startPositionX = this.renderEngine.parent.positionX;

        const changeToPosition = this.positionY + deltaY
        if (changeToPosition >= 0 && changeToPosition <this.canvasHeight) {
            this.setPositionY(changeToPosition);
        } else if (changeToPosition < 0) {
            this.setPositionY(0);
        }

        this.renderEngine.tryToChangePosition(deltaX)

        if (startPositionX !== this.renderEngine.parent.positionX || startPositionY !== this.positionY) {
            this.renderEngine.parent.render();
        }
    }

    handleMouseUp() {
        this.interactionsEngine.clearCursor();
        if (this.selectedRegion && this.selectedRegion.data){
        this.emit('mouseup', this.selectedRegion && this.selectedRegion.data, 'flame-chart-node');
        }
    }

    setPositionY(y) {
        this.positionY = y;
    }

    reset(newYPosition = 0) {
        this.colors = {};
        this.lastRandomColor = DEFAULT_COLOR;
        this.positionY = newYPosition;
        this.selectedRegion = null;
    }

    calcMinMax() {
        const { flatTree } = this;

        const { min, max } = getFlatTreeMinMax(flatTree);

        this.min = min;
        this.max = max;
    }

    handleSelect(region) {
        const mouse = this.interactionsEngine.getMouse();
        const selectedRegion = region ? this.findNodeInCluster(region, mouse) : null;
        if (this.selectedRegion !== selectedRegion) {
            this.selectedRegion = selectedRegion;
            if (selectedRegion && selectedRegion.data){
            const {start,end,level} = selectedRegion.data
            const zoom = this.renderEngine.width / (end - start);
            this.renderEngine.setPositionX(start);
            this.setPositionY(level * 21);
            this.renderEngine.setZoom(zoom);
            }
            this.renderEngine.render();

            this.emit('mousedown', this.selectedRegion && this.selectedRegion.data, 'flame-chart-node');
            //this.emit('mouseup', this.selectedRegion && this.selectedRegion.data, 'flame-chart-node');
        }
    }

    handleHover(region) {
        this.hoveredRegion = this.findNodeInCluster(region);
    }

    findNodeInCluster(region) {
        const mouse = this.interactionsEngine.getMouse();

        if (region && region.type === 'cluster') {
            this.interactionsEngine.setCursor('pointer');
            const hoveredNode = region.data.nodes.find(({ level, start, duration }) => {
                const { x, y, w } = this.calcRect(start, duration, level);

                return mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + this.renderEngine.blockHeight;
            });

            if (hoveredNode) {
                return {
                    data: hoveredNode,
                    type: 'node'
                };
            }
        }
        else{
            this.interactionsEngine.clearCursor();
        }
    }

    getColor(type, defaultColor) {
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

    setData(data,newYPosition,canvasHeight) {
        this.data = data;
        this.canvasHeight = canvasHeight;
        this.parseData();
        this.initData();
        this.reset(newYPosition);

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

    calcRect(start, duration, level) {
        const w = (duration * this.renderEngine.zoom);

        return {
            x: this.renderEngine.timeToPosition(start),
            y: (level * (this.renderEngine.blockHeight + 1)) - this.positionY,
            w: w <= 0.1 ? 0.1 : w >= 3 ? w - 1 : w - w / 3
        }
    }

    renderTooltip() {
        if (this.hoveredRegion) {
            if (this.renderEngine.settings.tooltip === false) {
                return true;
            } else if (typeof this.renderEngine.settings.tooltip === 'function') {
                this.renderEngine.settings.tooltip(
                    this.hoveredRegion,
                    this.renderEngine,
                    this.interactionsEngine.getGlobalMouse()
                );
            } else {
                const { data: { start, duration, children, name } } = this.hoveredRegion;
                const timeUnits = this.renderEngine.getTimeUnits();

                const selfTime = duration - (children ? children.reduce((acc, { duration }) => acc + duration, 0) : 0);

                const nodeAccuracy = this.renderEngine.getAccuracy() + 2;
                const header = `${name}`;
                const dur = `duration: ${duration.toFixed(nodeAccuracy)} ${timeUnits} ${children && children.length ? `(self ${selfTime.toFixed(nodeAccuracy)} ${timeUnits})` : ''}`;
                const st = `start: ${start.toFixed(nodeAccuracy)}`;

                this.renderEngine.renderTooltipFromData(
                    [{ text: header }, { text: dur }, { text: st }],
                    this.interactionsEngine.getGlobalMouse()
                );
            }

            return true;
        }
    }

    checkIfSameRegion(newRegion) {
        console.log(newRegion);
        return this.currentHoveredNode!==newRegion;
    }

    renderNodeStroke() {
        if (this.hoveredRegion && this.hoveredRegion.type === 'node' && this.checkIfSameRegion(this.hoveredRegion)){
            console.log('hi')
            this.currentHoveredNode = this.hoveredRegion;
            const { start:hoveredStart, duration:hoveredDuration, level:hoveredLevel } = this.hoveredRegion.data;
            const { x, y, w } = this.calcRect(hoveredStart, hoveredDuration, hoveredLevel);
            this.renderEngine.renderNodeStrokeFromData({x,y,w,h:this.renderEngine.blockHeight,color:'#373A4A'}
            );
        }
    }

    render() {
        const {
            width,
            blockHeight,
            height,
            minTextWidth
        } = this.renderEngine;
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
            const mouse = this.interactionsEngine.getMouse();

            if (mouse.y >= y && mouse.y <= y + blockHeight) {
                addHitRegion(cluster, x, y, w);
            }

            if (w >= 0.25) {
                this.renderEngine.addRectToRenderQueue(this.getColor(type, color), x, y, w);
            }

            if (w >= minTextWidth && nodes.length === 1) {
                this.renderEngine.addTextToRenderQueue(nodes[0].name, x, y, w);
            }
        }

        const addHitRegion = (cluster, x, y, w) => {
            this.interactionsEngine.addHitRegion('cluster', cluster, x, y, w, blockHeight);
        }

        this.actualClusterizedFlatTree.forEach(processCluster(renderCluster));

        if (this.selectedRegion && this.selectedRegion.type === 'node') {
            const { start, duration, level } = this.selectedRegion.data;
            const { x, y, w } = this.calcRect(start, duration, level);

            this.renderEngine.addStrokeToRenderQueue('black', x, y, w, this.renderEngine.blockHeight);
        }



        clearTimeout(this.renderChartTimeout);

        this.renderChartTimeout = setTimeout(() => {
            this.interactionsEngine.clearHitRegions();
            this.actualClusterizedFlatTree.forEach(processCluster(addHitRegion));
        }, 16);
    }
}
