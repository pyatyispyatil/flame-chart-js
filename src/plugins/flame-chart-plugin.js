import { flatTree } from '../utils.js';
import { clusterizeFlatTree, metaClusterizeFlatTree, reclusterizeClusteredFlatTree } from '../tree-clusters.js';
import Color from 'color';

const DEFAULT_COLOR = Color.hsl(180, 30, 70);

export class FlameChartPlugin {
    constructor({
                    data,
                    colors
                }) {

        this.data = data;
        this.userColors = colors;

        this.setData(this.data);
        this.reset();
    }

    init(renderEngine, interactionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;

        this.interactionsEngine.on('change-position', this.handlePositionChange);

        this.initData();
    }

    handlePositionChange({ deltaY }) {
        const startPositionY = this.positionY;

        if (this.positionY + deltaY >= 0) {
            this.positionY += deltaY;
        } else {
            this.positionY = 0;
        }
    }

    reset() {
        this.colors = {};
        this.lastRandomColor = DEFAULT_COLOR;

        this.positionY = 0;
        this.currentAccuracy = 0;
        this.userColors = {};
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

    renderTooltip() {
        if (this.hoveredRegion) {
            const { data: { start, duration, children, name } } = this.hoveredRegion;

            const selfTime = duration - (children ? children.reduce((acc, { duration }) => acc + duration, 0) : 0);

            const nodeAccuracy = this.currentAccuracy + 2;
            const header = `${name}`;
            const dur = `duration: ${duration.toFixed(nodeAccuracy)} ${this.renderEngine.timeUnits} ${children && children.length ? `(self ${selfTime.toFixed(nodeAccuracy)} ${this.renderEngine.timeUnits})` : ''}`;
            const st = `start: ${start.toFixed(nodeAccuracy)}`;

            this.renderTooltipFromData(header, [dur, st]);
        }
    }

    handleSelect(region) {
        if (region && region.type === 'node') {
            this.handleNodeSelect(region && region.data);
        }
    }

    handleHover(region, mouse) {
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

    handleAccuracyChange(accuracy) {
        this.currentAccuracy = accuracy;
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

    render(hasChanges) {
        const {
            width,
            nodeHeight,
            height,
            selectedRegion,
            minTextWidth
        } = this.renderEngine;
        this.lastUsedColor = null;
        let recalcRegions = false;

        clearTimeout(this.renderTimeout);

        this.reclusterizeClusteredFlatTree();

        if (this.needFullRegionsRecalc) {
            recalcRegions = true;
            this.needFullRegionsRecalc = false;
        }

        const processCluster = (cluster) => {
            const {
                start,
                duration,
                type,
                level,
                nodes,
                color
            } = cluster;
            const { x, y, w } = this.calcRect(start, duration, level);

            if (x + w > 0
                && x < width
                && y + nodeHeight > 0
                && y < height) {

                if ((this.interactionsEngine.mouse.y >= y && this.interactionsEngine.mouse.y <= y + nodeHeight) || recalcRegions) {
                    this.interactionsEngine.addHitRegion('cluster', cluster, x, y, w, nodeHeight);
                }

                if (w >= 0.25) {
                    this.renderEngine.addRectToRenderQueue(this.getColor(type, color), x, y, w);
                }

                if (w >= minTextWidth && nodes.length === 1) {
                    this.renderEngine.addTextToRenderQueue(nodes[0].name, x, y, w);
                }
            }
        };

        this.interactionsEngine.clearHitRegions();

        this.actualClusterizedFlatTree.forEach(processCluster);

        if (selectedRegion && selectedRegion.type === 'node') {
            const { start, duration, level } = selectedRegion.data;
            const { x, y, w } = this.calcRect(start, duration, level);

            this.renderEngine.addStrokeToRenderQueue('green', x, y, w, this.renderEngine.nodeHeight);
        }

        clearTimeout(this.renderChartTimeout);

        if (hasChanges) {
            this.needFullRegionsRecalc = true;
            this.renderChartTimeout = setTimeout(() => this.renderEngine.requestRender(), 16)
        }
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
