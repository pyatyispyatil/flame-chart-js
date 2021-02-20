import Color from 'color';
import EventEmitter from 'events';

const DEFAULT_NODE_HEIGHT = 15;
const ALPHA = 0.7;
const DEFAULT_FONT = `12px consolas,"Liberation Mono",courier,monospace`;

const defaultColor = Color.hsl(180, 30, 70);

const walk = (treeList, cb, level = 0) => {
    treeList.forEach((child) => {
        cb(child, level);

        if (child.children) {
            walk(child.children, cb, level + 1);
        }
    });
}

/** Class representing a replica of Chrome DevTools Performance flame chart. */
class FlameChart extends EventEmitter {
    /**
     * Create a instance
     * @param {HTMLCanvasElement} canvas - target element
     * @param {number} [width=canvas.width] - canvas width
     * @param {number} [height=canvas.height] - canvas height
     * @param {Object[]} data - flame chart data
     * @param {string} data[].name - node name
     * @param {number} data[].start - node start time
     * @param {number} data[].duration - node duration
     * @param {string} data[].type - node type (use it for custom colorize)
     * @param {Object[]} data[].children - node children (same structure as for node)
     * @param {Object.<string, string>} [colors] - color dictionary, where key is the node type and value is the color in any format
     * @param {Object[]} [timestamps] - badges for timestamps
     * @param {string} timestamps[].shortName - short name of badge, which used for the main view
     * @param {string} timestamps[].fullName - full name of badge, which used for the tooltip
     * @param {string} timestamps[].color - color of badge in any format
     * @param {string} timestamps[].timestamp - time position of badge
     * @param {string} [font=DEFAULT_FONT] - font
     * @param {number} [nodeHeight=DEFAULT_NODE_HEIGHT] - node height in px
     * */
    constructor({
                    canvas,
                    width = canvas.width,
                    height = canvas.height,
                    data,
                    colors = {},
                    timestamps = [],
                    font = DEFAULT_FONT,
                    nodeHeight = DEFAULT_NODE_HEIGHT
                }) {
        super();

        this.timelineStart = 0;
        this.timelineEnd = 0;
        this.timelineDimension = 0;
        this.timelineDelta = 0;
        this.charWidth = 0;
        this.charHeight = 0;
        this.positionY = 0;
        this.positionX = 0;
        this.zoom = 0;
        this.mouse = {
            x: 0,
            y: 0
        };
        this.colors = {};
        this.lastRandomColor = defaultColor;

        this.font = font;
        this.nodeHeight = nodeHeight;
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.userColors = colors;

        this.setTimestamps(timestamps, false);
        this.setData(data, false);

        this.handleMouseWheel = this.handleMouseWheel.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);

        this.init();
    }

    init() {
        if (this.ctx) {
            const metrics = this.ctx.measureText('w');
            const fontHeight = metrics.fontBoundingBoxAscent;

            this.blockPadding = Math.ceil((this.nodeHeight - (fontHeight + metrics.fontBoundingBoxDescent)) / 2 + metrics.fontBoundingBoxDescent);
            this.charWidth = metrics.width;
            this.charHeight = fontHeight + metrics.fontBoundingBoxDescent;
            this.headerHeight = this.nodeHeight + this.charHeight + this.blockPadding;

            this.ctx.font = this.font;

            this.initView();
            this.initListeners();

            this.render();
        }
    }

    destroy() {
        this.removeListeners();
    }

    setData(data, update = true) {
        this.data = data;

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

    update() {
        this.calcView();
        this.render();
    }

    calcView() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.calcMinMax();

        this.initialZoom = this.width / (this.max - this.min);
    }

    resetView() {
        this.zoom = this.initialZoom;
        this.positionX = this.min;
    }

    initView() {
        this.calcView();
        this.resetView();
    }

    initListeners() {
        if (this.canvas) {
            this.canvas.addEventListener('wheel', this.handleMouseWheel);
            this.canvas.addEventListener('mousedown', this.handleMouseDown);
            this.canvas.addEventListener('mouseup', this.handleMouseUp);
            this.canvas.addEventListener('mouseleave', this.handleMouseUp);
            this.canvas.addEventListener('click', this.handleMouseClick);
            this.canvas.addEventListener('mousemove', this.handleMouseMove);
        }
    }

    removeListeners() {
        if (this.canvas) {
            this.canvas.removeEventListener('wheel', this.handleMouseWheel);
            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
            this.canvas.removeEventListener('mouseup', this.handleMouseUp);
            this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
            this.canvas.removeEventListener('click', this.handleMouseClick);
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        }
    }

    handleMouseWheel(e) {
        const { deltaY, deltaX } = e;
        e.preventDefault();

        const realView = this.calcRealView();
        const positionScrollDelta = deltaX / this.zoom;
        let zoomDelta = (deltaY / 1000) * this.zoom;

        this.tryToChangePosition(positionScrollDelta);

        zoomDelta = this.zoom - zoomDelta >= this.initialZoom ? zoomDelta : this.zoom - this.initialZoom

        if (zoomDelta !== 0) {
            const proportion = this.mouse.x / this.width;
            const timeDelta = realView - (this.width / (this.zoom - zoomDelta));
            const positionDelta = timeDelta * proportion;

            this.zoom -= zoomDelta;

            this.tryToChangePosition(positionDelta);

            this.render();
        }
    }

    handleMouseDown() {
        this.moveActive = true;
    }

    handleMouseUp() {
        this.moveActive = false;
    }

    handleMouseClick() {
        this.handleRegionHit(this.mouse.x, this.mouse.y)
    }

    handleMouseMove(e) {
        if (this.moveActive) {
            const mouseDeltaY = this.mouse.y - e.offsetY;
            const mouseDeltaX = (this.mouse.x - e.offsetX) / this.zoom;

            this.tryToChangePosition(mouseDeltaX)

            if (this.positionY + mouseDeltaY >= 0) {
                this.positionY += mouseDeltaY;
            } else {
                this.positionY = 0;
            }

            this.render();
        }

        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
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

    calcRealView() {
        return this.width / this.zoom;
    }

    calcTimeline() {
        const timeWidth = this.max - this.min;
        const minPixelDelta = 90;
        const initialLinesCount = this.width / minPixelDelta;
        const initialTimeLineDelta = timeWidth / initialLinesCount;

        const realView = this.calcRealView();
        const proportion = realView / timeWidth;

        this.timelineDelta = initialTimeLineDelta / Math.pow(2, Math.floor(Math.log2(1 / proportion)));
        this.timelineStart = Math.floor((this.positionX - this.min) / this.timelineDelta);
        this.timelineEnd = Math.ceil(realView / this.timelineDelta) + this.timelineStart;

        const numberFix = 3 - Math.ceil(this.timelineDelta * 10).toString().length;
        this.timelineDimension = numberFix > 0 ? numberFix : 0;
    }

    calcMinMax() {
        const { data, timestamps } = this;

        let isFirst = true;
        let min = 0;
        let max = 0;

        walk(data, ({ start, duration }) => {
            if (isFirst) {
                min = start;
                max = start + duration;
                isFirst = false;
            } else {
                min = min < start ? min : start;
                max = max > start + duration ? max : start + duration;
            }
        });

        this.min = timestamps.reduce((acc, { timestamp }) => timestamp < acc ? timestamp : acc, min);
        this.max = timestamps.reduce((acc, { timestamp }) => timestamp > acc ? timestamp : acc, max);
    }

    clearHitRegions() {
        this.hitRegions = [];
    }

    addHitRegion(node, x, y, w, h) {
        this.hitRegions.push({
            node, x, y, w, h
        })
    }

    handleRegionHit(mouseX, mouseY) {
        this.selectedRegion = this.hitRegions.find(({ x, y, w, h }) => (
            mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h
        ));

        this.render();

        this.handleNodeSelect(this.selectedRegion && this.selectedRegion.node);
    }

    handleNodeSelect(node) {
        console.log(node);

        this.emit('select', node);
    }

    getColor(category, type) {
        if (this.colors[type]) {
            return this.colors[type];
        } else if (this.userColors[type]) {
            const color = new Color(this.userColors[type]);

            this.colors[type] = color.alpha(ALPHA).rgb().toString();

            return this.colors[type];
        } else {
            this.lastRandomColor = defaultColor.rotate(10);
            this.colors[type] = this.lastRandomColor.alpha(ALPHA).rgb().toString();

            return this.colors[type];
        }
    }

    calcRect(start, duration, level) {
        return {
            x: this.timeToPosition(start),
            y: (level * this.nodeHeight + level * 1) - this.positionY + this.headerHeight,
            w: duration * this.zoom
        }
    }

    timeToPosition(time) {
        return time * this.zoom - this.positionX * this.zoom
    }

    renderChart() {
        let strokePosition;

        walk(this.data, (node, level) => {
            const { start, duration, name, type } = node;
            const { x, y, w } = this.calcRect(start, duration, level);

            if (x + w > 0
                && x < this.width
                && y + this.nodeHeight > 0
                && y < this.height) {
                this.addHitRegion(node, x, y, w, this.nodeHeight)
                this.renderRect(this.getColor(type), name, x, y, w);

                if (this.selectedRegion && node === this.selectedRegion.node) {
                    strokePosition = { x, y, w };
                }
            }
        });

        if (strokePosition) {
            const { x, y, w } = strokePosition;

            this.renderStroke(x, y, w, this.nodeHeight);
        }
    }

    renderTimestamps() {
        this.ctx.clearRect(0, 0, this.width, this.charHeight);

        this.timestamps.slice()
            .sort((a, b) => a.timestamp - b.timestamp)
            .reduce((prevEnding, node) => {
                const { timestamp, color, shortName } = node;
                const { width } = this.ctx.measureText(shortName);
                const fullWidth = width + this.blockPadding * 2;
                const position = this.timeToPosition(timestamp);
                const blockPosition = position > 0 ? prevEnding > position ? prevEnding : position : position;

                this.ctx.strokeStyle = color;
                this.ctx.beginPath();
                this.ctx.setLineDash([8, 7]);
                this.ctx.moveTo(position, 0);
                this.ctx.lineTo(position, this.height);
                this.ctx.stroke();

                this.ctx.fillStyle = color;
                this.ctx.fillRect(blockPosition, this.charHeight, fullWidth, this.charHeight + this.blockPadding);

                this.ctx.fillStyle = 'black';
                this.ctx.fillText(shortName, blockPosition + this.blockPadding, this.charHeight * 2);

                return blockPosition + fullWidth;
            }, 0)
    }

    forEachTime(cb) {
        for (let i = this.timelineStart; i <= this.timelineEnd; i++) {
            const timePosition = i * this.timelineDelta + this.min;
            const pixelPosition = this.timeToPosition(timePosition.toFixed(this.timelineDimension));

            cb(pixelPosition, timePosition);
        }
    }

    renderLines(start, height) {
        this.ctx.fillStyle = 'rgb(126, 126, 126, 0.5)';

        this.forEachTime((pixelPosition) => {
            this.ctx.fillRect(pixelPosition, start, 1, height);
        });
    }

    renderTimes() {
        this.ctx.clearRect(0, 0, this.width, this.charHeight);

        this.ctx.fillStyle = 'black';

        this.forEachTime((pixelPosition, timePosition) => {
            this.ctx.fillText(timePosition.toFixed(this.timelineDimension) + 'ms', pixelPosition + this.blockPadding, this.charHeight - 4);
        });

        this.ctx.fillStyle = 'rgb(126,126,126, 0.5)';

        this.forEachTime((pixelPosition) => {
            this.ctx.fillRect(pixelPosition, 0, 1, this.charHeight);
        });
    }

    renderStroke(x, y, w, h) {
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = 'green';
        this.ctx.strokeRect(x, y, w, h);
    }

    renderRect(color, text, x, y, w) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, this.nodeHeight);

        if (text) {
            const textMaxWidth = w - (this.blockPadding * 2 - (x < 0 ? x : 0));

            if (textMaxWidth > 0) {
                if (text.length * this.charWidth > textMaxWidth) {
                    const maxChars = Math.floor(textMaxWidth / this.charWidth);
                    const halfChars = (maxChars - 1) / 2;

                    if (halfChars > 0) {
                        text = text.slice(0, Math.ceil(halfChars)) + '…' + text.slice(text.length - Math.floor(halfChars), text.length);
                    } else {
                        text = '';
                    }
                }

                if (text) {
                    this.ctx.fillStyle = 'black';
                    this.ctx.fillText(text, (x < 0 ? 0 : x) + this.blockPadding, y + this.nodeHeight - this.blockPadding);
                }
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.clearHitRegions();

        this.calcTimeline();

        this.renderLines(0, this.height);
        this.renderChart();

        this.ctx.clearRect(0, 0, this.width, this.headerHeight);
        this.renderLines(0, this.headerHeight);

        this.renderTimestamps();
        this.renderTimes();
    }
}

export default FlameChart;
