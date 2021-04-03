import Color from 'color';
import EventEmitter from 'events';
import {
    getPixelRatio,
    flatTree
} from './utils.js';
import {
    metaClusterizeFlatTree,
    clusterizeFlatTree,
    reclusterizeClusteredFlatTree
} from './tree-clusters.js';

const ALPHA = 0.7;

const MAX_ACCURACY = 6;
const defaultColor = Color.hsl(180, 30, 70);
const allChars = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890_-+()[]{}\\/|\'\";:.,?~';

const defaultSettings = {
    performance: true,
    font: `12px`,
    nodeHeight: 16,
    timeUnits: 'ms'
}

/** Class representing a replica of Chrome DevTools Performance flame chart. */
export default class FlameChart extends EventEmitter {
    /**
     * Create a instance
     * @param {HTMLCanvasElement} canvas - target element
     * @param {Object[]} data - flame chart data
     * @param {string} data[].name - node name
     * @param {number} data[].start - node start time
     * @param {number} data[].duration - node duration
     * @param {string} [data[].type] - node type (use it for custom colorization)
     * @param {string} [data[].color] - node color (use it for current node colorization)
     * @param {Object[]} data[].children - node children (same structure as for node)
     * @param {Object.<string, string>} [colors] - color dictionary, where key is the node type and value is the color in any format
     * @param {Object[]} [timestamps] - badges for timestamps
     * @param {string} timestamps[].shortName - short name of badge, which used for the main view
     * @param {string} timestamps[].fullName - full name of badge, which used for the tooltip
     * @param {string} timestamps[].color - color of badge in any format
     * @param {string} timestamps[].timestamp - time position of badge
     * @param {Object} [settings] - configuration
     * @param {boolean} [settings.performance] - turn on performance mode
     * @param {string} [settings.font] - font
     * @param {number} [settings.nodeHeight] - node height in px
     * @param {number} [settings.timeUnits='ms'] - time units
     * */
    constructor({
                    canvas,
                    data,
                    colors = {},
                    timestamps = [],
                    settings = {}
                }) {
        super();

        this.timelineStart = 0;
        this.timelineEnd = 0;
        this.timelineAccuracy = 0;
        this.timelineDelta = 0;
        this.charHeight = 0;
        this.positionY = 0;
        this.positionX = 0;
        this.zoom = 0;
        this.mouse = {
            x: 0,
            y: 0
        };

        this.width = canvas.width;
        this.height = canvas.height;

        this.ctx = canvas.getContext('2d', { alpha: false });
        this.canvas = canvas;
        this.userColors = colors;
        this.pixelRatio = getPixelRatio(this.ctx);

        this.setSettings(settings, false);
        this.setTimestamps(timestamps, false);
        this.setData(data, false);

        this.handleMouseWheel = this.handleMouseWheel.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);

        this.resetStorages();
        this.init();
    }

    init() {
        if (this.ctx) {
            this.fixBlurryFont();

            const {
                actualBoundingBoxAscent: fontAscent,
                actualBoundingBoxDescent: fontDescent,
                width: allCharsWidth
            } = this.ctx.measureText(allChars);
            const { width: placeholderWidth } = this.ctx.measureText('…');
            const fontHeight = fontAscent + fontDescent;

            this.blockPadding = Math.ceil((this.nodeHeight - (fontHeight)) / 2);
            this.charHeight = fontHeight + 1;
            this.headerHeight = this.nodeHeight + this.charHeight + this.blockPadding;
            this.placeholderWidth = placeholderWidth;
            this.avgCharWidth = allCharsWidth / allChars.length;
            this.minTextWidth = this.avgCharWidth + this.placeholderWidth;

            this.ctx.font = this.font;

            this.initView();
            this.initListeners();

            this.render(true);
        }
    }

    resetStorages() {
        this.colors = {};
        this.lastRandomColor = defaultColor;

        this.selectedRegion = null;
        this.hoveredRegion = null;
        this.lastAnimationFrame = null;
        this.lastUsedColor = null;
        this.hitRegions = [];
        this.textRenderQueue = [];
        this.rectRenderQueue = {};
    }

    fixBlurryFont() {
        this.canvas.style.backgroundColor = 'white';
        this.canvas.style.overflow = 'hidden';
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.canvas.width = this.width * this.pixelRatio;
        this.canvas.height = this.height * this.pixelRatio;
        this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    }

    destroy() {
        this.removeListeners();
    }

    setData(data = [], update = true) {
        this.data = data;

        this.flatTree = flatTree(data)
            .sort((a, b) => (a.level - b.level) || a.start - b.start);

        this.resetStorages();
        this.calcMinMax();
        this.calcInitialZoom();
        this.resetView();

        if (this.isPerformanceMode) {
            this.metaClusterizedFlatTree = metaClusterizeFlatTree(this.flatTree);
            this.initialClusterizedFlatTree = clusterizeFlatTree(this.metaClusterizedFlatTree, this.zoom, this.min, this.max);

            this.reclusterizeClusteredFlatTree();
        }

        if (update) {
            this.update();
        }
    }

    setTimestamps(timestamps, update = true) {
        this.timestamps = timestamps.map(({ color, ...rest }) => ({
            ...rest,
            color: new Color(color).alpha(ALPHA).rgb().toString()
        }));

        if (update) {
            this.update();
        }
    }

    setSettings(settings, update = true) {
        const fullSettings = {
            ...defaultSettings,
            ...settings
        }

        this.isPerformanceMode = fullSettings.performance;
        this.font = fullSettings.font;
        this.nodeHeight = fullSettings.nodeHeight;
        this.timeUnits = fullSettings.timeUnits;

        if (update) {
            this.update();
        }
    }

    resize(width, height) {
        this.width = width || this.width;
        this.height = height || this.height;

        if (this.isPerformanceMode) {
            this.reclusterizeClusteredFlatTree();
        }

        this.fixBlurryFont();
        this.update();
    }

    update() {
        this.calcMinMax();
        this.calcInitialZoom();
        this.render(true);
    }

    calcInitialZoom() {
        if (this.max - this.min > 0) {
            this.initialZoom = this.width / (this.max - this.min);
        } else {
            this.initialZoom = 1;
        }
    }

    resetView() {
        this.setZoom(this.initialZoom);
        this.positionX = this.min;
    }

    initView() {
        this.calcInitialZoom();
        this.resetView();
    }

    initListeners() {
        if (this.canvas) {
            this.canvas.addEventListener('wheel', this.handleMouseWheel);
            this.canvas.addEventListener('mousedown', this.handleMouseDown);
            this.canvas.addEventListener('mouseup', this.handleMouseUp);
            this.canvas.addEventListener('mouseleave', this.handleMouseUp);
            this.canvas.addEventListener('mousemove', this.handleMouseMove);
        }
    }

    removeListeners() {
        if (this.canvas) {
            this.canvas.removeEventListener('wheel', this.handleMouseWheel);
            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
            this.canvas.removeEventListener('mouseup', this.handleMouseUp);
            this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        }
    }

    handleMouseWheel(e) {
        const { deltaY, deltaX } = e;
        e.preventDefault();

        const realView = this.calcRealView();
        const startPosition = this.positionX;
        const startZoom = this.zoom;
        const positionScrollDelta = deltaX / this.zoom;
        let zoomDelta = (deltaY / 1000) * this.zoom;

        this.tryToChangePosition(positionScrollDelta);

        zoomDelta = this.zoom - zoomDelta >= this.initialZoom ? zoomDelta : this.zoom - this.initialZoom

        if (zoomDelta !== 0) {
            const zoomed = this.setZoom(this.zoom - zoomDelta);

            if (zoomed) {
                const proportion = this.mouse.x / this.width;
                const timeDelta = realView - (this.width / this.zoom);
                const positionDelta = timeDelta * proportion;

                this.tryToChangePosition(positionDelta);
            }
        }

        this.checkRegionHover();

        this.render(startPosition !== this.positionX || startZoom !== this.zoom);
    }

    handleMouseDown() {
        this.moveActive = true;
        this.mouseClickStartPosition = {
            x: this.mouse.x,
            y: this.mouse.y
        };
    }

    handleMouseUp() {
        this.moveActive = false;

        if (this.mouseClickStartPosition && this.mouseClickStartPosition.x === this.mouse.x && this.mouseClickStartPosition.y === this.mouse.y) {
            this.handleRegionHit(this.mouse.x, this.mouse.y);
        }
    }

    handleMouseMove(e) {
        const startPositionX = this.positionX;
        const startPositionY = this.positionY;

        if (this.moveActive) {
            const mouseDeltaY = this.mouse.y - e.offsetY;
            const mouseDeltaX = (this.mouse.x - e.offsetX) / this.zoom;

            this.tryToChangePosition(mouseDeltaX)

            if (this.positionY + mouseDeltaY >= 0) {
                this.positionY += mouseDeltaY;
            } else {
                this.positionY = 0;
            }
        }

        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;

        const prevHoveredRegion = this.hoveredRegion;

        this.checkRegionHover();

        if (this.moveActive || this.hoveredRegion || (prevHoveredRegion && !this.hoveredRegion)) {
            this.render(startPositionX !== this.positionX || startPositionY !== this.positionY);
        }
    }

    setZoom(zoom) {
        if (this.timelineAccuracy < MAX_ACCURACY || zoom <= this.zoom) {
            this.zoom = zoom;

            return true;
        }

        return false;
    }

    tryToChangePosition(positionDelta) {
        const realView = this.calcRealView();

        if (this.positionX + positionDelta + realView <= this.max && this.positionX + positionDelta >= this.min) {
            this.positionX += positionDelta;
        } else if (this.positionX + positionDelta <= this.min) {
            this.positionX = this.min;
        } else if (this.positionX + positionDelta + realView >= this.max) {
            this.positionX = this.max - realView;
        }
    }

    reclusterizeClusteredFlatTree() {
        this.actualClusterizedFlatTree = reclusterizeClusteredFlatTree(
            this.initialClusterizedFlatTree,
            this.zoom,
            this.positionX,
            this.positionX + this.calcRealView()
        );
    }

    calcRealView() {
        return this.width / this.zoom;
    }

    calcTimeline() {
        const timeWidth = this.max - this.min;
        const minPixelDelta = 90;
        const initialLinesCount = this.width / minPixelDelta;
        const initialTimeLineDelta = timeWidth / initialLinesCount;

        const realView = this.calcRealView();
        const proportion = realView / (timeWidth || 1);

        this.timelineDelta = initialTimeLineDelta / Math.pow(2, Math.floor(Math.log2(1 / proportion)));
        this.timelineStart = Math.floor((this.positionX - this.min) / this.timelineDelta);
        this.timelineEnd = Math.ceil(realView / this.timelineDelta) + this.timelineStart;

        this.timelineAccuracy = this.calcNumberFix();
    }

    calcNumberFix() {
        const strTimelineDelta = (this.timelineDelta / 2).toString();

        if (strTimelineDelta.includes('e')) {
            return strTimelineDelta.match(/\d+$/)[0];
        } else {
            const zeros = strTimelineDelta.match(/(0\.0*)/);

            return zeros ? zeros[0].length - 1 : 0;
        }
    }

    calcMinMax() {
        const { flatTree, timestamps } = this;

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

        this.min = timestamps.reduce((acc, { timestamp }) => timestamp < acc ? timestamp : acc, min);
        this.max = timestamps.reduce((acc, { timestamp }) => timestamp > acc ? timestamp : acc, max);
    }

    clearHitRegions() {
        this.hitRegions = [];
    }

    addHitRegion(type, data, x, y, w, h) {
        this.hitRegions.push({
            type, data, x, y, w, h
        })
    }

    handleRegionHit(mouseX, mouseY) {
        this.selectedRegion = this.getHoveredRegion(mouseX, mouseY);

        this.render();

        if (this.selectedRegion && this.selectedRegion.type === 'node') {
            this.handleNodeSelect(this.selectedRegion && this.selectedRegion.data);
        }
    }

    handleNodeSelect(node) {
        this.emit('select', node);
    }

    checkRegionHover() {
        this.hoveredRegion = this.getHoveredRegion(this.mouse.x, this.mouse.y);
    }

    getHoveredRegion(mouseX, mouseY) {
        const hoveredRegion = this.hitRegions.find(({ x, y, w, h }) => (
            mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h
        ));

        if (hoveredRegion && hoveredRegion.type === 'cluster') {
            const hoveredNode = hoveredRegion.data.nodes.find(({ level, start, duration }) => {
                const { x, y, w } = this.calcRect(start, duration, level);

                return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + this.nodeHeight;
            });

            if (hoveredNode) {
                return {
                    data: hoveredNode,
                    type: 'node'
                };
            }
        }

        return hoveredRegion;
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

    calcRect(start, duration, level) {
        const w = (duration * this.zoom);

        return {
            x: this.timeToPosition(start),
            y: (level * (this.nodeHeight + 1)) + this.headerHeight - this.positionY,
            w: w <= 0.1 ? 0.1 : w >= 3 ? w - 1 : w - w / 3
        }
    }

    timeToPosition(time) {
        return time * this.zoom - this.positionX * this.zoom
    }

    renderPerformanceChart(hasChanges, recalcRegions) {
        const {
            width,
            nodeHeight,
            height,
            selectedRegion,
            minTextWidth
        } = this;

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

                if ((hasChanges && this.mouse.y >= y && this.mouse.y <= y + nodeHeight) || recalcRegions) {
                    this.addHitRegion('cluster', cluster, x, y, w, nodeHeight);
                }

                if (w >= 0.25) {
                    this.addRectToRenderQueue(this.getColor(type, color), x, y, w);
                }

                if (w >= minTextWidth && nodes.length === 1) {
                    this.addTextToRenderQueue(nodes[0].name, x, y, w);
                }
            }
        };

        if (hasChanges) {
            this.clearHitRegions();
        }

        this.actualClusterizedFlatTree.forEach(processCluster);

        this.resolveRectRenderQueue();
        this.resolveTextRenderQueue();

        if (selectedRegion && selectedRegion.type === 'node') {
            const { start, duration, level } = selectedRegion.data;
            const { x, y, w } = this.calcRect(start, duration, level);

            this.renderStroke(x, y, w, this.nodeHeight);
        }
    }

    renderDetailedChart(hasChanges) {
        let strokePosition;
        const {
            width,
            nodeHeight,
            height,
            selectedRegion,
            minTextWidth
        } = this;

        const processNodes = (node) => {
            const { start, duration, name, type, color, level } = node;
            const { x, y, w } = this.calcRect(start, duration, level);

            if (x + w > 0
                && x < width
                && y + nodeHeight > 0
                && y < height) {

                if (hasChanges) {
                    this.addHitRegion('node', node, x, y, w, nodeHeight);
                }

                if (selectedRegion && node === selectedRegion.data) {
                    strokePosition = { x, y, w };
                }

                if (w > 0.05) {
                    this.addRectToRenderQueue(this.getColor(type, color), x, y, w);
                }

                if (w >= minTextWidth) {
                    this.addTextToRenderQueue(name, x, y, w);
                }
            }
        };

        if (hasChanges) {
            this.clearHitRegions();
        }

        this.flatTree.forEach(processNodes);

        this.resolveRectRenderQueue();
        this.resolveTextRenderQueue();

        if (strokePosition) {
            const { x, y, w } = strokePosition;

            this.renderStroke(x, y, w, this.nodeHeight);
        }
    }

    renderTimestamps() {
        this.clear(this.width, this.charHeight);
        const timesHeight = this.charHeight + 4;

        this.timestamps.slice()
            .sort((a, b) => a.timestamp - b.timestamp)
            .reduce((prevEnding, node) => {
                const { timestamp, color, shortName } = node;
                const { width } = this.ctx.measureText(shortName);
                const fullWidth = width + this.blockPadding * 2;
                const position = this.timeToPosition(timestamp);
                const blockPosition = this.calcTimestampBlockPosition(position, prevEnding, width);

                this.ctx.strokeStyle = color;
                this.ctx.beginPath();
                this.ctx.setLineDash([8, 7]);
                this.ctx.moveTo(position, 0);
                this.ctx.lineTo(position, this.height);
                this.ctx.stroke();

                this.setCtxColor(color);
                this.ctx.fillRect(blockPosition, timesHeight, fullWidth, this.charHeight + this.blockPadding);

                this.setCtxColor('black');
                this.ctx.fillText(shortName, blockPosition + this.blockPadding, timesHeight + this.charHeight);

                this.addHitRegion('timestamp', node, blockPosition, timesHeight, fullWidth, this.charHeight + this.blockPadding);

                return blockPosition + fullWidth;
            }, 0)
    }

    calcTimestampBlockPosition(position, prevEnding) {
        if (position > 0) {
            if (prevEnding > position) {
                return prevEnding;
            } else {
                return position;
            }
        } else {
            return position;
        }
    }

    forEachTime(cb) {
        for (let i = this.timelineStart; i <= this.timelineEnd; i++) {
            const timePosition = i * this.timelineDelta + this.min;
            const pixelPosition = this.timeToPosition(timePosition.toFixed(this.timelineAccuracy));

            cb(pixelPosition, timePosition);
        }
    }

    renderLines(start, height) {
        this.setCtxColor('rgb(126, 126, 126, 0.5)');

        this.forEachTime((pixelPosition) => {
            this.ctx.fillRect(pixelPosition, start, 1, height);
        });
    }

    renderTimes() {
        this.clear(this.width, this.charHeight);

        this.setCtxColor('black');

        this.forEachTime((pixelPosition, timePosition) => {
            this.ctx.fillText(
                timePosition.toFixed(this.timelineAccuracy) + this.timeUnits,
                pixelPosition + this.blockPadding,
                this.charHeight
            );
        });

        this.setCtxColor('rgb(126, 126, 126, 0.5)');

        this.forEachTime((pixelPosition) => {
            this.ctx.fillRect(pixelPosition, 0, 1, this.charHeight);
        });
    }

    renderStroke(x, y, w, h) {
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = 'green';
        this.ctx.strokeRect(x, y, w, h);
    }

    addRectToRenderQueue(color, x, y, w) {
        if (!this.rectRenderQueue[color]) {
            this.rectRenderQueue[color] = [];
        }

        this.rectRenderQueue[color].push({ x, y, w });
    }

    resolveRectRenderQueue() {
        Object.entries(this.rectRenderQueue).forEach(([color, items]) => {
            this.setCtxColor(color);

            items.forEach(({ x, y, w }) => this.renderRect(color, x, y, w));
        });

        this.rectRenderQueue = {};
    }

    renderRect(color, x, y, w) {
        this.ctx.fillRect(x, y, w, this.nodeHeight);
    }

    setCtxColor(color) {
        if (color && this.lastUsedColor !== color) {
            this.ctx.fillStyle = color;
            this.lastUsedColor = color;
        }
    }

    addTextToRenderQueue(text, x, y, w) {
        if (text) {
            const textMaxWidth = w - (this.blockPadding * 2 - (x < 0 ? x : 0));

            if (textMaxWidth > 0) {
                this.textRenderQueue.push({ text, x, y, w, textMaxWidth });
            }
        }
    }

    resolveTextRenderQueue() {
        this.setCtxColor('black');

        this.textRenderQueue.forEach(({ text, x, y, w, textMaxWidth }) => {
            const { width: textWidth } = this.ctx.measureText(text);

            if (textWidth > textMaxWidth) {
                const avgCharWidth = textWidth / (text.length);
                const maxChars = Math.floor((textMaxWidth - this.placeholderWidth) / avgCharWidth);
                const halfChars = (maxChars - 1) / 2;

                if (halfChars > 0) {
                    text = text.slice(0, Math.ceil(halfChars)) + '…' + text.slice(text.length - Math.floor(halfChars), text.length);
                } else {
                    text = '';
                }
            }

            if (text) {
                this.ctx.fillText(text, (x < 0 ? 0 : x) + this.blockPadding, y + this.nodeHeight - this.blockPadding);
            }
        });

        this.textRenderQueue = [];
    }

    renderTooltip() {
        if (this.hoveredRegion) {
            switch (this.hoveredRegion.type) {
                case 'node':
                    this.renderNodeTooltip();
                    break;
                case 'timestamp':
                    this.renderTimestampTooltip();
                    break;
            }
        }
    }

    renderTimestampTooltip() {
        if (this.hoveredRegion) {
            const { data: { fullName, timestamp } } = this.hoveredRegion;

            const timestampsAccuracy = this.timelineAccuracy + 2;
            const header = `${fullName}`;
            const time = `${timestamp.toFixed(timestampsAccuracy)} ${this.timeUnits}`;

            this.renderTooltipFromData(header, [time]);
        }
    }

    renderNodeTooltip() {
        if (this.hoveredRegion) {
            const { data: { start, duration, children, name } } = this.hoveredRegion;

            const selfTime = duration - (children ? children.reduce((acc, { duration }) => acc + duration, 0) : 0);

            const nodeAccuracy = this.timelineAccuracy + 2;
            const header = `${name}`;
            const dur = `duration: ${duration.toFixed(nodeAccuracy)} ${this.timeUnits} ${children && children.length ? `(self ${selfTime.toFixed(nodeAccuracy)} ${this.timeUnits})` : ''}`;
            const st = `start: ${start.toFixed(nodeAccuracy)}`;

            this.renderTooltipFromData(header, [dur, st]);
        }
    }

    renderTooltipFromData(header, body) {
        const mouseX = this.mouse.x + 10;
        const mouseY = this.mouse.y + 10;

        const maxWidth = [header, ...body]
            .map((text) => this.ctx.measureText(text))
            .reduce((acc, { width }) => Math.max(acc, width), 0);
        const fullWidth = maxWidth + this.blockPadding * 2;

        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = 5;


        this.setCtxColor('white');
        this.ctx.fillRect(
            mouseX,
            mouseY,
            fullWidth + this.blockPadding * 2,
            (this.charHeight + 2) * (body.length + 1) + this.blockPadding * 2
        );

        this.ctx.shadowColor = null;
        this.ctx.shadowBlur = null;

        this.setCtxColor('black');
        this.ctx.fillText(
            header,
            mouseX + this.blockPadding,
            mouseY + this.nodeHeight - this.blockPadding
        );

        this.setCtxColor('#688f45');
        body.forEach((text, index) => {
            const count = index + 1;

            this.ctx.fillText(
                text,
                mouseX + this.blockPadding,
                mouseY + this.nodeHeight - this.blockPadding + (this.charHeight + 2) * count
            );
        })
    }

    clear(w, h, x = 0, y = 0) {
        this.ctx.clearRect(x, y, w, h - 1);
        this.setCtxColor('white');
        this.ctx.fillRect(x, y, w, h);
    }

    render(hasChanges, recalcRegions) {
        cancelAnimationFrame(this.lastAnimationFrame);
        clearTimeout(this.renderChartTimeout);

        if (hasChanges) {
            this.needFullRegionsRecalc = true;
        }

        this.lastAnimationFrame = requestAnimationFrame(() => {
            if (recalcRegions) {
                this.needFullRegionsRecalc = false;
            }

            if (hasChanges) {
                if (this.isPerformanceMode) {
                    this.reclusterizeClusteredFlatTree();
                }
            }

            this.lastUsedColor = null;

            this.clear(this.width, this.height);

            this.calcTimeline();

            this.renderLines(0, this.height);

            if (this.isPerformanceMode) {
                this.renderPerformanceChart(hasChanges, recalcRegions);
            } else {
                this.renderDetailedChart(hasChanges);
            }

            this.clear(this.width, this.headerHeight);
            this.renderLines(0, this.headerHeight);

            this.renderTimestamps();
            this.renderTimes();

            this.renderTooltip();

            if (this.needFullRegionsRecalc) {
                this.renderChartTimeout = setTimeout(() => this.render(false, true), 16)
            }
        });
    }
}
