import { EventEmitter } from 'events';
import { TimeGrid } from './time-grid.js';
import { deepMerge, isNumber } from '../utils.js';
import {MainStyleSettings, Stroke, Text, Mouse, Plugins, Rect} from "../types";

interface HeightPositions {
    position: number;
    result: number[];
}

const allChars = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890_-+()[]{}\\/|\'\";:.,?~';
const MAX_ACCURACY = 6;

const getPixelRatio = (ctx: any) => {
    const dpr = window.devicePixelRatio || 1;
    const bsr = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
}

export const defaultRenderSettings = {
    timeUnits: 'ms',
    styles: {
        main: {
            blockHeight: 16,
            blockPaddingLeftRight: 4,
            backgroundColor: 'white',
            font: `10px sans-serif`,
            fontColor: 'black',
            tooltipHeaderFontColor: 'black',
            tooltipBodyFontColor: '#688f45',
            tooltipBackgroundColor: 'white'
        }
    }
};

class BasicRenderEngine extends EventEmitter {
    min = 0;
    max = 0;
    positionX = 0;
    charHeight = 0;
    blockPaddingLeftRight = 4;

    width: number;
    height: number;
    settings: any;
    styles: MainStyleSettings | undefined;
    zoom = 0;
    blockHeight = 16;
    timeUnits = "ms";

    private canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D | null;
    private readonly pixelRatio: number;
    private blockPaddingTopBottom = 4;
    private placeholderWidth = 0;
    private avgCharWidth = 0;
    private minTextWidth = 0;
    private textRenderQueue: Text[] = [];
    private strokeRenderQueue: Stroke[] = [];
    private rectRenderQueue: Record<string, Rect[]> = {};
    private lastUsedColor: string | null = null;

    constructor(canvas: HTMLCanvasElement, settings: any) {
        super();

        this.width = canvas.width;
        this.height = canvas.height;

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.pixelRatio = getPixelRatio(this.ctx);

        this.setSettings(settings);

        this.applyCanvasSize();
        this.reset();
    }

    setSettings(newSettings: Record<any, any>) {
        const settings: Record<any, any> = deepMerge(defaultRenderSettings, newSettings);

        this.settings = settings;

        this.timeUnits = settings.timeUnits;
        this.styles = settings.styles.main;

        // @ts-ignore TOD: fix this.styles default value
        this.blockHeight = this.styles.blockHeight;
        //@ts-ignore TODO: fix this, the issue is that ctx can be undefined even though we assigned it in constructor
        this.ctx!.font = this.styles.font;

        const {
            actualBoundingBoxAscent: fontAscent,
            actualBoundingBoxDescent: fontDescent,
            width: allCharsWidth
        } = this.ctx!.measureText(allChars);
        const { width: placeholderWidth } = this.ctx!.measureText('…');
        const fontHeight = fontAscent + fontDescent;

        // @ts-ignore TOD: fix this.styles default value
        this.blockPaddingLeftRight = this.styles.blockPaddingLeftRight;
        this.blockPaddingTopBottom = Math.ceil((this.blockHeight - (fontHeight)) / 2);
        this.charHeight = fontHeight + 1;
        this.placeholderWidth = placeholderWidth;
        this.avgCharWidth = allCharsWidth / allChars.length;
        this.minTextWidth = this.avgCharWidth + this.placeholderWidth;
    }

    reset() {
        this.textRenderQueue = [];
        this.strokeRenderQueue = [];
        this.rectRenderQueue = {};
    }

    setCtxColor(color: string) {
        if (color && this.lastUsedColor !== color) {
            this.ctx!.fillStyle = color;
            this.lastUsedColor = color;
        }
    }

    setCtxFont(font: string) {
        if (font && this.ctx!.font !== font) {
            this.ctx!.font = font;
        }
    }

    fillRect(x: number, y: number, w: number, h: number) {
        this.ctx!.fillRect(x, y, w, h);
    }

    fillText(text: string, x: number, y: number) {
        this.ctx!.fillText(text, x, y);
    }

    renderBlock(color: string, x: number, y: number, w: number) {
        this.setCtxColor(color);
        this.ctx!.fillRect(x, y, w, this.blockHeight);
    }

    renderStroke(color:string, x: number, y: number, w: number, h: number) {
        this.setCtxColor(color);

        this.ctx!.setLineDash([]);
        this.ctx!.strokeStyle = color;
        this.ctx!.strokeRect(x, y, w, h);
    }

    clear(w = this.width, h = this.height, x = 0, y = 0) {
        this.ctx!.clearRect(x, y, w, h - 1);
        // @ts-ignore this.styles can be undefined TODO: fix this
        this.setCtxColor(this.styles.backgroundColor);
        this.ctx!.fillRect(x, y, w, h);
    }

    timeToPosition(time: number) {
        return time * this.zoom - this.positionX * this.zoom
    }

    pixelToTime(width: number) {
        return width / this.zoom;
    }

    setZoom(zoom: number) {
        this.zoom = zoom;
    }

    setPositionX(x: number) {
        const currentPos = this.positionX;

        this.positionX = x;

        return x - currentPos;
    }

    addRectToRenderQueue(color: string, x: number, y: number, w: number) {
        if (!this.rectRenderQueue[color]) {
            this.rectRenderQueue[color] = [];
        }

        this.rectRenderQueue[color].push({ x, y, w });
    }

    addTextToRenderQueue(text, x, y, w) {
        if (text) {
            const textMaxWidth = w - (this.blockPaddingLeftRight * 2 - (x < 0 ? x : 0));

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
        // @ts-ignore TODO: fix this as this.styles can be undefined
        this.setCtxColor(this.styles.fontColor);

        this.textRenderQueue.forEach(({ text, x, y, w, textMaxWidth }) => {
            const { width: textWidth } = this.ctx!.measureText(text);

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
                this.ctx!.fillText(text, (x < 0 ? 0 : x) + this.blockPaddingLeftRight, y + this.blockHeight - this.blockPaddingTopBottom);
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

    setMinMax(min: number, max: number) {
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

    resetView() {
        this.setZoom(this.getInitialZoom());
        this.setPositionX(this.min);
    }

    resize(width, height) {
        this.width = width || this.width;
        this.height = height || this.height;

        this.applyCanvasSize();

        this.emit('resize', { width: this.width, height: this.height });
    }

    applyCanvasSize() {
        this.canvas.style.backgroundColor = 'white';
        this.canvas.style.overflow = 'hidden';
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.canvas.width = this.width * this.pixelRatio;
        this.canvas.height = this.height * this.pixelRatio;
        this.ctx!.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
        // @ts-ignore TODO: fix this as tyles and ctx can be undefined
        this.ctx!.font = this.styles.font;
        this.lastUsedColor = null;
    }

    copy(engine) {
        this.ctx!.drawImage(
            engine.canvas,
            0,
            0,
            engine.canvas.width * engine.pixelRatio,
            engine.canvas.height * engine.pixelRatio,
            0,
            engine.position || 0,
            engine.width * engine.pixelRatio,
            engine.height * engine.pixelRatio
        );
    }

    renderTooltipFromData(header: string, body: string[], mouse: Mouse) {
        const mouseX = mouse.x + 10;
        const mouseY = mouse.y + 10;

        const maxWidth = [header, ...body]
            .map((text) => this.ctx!.measureText(text))
            .reduce((acc, { width }) => Math.max(acc, width), 0);
        const fullWidth = maxWidth + this.blockPaddingLeftRight * 2;

        this.ctx!.shadowColor = 'black';
        this.ctx!.shadowBlur = 5;

        // @ts-ignore Fix styles default value to not think it can be undefined all the time
        this.setCtxColor(this.styles.tooltipBackgroundColor);
        this.ctx!.fillRect(
            mouseX,
            mouseY,
            fullWidth + this.blockPaddingLeftRight * 2,
            (this.charHeight + 2) * (body.length + 1) + this.blockPaddingLeftRight * 2
        );

        // @ts-ignore ctx can be undefined and it accepts only string for shadow color TODO: fix this
        this.ctx!.shadowColor = null;
        // @ts-ignore ctx can be undefined and it accepts only number for shadow blur TODO: fix this
        this.ctx!.shadowBlur = null;

        // @ts-ignore TODO: fix this.styles  default value
        this.setCtxColor(this.styles.tooltipHeaderFontColor);
        this.ctx!.fillText(
            header,
            mouseX + this.blockPaddingLeftRight,
            mouseY + this.blockHeight - this.blockPaddingTopBottom
        );

        // @ts-ignore TODO: fix this.styles  default value
        this.setCtxColor(this.styles.tooltipBodyFontColor);
        body.forEach((text, index) => {
            const count = index + 1;

            this.ctx!.fillText(
                text,
                mouseX + this.blockPaddingLeftRight,
                mouseY + this.blockHeight - this.blockPaddingTopBottom + (this.charHeight + 2) * count
            );
        })
    }
}

export class RenderEngine extends BasicRenderEngine {
    public width = 0;

    private plugins: Plugins;
    private requestedRenders: any[];

    private readonly childEngines: any[];
    readonly timeGrid: TimeGrid;
    private lastPartialAnimationFrame: number | null | undefined;
    private lastGlobalAnimationFrame: number | null | undefined;

    constructor(canvas: HTMLCanvasElement, settings: any, plugins: Plugins) {
        super(canvas, settings);

        this.plugins = plugins;

        this.childEngines = [];
        this.requestedRenders = [];

        this.timeGrid = new TimeGrid(this, settings);
    }

    makeInstance() {
        const offscreenRenderEngine = new OffscreenRenderEngine({
            width: this.width,
            height: 0,
            id: this.childEngines.length,
            parent: this,
        });

        offscreenRenderEngine.setMinMax(this.min, this.max);
        offscreenRenderEngine.resetView();

        this.childEngines.push(offscreenRenderEngine);

        return offscreenRenderEngine;
    }

    calcMinMax() {
        const min = this.plugins
            // TODO: review this as min is not mandatory in all plugins as it seems
            .map(({ min  = 0}) => min)
            .filter(isNumber)
            .reduce((acc, min) => Math.min(acc, min));

        const max = this.plugins
            .map(({ max }) => max)
            .filter(isNumber)
            .reduce((acc, max) => Math.max(acc, max));

        this.setMinMax(min, max);
    }

    calcTimeGrid() {
        this.timeGrid.recalc();
    }

    setMinMax(min, max) {
        super.setMinMax(min, max);

        this.childEngines.forEach((engine) => engine.setMinMax(min, max));
    }

    setSettings(data) {
        super.setSettings(data);

        this.settings = data;

        if (this.timeGrid) {
            this.timeGrid.setSettings(data);
        }

        if (this.childEngines) {
            this.childEngines.forEach((engine) => engine.setSettings(data));
            this.plugins.forEach((plugin) => plugin.setSettings && plugin.setSettings(data));
            this.recalcChildrenSizes();
        }
    }

    resize(width: number, height: number) {
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
            // TODO: was this a bug? it was expecting two params
            const { width, height } = childrenSizes[index];
            engine.resize(width, height);
        });
    }

    getChildrenSizes() {
        const heights = this.childEngines.map((engine, index) => this.plugins[index].height);
        const heightlessCount = heights.filter((height) => !height).length;
        const freeHeight = heights.reduce((acc, height) => acc - (height || 0), this.height);
        const freeHeightPart = freeHeight / heightlessCount;
        const preparedHeights = heights.map((height) => Math.ceil(height || freeHeightPart));

        const heightPositions = preparedHeights.reduce((acc: HeightPositions, height) => ({
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
        return this.timeGrid.accuracy;
    }

    setZoom(zoom: number) {
        if (this.getAccuracy() < MAX_ACCURACY || zoom <= this.zoom) {
            super.setZoom(zoom);
            this.childEngines.forEach((engine) => engine.setZoom(zoom));

            return true;
        }

        return false;
    }

    setPositionX(x) {
        const res = super.setPositionX(x);
        this.childEngines.forEach((engine) => engine.setPositionX(x));

        return res;
    }

    partialRender(id: number | undefined) {
        if (typeof id === 'number') {
            this.requestedRenders.push(id);
        }

        if (!this.lastPartialAnimationFrame) {
            this.lastPartialAnimationFrame = requestAnimationFrame(() => {
                this.requestedRenders.forEach((index) => {
                    this.childEngines[index].clear();

                    const isFullRendered = this.plugins[index].render();

                    if (!isFullRendered) {
                        this.childEngines[index].standardRender();
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
            this.copy(engine);
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
        if (typeof this.lastPartialAnimationFrame === "number") {
            cancelAnimationFrame(this.lastPartialAnimationFrame);
        }

        this.requestedRenders = [];
        this.lastPartialAnimationFrame = null;

        if (!this.lastGlobalAnimationFrame) {
            this.lastGlobalAnimationFrame = requestAnimationFrame(() => {
                this.timeGrid.recalc();

                this.plugins.forEach((plugin, index) => {
                    this.childEngines[index].clear();

                    const isFullRendered = plugin.render();

                    if (!isFullRendered) {
                        this.childEngines[index].standardRender();
                    }
                });

                this.shallowRender();

                this.lastGlobalAnimationFrame = null;
            });
        }
    }
}

interface OffscreenRenderEngineCreationOptions {
    width: number;
    height: number;
    parent: RenderEngine;
    id?: number;
}

export class OffscreenRenderEngine extends BasicRenderEngine {
    readonly parent: RenderEngine;
    private readonly id: number | undefined;
    private readonly children: OffscreenRenderEngine[];

    constructor({
                    width,
                    height,
                    parent,
                    id
                }: OffscreenRenderEngineCreationOptions) {
        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        super(canvas, parent.settings);

        this.width = width;
        this.height = height;

        this.parent = parent;
        this.id = id;
        this.children = [];
        this.applyCanvasSize();
    }

    makeChild() {
        const child = new OffscreenRenderEngine({
            width: this.width,
            height: this.height,
            parent: this.parent
        });

        this.children.push(child);

        child.setMinMax(this.min, this.max);
        child.resetView();

        return child;
    }

    setSettingsOverrides(settings) {
        this.setSettings(deepMerge(this.settings, settings));
        this.children.forEach((child) => child.setSettingsOverrides(settings));
    }

    resize({ width, height, position }: { width: number, height: number, position: number }) {
        if (typeof width === 'number' && this.width !== width || typeof height === 'number' && this.height !== height) {
            super.resize(width, height);

            this.parent.recalcChildrenSizes();
        }

        if (typeof position === 'number') {
            // @ts-ignore TODO: not sure what to do here as it wants to change this to positionX
            this.position = position;
        }

        this.children.forEach((child) => child.resize({ width, height, position }));
    }

    setMinMax(min, max) {
        super.setMinMax(min, max);
        this.children.forEach((child) => child.setMinMax(min, max));
    }

    setSettings(settings) {
        super.setSettings(settings);

        if (this.children) {
            this.children.forEach((child) => child.setSettings(settings));
        }
    }

    tryToChangePosition(positionDelta: number) {
        this.parent.tryToChangePosition(positionDelta);
    }

    recalcMinMax() {
        this.parent.calcMinMax();
    }

    getTimeUnits() {
        return this.parent.getTimeUnits();
    }

    getAccuracy() {
        return this.parent.timeGrid.accuracy;
    }

    renderTimeGrid() {
        this.parent.timeGrid.renderLines(0, this.height, this);
    }

    renderTimeGridTimes() {
        this.parent.timeGrid.renderTimes(this);
    }

    standardRender() {
        this.renderTimeGrid();
        this.resolveRectRenderQueue();
        this.resolveTextRenderQueue();
        this.resolveStrokeRenderQueue();
    }

    renderTooltipFromData(...args: [header: string, body: string[], mouse: Mouse]) {
        this.parent.renderTooltipFromData(...args);
    }

    resetParentView() {
        this.parent.resetView();
        this.parent.render();
    }

    render() {
        this.parent.partialRender(this.id);
    }
}
