import { EventEmitter } from 'events';
import { addAlpha, mergeObjects } from '../utils';
import { Dots, Mouse, RectRenderQueue, Stroke, Text, TooltipField } from '../types';
import { OffscreenRenderEngine } from './offscreen-render-engine';
import { RenderEngine } from './render-engine';
import { FRAME_FLAG_IS_THIRD_PARTY, FRAME_FLAG_IS_HIGHLIGHTED, FRAME_FLAG_IS_INACTIVE } from './../const.js';

// eslint-disable-next-line prettier/prettier -- prettier complains about escaping of the " character
const allChars = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890_-+()[]{}\\/|\'";:.,?~';
const nodeBorderRadius = 3;
const checkSafari = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('safari') ? !ua.includes('chrome') : false;
};
declare global {
    interface CanvasRenderingContext2D {
        roundRect(x, y, w, h, r): any;
    }
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();

    return this;
};

const getPixelRatio = (ctx) => {
    const dpr = window.devicePixelRatio || 1;
    const bsr =
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1;

    return dpr / bsr;
};

export type RenderOptions = {
    tooltip?:
        | ((data: any, renderEngine: RenderEngine | OffscreenRenderEngine, mouse: Mouse | null) => boolean | void)
        | boolean;
    timeUnits: string;
    inverted: boolean;
};

export type RenderStyles = {
    blockHeight: number;
    blockPaddingLeftRight: number;
    backgroundColor: string;
    font: string;
    fontColor: string;
    fontColorInactive: string;
    tooltipHeaderFontColor: string;
    tooltipBodyFontColor: string;
    tooltipBackgroundColor: string;
    headerHeight: number;
    headerColor: string;
    headerStrokeColor: string;
    headerTitleLeftPadding: number;
};

export type RenderSettings = {
    options?: Partial<RenderOptions>;
    styles?: Partial<RenderStyles>;
};

export const defaultRenderSettings: RenderOptions = {
    tooltip: undefined,
    timeUnits: 'ms',
    inverted: false,
};

export const defaultRenderStyles: RenderStyles = {
    blockHeight: 16,
    blockPaddingLeftRight: 4,
    backgroundColor: 'white',
    font: `10px sans-serif`,
    fontColor: 'black',
    fontColorInactive: 'white',
    tooltipHeaderFontColor: 'black',
    tooltipBodyFontColor: '#688f45',
    tooltipBackgroundColor: 'white',
    headerHeight: 14,
    headerColor: 'rgba(112, 112, 112, 0.25)',
    headerStrokeColor: 'rgba(112, 112, 112, 0.5)',
    headerTitleLeftPadding: 16,
};

export class BasicRenderEngine extends EventEmitter {
    width: number;
    height: number;
    isSafari: boolean;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    pixelRatio: number;
    options: RenderOptions;
    timeUnits;
    inverted;
    styles: RenderStyles;
    blockPaddingLeftRight: number;
    blockHeight: number;
    blockPaddingTopBottom: number;
    charHeight: number;
    placeholderWidth: number;
    avgCharWidth: number;
    minTextWidth: number;
    textRenderQueue: Text[];
    strokeRenderQueue: Stroke[];
    rectRenderQueue: RectRenderQueue;
    lastUsedColor: string | null;
    lastUsedStrokeColor: string | null;
    zoom: number;
    positionX: number;
    min: number;
    max: number;

    constructor(canvas: HTMLCanvasElement, settings: RenderSettings) {
        super();

        this.width = canvas.width;
        this.height = canvas.height;

        this.isSafari = checkSafari();
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false })!;
        this.pixelRatio = getPixelRatio(this.ctx);

        this.setSettings(settings);

        this.applyCanvasSize();
        this.reset();
    }

    setSettings({ options, styles }: RenderSettings) {
        this.options = mergeObjects(defaultRenderSettings, options);
        this.styles = mergeObjects(defaultRenderStyles, styles);

        this.timeUnits = this.options.timeUnits;
        this.inverted = this.options.inverted;

        this.blockHeight = this.styles.blockHeight;
        this.ctx.font = this.styles.font;

        const {
            actualBoundingBoxAscent: fontAscent,
            actualBoundingBoxDescent: fontDescent,
            width: allCharsWidth,
        } = this.ctx.measureText(allChars);
        const { width: placeholderWidth } = this.ctx.measureText('…');
        const fontHeight = fontAscent + fontDescent;

        this.blockPaddingLeftRight = this.styles.blockPaddingLeftRight;
        this.blockPaddingTopBottom = Math.ceil((this.blockHeight - fontHeight) / 2);
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
            this.ctx.fillStyle = color;
            this.lastUsedColor = color;
        }
    }

    setStrokeColor(color: string) {
        if (color && this.lastUsedStrokeColor !== color) {
            this.ctx.strokeStyle = color;
            this.lastUsedStrokeColor = color;
        }
    }

    setCtxFont(font: string) {
        if (font && this.ctx.font !== font) {
            this.ctx.font = font;
        }
    }

    drawLine(x1: number, y1: number, x2: number, y2: number, color: string, width: number) {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    drawLines(x: number, y: number, w: number, h: number) {
        const thickness = 1;
        const gap = 15;
        let currentX = x + gap;
        const lineColor = 'rgba(255, 255, 255, 0.5)';

        if (w <= 5) {
            this.drawLine(x + w, y, x, y + h, lineColor, thickness);
        }
        //tiny first and last lines
        else if (w > 5) {
            this.drawLine(x + 5, y, x, y + 10, lineColor, thickness);
            this.drawLine(x + w, y + 10, x + w - 5, y + h, lineColor, thickness);
        }
        if (currentX < x + w) {
            //first regular line
            this.drawLine(currentX, y, currentX - 10, y + h, lineColor, thickness);
            currentX = currentX + gap;

            //rest of the lines
            while (currentX < x + w) {
                this.drawLine(currentX, y, currentX - 10, y + h, lineColor, thickness);
                currentX = currentX + gap;
            }
        }
    }

    fillRect(x: number, y: number, w: number, h: number) {
        this.ctx.roundRect(x, y, w, h, nodeBorderRadius).fill();
    }

    fillText(text: string, x: number, y: number) {
        this.ctx.fillText(text, x, y);
    }

    renderBlock(originalColor: string, x: number, y: number, w: number, flags = 0) {
        const color = flags & FRAME_FLAG_IS_INACTIVE ? addAlpha(originalColor, 0.2) : originalColor;
        this.setCtxColor(color);

        // shadows styles should be applied BEFORE filling the rectangle
        if (flags & FRAME_FLAG_IS_HIGHLIGHTED) {
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 3;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = 'rgba(21, 24, 34, 0.3)';
        } else {
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            this.ctx.shadowBlur = 0;
            this.ctx.shadowColor = '';
        }

        // fillRect should be AFTER setting the shadows
        this.fillRect(x, y, w, this.blockHeight);

        if (flags & FRAME_FLAG_IS_THIRD_PARTY) {
            this.drawLines(x, y, w, this.blockHeight);
        }
    }

    renderStroke(color: string, x: number, y: number, w: number, h: number) {
        this.setStrokeColor(color);
        this.ctx.setLineDash([]);
        this.ctx.strokeRect(x, y, w, h);
    }

    renderHoverStroke(color, x, y, w, h) {
        this.setStrokeColor(color);
        this.ctx.setLineDash([]);
        this.ctx.lineWidth = 4;
        this.ctx.roundRect(x, y, w, h, nodeBorderRadius).stroke();
    }

    shadowRect(x, y, w, h, repeats, color) {
        // set stroke & shadow to the same color
        this.ctx.strokeStyle = color;
        this.ctx.shadowColor = color;
        // set initial blur of 3px
        this.ctx.shadowBlur = 12;
        // repeatedly overdraw the blur to make it prominent
        for (let i = 0; i < repeats; i++) {
            // increase the size of blur
            this.ctx.shadowBlur += 0.25;
            // stroke the rect (which also draws its shadow)
            this.ctx.roundRect(x, y, w, h, nodeBorderRadius).stroke();
        }
        this.ctx.shadowBlur = 0;
    }

    clear(w = this.width, h = this.height, x = 0, y = 0) {
        this.ctx.clearRect(x, y, w, h - 1);
        this.setCtxColor(this.styles.backgroundColor);
        this.fillRect(x, y, w, h);
        this.emit('clear');
    }

    timeToPosition(time: number) {
        return time * this.zoom - this.positionX * this.zoom;
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

    addRectToRenderQueue(color: string, x: number, y: number, w: number, flags: any) {
        if (!this.rectRenderQueue[color]) {
            this.rectRenderQueue[color] = [];
        }

        this.rectRenderQueue[color].push({ x, y, w, flags });
    }

    addTextToRenderQueue(text: string, x: number, y: number, w: number, color: string, flags: any) {
        if (text) {
            const textMaxWidth = w - (this.blockPaddingLeftRight * 2 - (x < 0 ? x : 0)) - 5;

            if (textMaxWidth > 0) {
                this.textRenderQueue.push({ text, x, y, w, textMaxWidth, color, flags });
            }
        }
    }

    addStrokeToRenderQueue(color: string, x: number, y: number, w: number, h: number) {
        this.strokeRenderQueue.push({ color, x, y, w, h });
    }

    resolveRectRenderQueue() {
        Object.entries(this.rectRenderQueue).forEach(([color, items]) => {
            this.setCtxColor(color);

            items.forEach(({ x, y, w, flags }) => this.renderBlock(color, x, y, w, flags));
        });

        this.rectRenderQueue = {};
    }

    resolveTextRenderQueue() {
        this.textRenderQueue.forEach(({ text, x, y, textMaxWidth, flags }) => {
            const { width: textWidth } = this.ctx.measureText(text);
            const fontColor = flags & FRAME_FLAG_IS_INACTIVE ? this.styles.fontColorInactive : this.styles.fontColor;
            this.setCtxColor(fontColor);

            if (textWidth > textMaxWidth) {
                const avgCharWidth = textWidth / text.length;
                const maxChars = Math.floor((textMaxWidth - this.placeholderWidth) / avgCharWidth);
                const halfChars = (maxChars - 1) / 2;

                if (halfChars > 0) {
                    text =
                        text.slice(0, Math.ceil(halfChars)) +
                        '…' +
                        text.slice(text.length - Math.floor(halfChars), text.length);
                } else {
                    text = '';
                }
            }
            if (text) {
                if (text === 'All') {
                    this.setCtxColor('#ffffff');
                    this.ctx.fillText(
                        text,
                        (x < 0 ? 0 : x) + this.blockPaddingLeftRight,
                        y + this.blockHeight - this.blockPaddingTopBottom
                    );
                    this.setCtxColor(this.styles.fontColor);
                } else {
                    this.ctx.fillText(
                        text,
                        (x < 0 ? 0 : x) + this.blockPaddingLeftRight,
                        y + this.blockHeight - this.blockPaddingTopBottom
                    );
                }
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
        const hasChanges = min !== this.min || max !== this.max;

        this.min = min;
        this.max = max;

        if (hasChanges) {
            this.emit('min-max-change', min, max);
        }
    }

    getTimeUnits() {
        return this.timeUnits;
    }
    getInverted() {
        return this.inverted;
    }

    tryToChangePosition(positionDelta: number) {
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
        }
        return 1;
    }

    getRealView() {
        return this.width / this.zoom;
    }

    resetView() {
        this.setZoom(this.getInitialZoom());
        this.setPositionX(this.min);
    }

    resize(width?: number, height?: number) {
        const isWidthChanged = typeof width === 'number' && this.width !== width;
        const isHeightChanged = typeof height === 'number' && this.height !== height;

        if (isWidthChanged || isHeightChanged) {
            this.width = isWidthChanged ? width : this.width;
            this.height = isHeightChanged ? height : this.height;

            this.applyCanvasSize();

            this.emit('resize', { width: this.width, height: this.height });

            return isHeightChanged;
        }
        return false;
    }

    applyCanvasSize() {
        this.canvas.style.backgroundColor = 'white';
        this.canvas.style.overflow = 'hidden';
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.canvas.width = this.width * this.pixelRatio;
        this.canvas.height = this.height * this.pixelRatio;
        this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
        this.ctx.font = this.styles.font;
        this.lastUsedColor = null;
        this.lastUsedStrokeColor = null;
    }

    copy(engine: OffscreenRenderEngine) {
        const ratio = this.isSafari ? 1 : engine.pixelRatio;

        if (engine.canvas.height) {
            this.ctx.drawImage(
                engine.canvas,
                0,
                0,
                engine.canvas.width * ratio,
                engine.canvas.height * ratio,
                0,
                engine.position || 0,
                engine.width * ratio,
                engine.height * ratio
            );
        }
    }

    renderTooltipFromData(fields: TooltipField[], mouse: Mouse) {
        const mouseX = mouse.x + 10;
        const mouseY = mouse.y + 10;

        const maxWidth = fields
            .map(({ text }) => text)
            .map((text) => this.ctx.measureText(text))
            .reduce((acc, { width }) => Math.max(acc, width), 0);
        const fullWidth = maxWidth + this.blockPaddingLeftRight * 2;

        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = 5;

        this.setCtxColor(this.styles.tooltipBackgroundColor);
        this.ctx.fillRect(
            mouseX,
            mouseY,
            fullWidth + this.blockPaddingLeftRight * 2,
            (this.charHeight + 2) * fields.length + this.blockPaddingLeftRight * 2
        );

        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;

        fields.forEach(({ text, color }, index) => {
            if (color) {
                this.setCtxColor(color);
            } else if (!index) {
                this.setCtxColor(this.styles.tooltipHeaderFontColor);
            } else {
                this.setCtxColor(this.styles.tooltipBodyFontColor);
            }

            this.ctx.fillText(
                text,
                mouseX + this.blockPaddingLeftRight,
                mouseY + this.blockHeight - this.blockPaddingTopBottom + (this.charHeight + 2) * index
            );
        });
    }

    renderOuterNodeMask(fields) {
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = 'rgba(255,255,255,0)';
        const { x, y, w } = fields;
        this.setCtxColor('rgba(255,255,255,0.3)');
        this.ctx.fillRect(0, 0, x, this.height);
        this.ctx.fillRect(x + w, 0, this.width - x - w, this.height);
        this.ctx.fillRect(x - 0.1, 0, w + 0.2, y);

        //render 'selected mark' on the selected node
        this.setCtxColor('#373A4A');
        this.fillRect(x, y, 3.5, this.blockHeight);
        this.drawTriangleMark(fields);
    }

    drawTriangleMark(fields) {
        const { x, y, w } = fields;
        this.ctx.beginPath();
        this.ctx.moveTo(x + w + 5, y + this.blockHeight / 2);
        this.ctx.lineTo(x + w + 15, y + 4);
        this.ctx.lineTo(x + w + 15, y - 4 + this.blockHeight);
        this.ctx.fill();
    }

    renderNodeStrokeFromData(fields) {
        const { color, x, y, w, h } = fields;
        this.shadowRect(x, y, w, h, 1, color);
    }

    renderShape(color: string, dots: Dots, posX: number, posY: number) {
        this.setCtxColor(color);

        this.ctx.beginPath();

        this.ctx.moveTo(dots[0].x + posX, dots[0].y + posY);

        dots.slice(1).forEach(({ x, y }) => this.ctx.lineTo(x + posX, y + posY));

        this.ctx.closePath();

        this.ctx.fill();
    }

    renderTriangle(
        color: string,
        x: number,
        y: number,
        width: number,
        height: number,
        direction: 'bottom' | 'left' | 'right' | 'top'
    ) {
        const halfHeight = height / 2;
        const halfWidth = width / 2;
        let dots: Dots;

        switch (direction) {
            case 'top':
                dots = [
                    { x: 0 - halfWidth, y: halfHeight },
                    { x: 0, y: 0 - halfHeight },
                    { x: halfWidth, y: halfHeight },
                ];
                break;
            case 'right':
                dots = [
                    { x: 0 - halfHeight, y: 0 - halfWidth },
                    { x: 0 - halfHeight, y: halfWidth },
                    { x: halfHeight, y: 0 },
                ];
                break;
            case 'bottom':
                dots = [
                    { x: 0 - halfWidth, y: 0 - halfHeight },
                    { x: halfWidth, y: 0 - halfHeight },
                    { x: 0, y: halfHeight },
                ];
                break;
            case 'left':
                dots = [
                    { x: halfHeight, y: 0 - halfWidth },
                    { x: halfHeight, y: halfWidth },
                    { x: 0 - halfHeight, y: 0 },
                ];
                break;
        }

        this.renderShape(color, dots, x, y);
    }

    renderCircle(color: string, x: number, y: number, radius: number) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.setCtxColor(color);
        this.ctx.fill();
    }
}
