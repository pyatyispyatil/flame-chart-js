import { EventEmitter } from 'events';
import { TimeIndicators } from './time-indicators.js';

const allChars = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890_-+()[]{}\\/|\'\";:.,?~';
const MAX_ACCURACY = 6;

const getPixelRatio = (ctx) => {
    const dpr = window.devicePixelRatio || 1;
    const bsr = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
}

class BasicRenderEngine extends EventEmitter {
    constructor(canvas, settings) {
        super();

        this.width = canvas.width;
        this.height = canvas.height;

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.pixelRatio = getPixelRatio(this.ctx);

        this.settings = settings;
        this.nodeHeight = settings.nodeHeight;
        this.font = settings.font;
        this.timeUnits = settings.timeUnits;

        const {
            actualBoundingBoxAscent: fontAscent,
            actualBoundingBoxDescent: fontDescent,
            width: allCharsWidth
        } = this.ctx.measureText(allChars);
        const { width: placeholderWidth } = this.ctx.measureText('…');
        const fontHeight = fontAscent + fontDescent;

        this.blockPadding = Math.ceil((this.nodeHeight - (fontHeight)) / 2);
        this.charHeight = fontHeight + 1;
        this.placeholderWidth = placeholderWidth;
        this.avgCharWidth = allCharsWidth / allChars.length;
        this.minTextWidth = this.avgCharWidth + this.placeholderWidth;

        this.ctx.font = this.font;

        this.reset();
    }

    reset() {
        this.textRenderQueue = [];
        this.strokeRenderQueue = [];
        this.rectRenderQueue = {};
        this.lastAnimationFrame = null;
        this.lastUsedColor = null;
    }

    setCtxColor(color) {
        if (color && this.lastUsedColor !== color) {
            this.ctx.fillStyle = color;
            this.lastUsedColor = color;
        }
    }

    fillRect(x, y, w, h) {
        this.ctx.fillRect(x, y, w, h);
    }

    fillText(text, x, y,) {
        this.ctx.fillText(text, x, y);
    }

    renderBlock(color, x, y, w) {
        this.setCtxColor(color);
        this.ctx.fillRect(x, y, w, this.nodeHeight);
    }

    renderStroke(color, x, y, w, h) {
        this.setCtxColor(color);

        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = color;
        this.ctx.strokeRect(x, y, w, h);
    }

    clear(w = this.width, h = this.height, x = 0, y = 0) {
        this.ctx.clearRect(x, y, w, h - 1);
        this.setCtxColor('white');
        this.ctx.fillRect(x, y, w, h);
    }

    timeToPosition(time) {
        return time * this.zoom - this.positionX * this.zoom
    }

    pixelToTime(width) {
        return width / this.zoom;
    }

    setZoom(zoom) {
        if (0 < MAX_ACCURACY || zoom <= this.zoom) { //ToDo threshold
            this.zoom = zoom;

            this.emit('change-zoom', this.zoom);

            return true;
        }

        return false;
    }

    setPositionX(x) {
        this.positionX = x;

        this.emit('change-position', this.positionX);
    }

    addRectToRenderQueue(color, x, y, w) {
        if (!this.rectRenderQueue[color]) {
            this.rectRenderQueue[color] = [];
        }

        this.rectRenderQueue[color].push({ x, y, w });
    }

    addTextToRenderQueue(text, x, y, w) {
        if (text) {
            const textMaxWidth = w - (this.blockPadding * 2 - (x < 0 ? x : 0));

            if (textMaxWidth > 0) {
                this.textRenderQueue.push({ text, x, y, w, textMaxWidth });
            }
        }
    }

    addStrokeToRenderQueue(color, x, y, w, h) {
        this.strokeRenderQueue.push({ color, x, y, w, h });
    }

    resolveRectRenderQueue() {
        Object.entries(this.rectRenderQueue).forEach(([color, items]) => {
            this.setCtxColor(color);

            items.forEach(({ x, y, w }) => this.renderBlock(color, x, y, w));
        });

        this.rectRenderQueue = {};
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

    resolveStrokeRenderQueue() {
        this.strokeRenderQueue.forEach(({ color, x, y, w, h }) => {
            this.renderStroke(color, x, y, w, h);
        });

        this.strokeRenderQueue = [];
    }

    setMinMax(min, max) {
        this.min = min;
        this.max = max;
    }

    getTimeUnits() {
        return this.timeUnits;
    }

    tryToChangePosition(positionDelta) {
        const realView = this.getRealView();

        if (this.positionX + positionDelta + realView <= this.max && this.positionX + positionDelta >= this.min) {
            this.setPositionX(this.positionX + positionDelta);
        } else if (this.positionX + positionDelta <= this.min) {
            this.setPositionX(this.min);
        } else if (this.positionX + positionDelta + realView >= this.max) {
            this.setPositionX(this.max - realView);
        }
    }

    getInitialZoom() {
        if (this.max - this.min > 0) {
            return this.width / (this.max - this.min);
        } else {
            return 1;
        }
    }

    getRealView() {
        return this.width / this.zoom;
    }

    initView() {
        this.resetView();
    }

    resetView() {
        this.setZoom(this.getInitialZoom());
        this.setPositionX(this.min);
    }

    resize(width, height) {
        this.width = width || this.width;
        this.height = height || this.height;

        this.emit('resize', { width: this.width, height: this.height });

        this.fixBlurryFont();
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

    renderTooltipFromData(header, body, mouse) {
        const mouseX = mouse.x + 10;
        const mouseY = mouse.y + 10;

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
}

export class RenderEngine extends BasicRenderEngine {
    constructor(canvas, settings, plugins) {
        super(canvas, settings);

        this.plugins = plugins;

        this.childEngines = [];
        this.requestedRenders = [];

        this.timeIndicators = new TimeIndicators(this);
    }

    makeInstance() {
        const offscreenRenderEngine = new OffscreenRenderEngine({
            width: this.width,
            height: 0,
            id: this.childEngines.length,
            parent: this
        });

        offscreenRenderEngine.setMinMax(this.min, this.max);
        offscreenRenderEngine.initView();

        this.childEngines.push(offscreenRenderEngine);

        return offscreenRenderEngine;
    }

    resize(width, height) {
        const currentWidth = this.width;

        super.resize(width, height);
        this.recalcChildrenSizes();

        if (this.getInitialZoom() > this.zoom) {
            this.resetView();
        } else if (this.positionX > this.min) {
            this.tryToChangePosition(-this.pixelToTime((width - currentWidth) / 2));
        }
    }

    recalcChildrenSizes() {
        const childrenSizes = this.getChildrenSizes();

        this.childEngines.forEach((engine, index) => {
            engine.resize(childrenSizes[index]);
        });
    }

    getChildrenSizes() {
        const heights = this.childEngines.map((engine, index) => this.plugins[index].height);
        const heightlessCount = heights.filter((height) => !height).length;
        const freeHeight = heights.reduce((acc, height) => acc - (height || 0), this.height);
        const freeHeightPart = freeHeight / heightlessCount;
        const preparedHeights = heights.map((height) => Math.ceil(height || freeHeightPart));

        const heightPositions = preparedHeights.reduce((acc, height) => ({
            position: acc.position + height,
            result: acc.result.concat(acc.position)
        }), { position: 0, result: [] }).result;

        return preparedHeights.map((height, index) => ({
            width: this.width,
            height,
            position: heightPositions[index]
        }));
    }

    getAccuracy() {
        return this.timeIndicators.accuracy;
    }

    setZoom(zoom) {
        const res = super.setZoom(zoom);
        this.childEngines.forEach((engine) => engine.setZoom(zoom));

        return res;
    }

    setPositionX(x) {
        const res = super.setPositionX(x);
        this.childEngines.forEach((engine) => engine.setPositionX(x));

        return res;
    }

    setMinMax(min, max) {
        const res = super.setMinMax(min, max);

        this.timeIndicators.setMinMax(min, max);
        this.childEngines.forEach((engine) => engine.setMinMax(min, max));

        return res;
    }

    partialRender(id) {
        if (typeof id === 'number') {
            this.requestedRenders.push(id);
        }

        if (!this.lastPartialAnimationFrame) {
            this.lastPartialAnimationFrame = requestAnimationFrame(() => {
                this.requestedRenders.forEach((index) => {
                    this.childEngines[index].clear();

                    const isFullRendered = this.plugins[index].render();

                    if (!isFullRendered) {
                        this.childEngines[index].clearRender();
                    }
                });

                this.shallowRender();

                this.requestedRenders = [];

                this.lastPartialAnimationFrame = null;
            });
        }
    }

    shallowRender() {
        this.clear();

        this.childEngines.forEach((engine) => {
            this.ctx.drawImage(engine.canvas, 0, engine.position);
        });

        this.plugins.forEach((plugin) => {
            if (plugin.postRender) {
                plugin.postRender();
            }

            if (plugin.renderTooltip) {
                plugin.renderTooltip();
            }
        });
    }

    render() {
        cancelAnimationFrame(this.lastPartialAnimationFrame);
        this.requestedRenders = [];
        this.lastPartialAnimationFrame = null;

        if (!this.lastGlobalAnimationFrame) {
            this.lastGlobalAnimationFrame = requestAnimationFrame(() => {
                this.timeIndicators.calcTimeline();

                this.plugins.forEach((plugin, index) => {
                    this.childEngines[index].clear();

                    const isFullRendered = plugin.render();

                    if (!isFullRendered) {
                        this.childEngines[index].clearRender();
                    }
                });

                this.shallowRender();

                this.lastGlobalAnimationFrame = null;
            });
        }
    }
}

class OffscreenRenderEngine extends BasicRenderEngine {
    constructor({
                    width,
                    height,
                    parent,
                    id
                }) {
        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        super(canvas, parent.settings);

        this.parent = parent;
        this.id = id;
    }

    resize({ width, height, position }) {
        if (typeof width === 'number' && this.width !== width || typeof height === 'number' && this.height !== height) {
            super.resize(width, height);

            this.parent.recalcChildrenSizes();
        }

        if (typeof position === 'number') {
            this.position = position;
        }
    }

    getTimeUnits() {
        return this.parent.getTimeUnits();
    }

    getAccuracy() {
        return this.parent.timeIndicators.accuracy;
    }

    clearRender() {
        this.clear();

        this.parent.timeIndicators.renderLines(0, this.height, this);

        this.resolveRectRenderQueue();
        this.resolveTextRenderQueue();
        this.resolveStrokeRenderQueue();
    }

    renderTooltipFromData(...args) {
        this.parent.renderTooltipFromData(...args);
    }

    render() {
        this.parent.partialRender(this.id);
    }
}
