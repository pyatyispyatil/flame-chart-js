import Color from 'color';
import EventEmitter from 'events';

const BLOCK_HEIGHT = 20;
const FONT_SIZE = 13;
const ALPHA = 0.7;
const FONT = `${FONT_SIZE}px consolas,"Liberation Mono",courier,monospace`;

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
    ctx = null;
    node = null;

    timelineStart = 0;
    timelineEnd = 0;
    timelineDimension = 0;
    timelineDelta = 0;
    headerHeight = BLOCK_HEIGHT + 2;
    charWidth = 0;
    charHeight = 0;
    positionY = 0;
    positionX = 0;
    zoom = 0;
    mouse = {
        x: 0,
        y: 0
    };
    colors = {};
    lastRandomColor = defaultColor;

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
     * @param {Object.<string, string>} colors - color dictionary, where key is the node type and value is the color in any format
     * @param {Object[]} timestamps - badges for timestamps
     * @param {string} timestamps[].shortName - short name of badge, which used for the main view
     * @param {string} timestamps[].fullName - full name of badge, which used for the tooltip
     * @param {string} timestamps[].color - color of badge in any format
     * @param {string} timestamps[].timestamp - time position of badge
     * */
    constructor({
                    canvas,
                    width = canvas.width,
                    height = canvas.height,
                    data,
                    colors = {},
                    timestamps = [
                        {
                            shortName: 'DCL',
                            fullName: 'DomContentLoaded',
                            timestamp: 2000,
                            color: 'red'
                        },
                        {
                            shortName: 'L',
                            fullName: 'Load',
                            timestamp: 2050,
                            color: 'blue'
                        }
                    ]
                }) {
        super();

        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.data = data;
        this.userColors = colors;
        this.timestamps = timestamps;

        this.init();
    }

    init = () => {
        const { charWidth, charHeight } = this.calcFontSize();

        this.calcMinMax();

        this.blockPadding = BLOCK_HEIGHT - charHeight;
        this.charWidth = charWidth;
        this.charHeight = charHeight;

        if (this.ctx) {
            this.ctx.font = FONT;

            this.initialZoom = this.width / (this.max - this.min);
            this.zoom = this.initialZoom;
            this.positionX = this.min;

            this.initListeners();
            this.render();
        }
    }

    destroy() {
        this.removeListeners();
    }

    initListeners = () => {
        if (this.canvas) {
            this.canvas.addEventListener('wheel', this.handleMouseWheel);
            this.canvas.addEventListener('mousedown', this.handleMouseDown);
            this.canvas.addEventListener('mouseup', this.handleMouseUp);
            this.canvas.addEventListener('mouseleave', this.handleMouseUp);
            this.canvas.addEventListener('click', this.handleMouseClick);
            this.canvas.addEventListener('mousemove', this.handleMouseMove);
        }
    }

    removeListeners = () => {
        if (this.canvas) {
            this.canvas.removeEventListener('wheel', this.handleMouseWheel);
            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
            this.canvas.removeEventListener('mouseup', this.handleMouseUp);
            this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
            this.canvas.removeEventListener('click', this.handleMouseClick);
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        }
    }

    handleMouseWheel = (e) => {
        const { deltaY, deltaX } = e;
        e.preventDefault();

        const realView = this.calcRealView();
        const zoomDelta = (deltaY / 1000) * this.zoom;
        const positionScrollDelta = deltaX / this.zoom;

        if (this.checkMovePossibility(positionScrollDelta)) {
            this.positionX += positionScrollDelta;
        }

        if (this.zoom - zoomDelta >= this.initialZoom) {
            const proportion = this.mouse.x / this.width;
            const timeDelta = realView - (this.width / (this.zoom - zoomDelta));
            const positionDelta = timeDelta * proportion;

            this.zoom -= zoomDelta;

            if (this.checkMovePossibility(positionDelta)) {
                this.positionX += positionDelta;
            } else if (this.positionX + positionDelta + realView >= this.max) {
                this.positionX = this.max - realView;
            }
        }

        this.render();
    }

    handleMouseDown = () => this.moveActive = true;

    handleMouseUp = () => this.moveActive = false;

    handleMouseClick = () => this.handleRegionHit(this.mouse.x, this.mouse.y)

    handleMouseMove = (e) => {
        if (this.moveActive) {
            const mouseDeltaY = this.mouse.y - e.offsetY;
            const mouseDeltaX = (this.mouse.x - e.offsetX) / this.zoom;

            if (this.checkMovePossibility(mouseDeltaX)) {
                this.positionX += mouseDeltaX;
            }

            if (this.positionY + mouseDeltaY > 0) {
                this.positionY += mouseDeltaY;
            }

            this.render();
        }

        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
    }

    checkMovePossibility = (positionDelta) => (
        this.positionX + positionDelta + this.calcRealView() <= this.max && this.positionX + positionDelta >= this.min
    )

    calcRealView = () => {
        return this.width / this.zoom;
    }

    calcTimeline = () => {
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

    calcMinMax = () => {
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

    calcFontSize = () => {
        const div = document.createElement('div');

        div.innerHTML = 'w';
        div.style.font = FONT;
        div.style.display = 'inline-block';
        div.style.visibility = 'hidden';
        div.style.position = 'absolute';

        document.body.appendChild(div);

        const result = {
            charWidth: div.clientWidth,
            charHeight: div.clientHeight,
        };

        document.body.removeChild(div);

        return result;
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

    getColor = (type) => {
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

    calcRect = (start, duration, level) => ({
        x: this.timeToPosition(start),
        y: (level * BLOCK_HEIGHT + level * 1) - this.positionY + this.headerHeight + this.charHeight,
        w: duration * this.zoom
    })

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
                && y + BLOCK_HEIGHT > 0
                && y < this.height) {
                this.addHitRegion(node, x, y, w, BLOCK_HEIGHT)
                this.renderRect(this.getColor(type), name, x, y, w);

                if (this.selectedRegion && node === this.selectedRegion.node) {
                    strokePosition = { x, y, w };
                }
            }
        });

        if (strokePosition) {
            const { x, y, w } = strokePosition;

            this.renderStroke(x, y, w, BLOCK_HEIGHT);
        }
    }

    renderTimestamps() {
        this.timestamps.slice()
            .sort((a, b) => a.timestamp - b.timestamp)
            .reduce((prevEnding, node) => {
                const { timestamp, color, shortName } = node;
                const { width } = ctx.measureText(shortName);
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

    forEachTime = (cb) => {
        for (let i = this.timelineStart; i <= this.timelineEnd; i++) {
            const timePosition = i * this.timelineDelta + this.min;
            const pixelPosition = this.timeToPosition(timePosition.toFixed(this.timelineDimension));

            cb(pixelPosition, timePosition);
        }
    }

    renderLines() {
        this.forEachTime((pixelPosition) => {
            this.ctx.fillStyle = 'rgb(126, 126, 126, 0.5)';
            this.ctx.fillRect(pixelPosition, this.charHeight, 1, this.height - this.charHeight);
        });
    }

    renderTimes() {
        this.ctx.clearRect(0, 0, this.width, this.charHeight);

        this.forEachTime((pixelPosition, timePosition) => {
            this.ctx.fillStyle = 'black';
            this.ctx.fillText(timePosition.toFixed(this.timelineDimension) + 'ms', pixelPosition + this.blockPadding, this.charHeight - 4);

            this.ctx.fillStyle = 'rgb(126,126,126, 0.5)';
            this.ctx.fillRect(pixelPosition, 0, 1, this.charHeight);
        });
    }

    renderStroke(x, y, w, h) {
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = 'green';
        this.ctx.strokeRect(x, y, w, h);
    }

    renderRect = (color, text, x, y, w) => {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, BLOCK_HEIGHT);

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
                    this.ctx.fillText(text, (x < 0 ? 0 : x) + this.blockPadding, y + BLOCK_HEIGHT - this.blockPadding);
                }
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.clearHitRegions();

        this.calcTimeline();

        this.renderLines();
        this.renderTimestamps();
        this.renderChart();
        this.renderTimes();
    }
}

export default FlameChart;
