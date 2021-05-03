import { flatTree } from '../utils.js';
import { clusterizeFlatTree, metaClusterizeFlatTree, reclusterizeClusteredFlatTree } from '../tree-clusters.js';
import Color from 'color';
import { EventEmitter } from 'events';

const DEFAULT_COLOR = Color.hsl(180, 30, 70);

export class FlameChartPlugin extends EventEmitter {
    constructor({
                    data,
                    colors
                }) {
        super();

        this.data = data;
        this.userColors = colors;

        this.setData(this.data);
        this.reset();
    }

    init(renderEngine, interactionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;

        this.interactionsEngine.on('change-position-y', this.handlePositionChange);
        this.interactionsEngine.on('select', this.handleSelect.bind(this));
        this.interactionsEngine.on('hover', this.handleHover.bind(this));

        this.initData();
    }

    handlePositionChange(mouseDeltaY) {
        const startPositionY = this.positionY;

        if (this.positionY + mouseDeltaY >= 0) {
            this.positionY += mouseDeltaY;
        } else {
            this.positionY = 0;
        }

        if (startPositionY !== this.positionY) {
            this.renderEngine.requestRender();
        }
    }

    reset() {
        this.colors = {};
        this.lastRandomColor = DEFAULT_COLOR;

        this.positionY = 0;
        this.userColors = {};
        this.selectedRegion = null;
    }

    getMinMax() {
        const { flatTree } = this;

        let isFirst = true;
        let min = 0;
        let max = 0;

        flatTree.forEach(({ start, end }) => {
            if (isFirst) {
                min = start;
                max = end;
                isFirst = false;
            } else {
                min = min < start ? min : start;
                max = max > end ? max : end;
            }
        });

        return { min, max };
    }

    renderTooltip(mouse) {
        if (this.hoveredRegion) {
            const { data: { start, duration, children, name } } = this.hoveredRegion;
            const timeUnits = this.renderEngine.getTimeUnits();

            const selfTime = duration - (children ? children.reduce((acc, { duration }) => acc + duration, 0) : 0);

            const nodeAccuracy = this.renderEngine.getAccuracy() + 2;
            const header = `${name}`;
            const dur = `duration: ${duration.toFixed(nodeAccuracy)} ${timeUnits} ${children && children.length ? `(self ${selfTime.toFixed(nodeAccuracy)} ${timeUnits})` : ''}`;
            const st = `start: ${start.toFixed(nodeAccuracy)}`;

            this.renderEngine.renderTooltipFromData(header, [dur, st], mouse);
        }
    }

    handleSelect(region) {
        const mouse = this.interactionsEngine.getMouse();
        const selectedRegion = region ? this.findNodeInCluster(region, mouse) : null;

        if (this.selectedRegion !== selectedRegion) {
            this.selectedRegion = selectedRegion;

            this.render();
            this.renderEngine.requestRender();

            this.emit('select', this.selectedRegion && this.selectedRegion.data);
        }
    }

    handleHover(region, mouse) {
        if (region) {
            this.hoveredRegion = this.findNodeInCluster(region);
            this.renderTooltip(mouse);
        } else if (this.hoveredRegion && !region) {
            this.hoveredRegion = null;
            this.renderEngine.requestShallowRender();
        }
    }

    findNodeInCluster(region) {
        const mouse = this.interactionsEngine.getMouse();

        if (region && region.type === 'cluster') {
            const hoveredNode = region.data.nodes.find(({ level, start, duration }) => {
                const { x, y, w } = this.calcRect(start, duration, level);

                return mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + this.renderEngine.nodeHeight;
            });

            if (hoveredNode) {
                return {
                    data: hoveredNode,
                    type: 'node'
                };
            }
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

    setData(data) {
        this.data = data;

        this.flatTree = flatTree(data)
            .sort((a, b) => (a.level - b.level) || a.start - b.start);

        this.reset();
    }

    initData() {
        this.metaClusterizedFlatTree = metaClusterizeFlatTree(this.flatTree);
        this.initialClusterizedFlatTree = clusterizeFlatTree(
            this.metaClusterizedFlatTree,
            this.renderEngine.zoom,
            this.renderEngine.min,
            this.renderEngine.max
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

    render() {
        const {
            width,
            nodeHeight,
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
                && y + nodeHeight > 0
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

            if (mouse.y >= y && mouse.y <= y + nodeHeight) {
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
            this.interactionsEngine.addHitRegion('cluster', cluster, x, y, w, nodeHeight);
        }

        this.interactionsEngine.clearHitRegions();
        this.actualClusterizedFlatTree.forEach(processCluster(renderCluster));

        if (this.selectedRegion && this.selectedRegion.type === 'node') {
            const { start, duration, level } = this.selectedRegion.data;
            const { x, y, w } = this.calcRect(start, duration, level);

            this.renderEngine.addStrokeToRenderQueue('green', x, y, w, this.renderEngine.nodeHeight);
        }

        clearTimeout(this.renderChartTimeout);

        this.renderChartTimeout = setTimeout(() => {
            this.interactionsEngine.clearHitRegions();
            this.actualClusterizedFlatTree.forEach(processCluster(addHitRegion));
        }, 16);
    }

    calcRect(start, duration, level) {
        const w = (duration * this.renderEngine.zoom);

        return {
            x: this.renderEngine.timeToPosition(start),
            y: (level * (this.renderEngine.nodeHeight + 1)) - this.positionY,
            w: w <= 0.1 ? 0.1 : w >= 3 ? w - 1 : w - w / 3
        }
    }
}
