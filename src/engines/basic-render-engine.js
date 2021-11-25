import { EventEmitter } from 'events';
import { deepMerge } from './../utils.js';

const allChars = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890_-+()[]{}\\/|\'\";:.,?~';
const nodeBorderRadius= 3;
const checkSafari = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('safari') != -1 ? ua.indexOf('chrome') > -1 ? false : true : false;
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y,   x+w, y+h, r);
    this.arcTo(x+w, y+h, x,   y+h, r);
    this.arcTo(x,   y+h, x,   y,   r);
    this.arcTo(x,   y,   x+w, y,   r);
    this.closePath();
    return this;
  }

const getPixelRatio = (ctx) => {
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
            tooltipBackgroundColor: 'white',
            headerHeight: 14,
            headerColor: 'rgba(112, 112, 112, 0.25)',
            headerStrokeColor: 'rgba(112, 112, 112, 0.5)',
            headerTitleLeftPadding: 16
        }
    },
    tooltip: undefined
};

export class BasicRenderEngine extends EventEmitter {
    constructor(canvas, settings) {
        super();

        this.width = canvas.width;
        this.height = canvas.height;

        this.isSafari = checkSafari();
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.pixelRatio = getPixelRatio(this.ctx);

        this.setSettings(settings);

        this.applyCanvasSize();
        this.reset();
    }

    setSettings(data) {
        const settings = deepMerge(defaultRenderSettings, data);

        this.settings = settings;

        this.timeUnits = settings.timeUnits;
        this.styles = settings.styles.main;

        this.blockHeight = this.styles.blockHeight;
        this.ctx.font = this.styles.font;

        const {
            actualBoundingBoxAscent: fontAscent,
            actualBoundingBoxDescent: fontDescent,
            width: allCharsWidth
        } = this.ctx.measureText(allChars);
        const { width: placeholderWidth } = this.ctx.measureText('…');
        const fontHeight = fontAscent + fontDescent;

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

    setCtxColor(color) {
        if (color && this.lastUsedColor !== color) {
            this.ctx.fillStyle = color;
            this.lastUsedColor = color;
        }
    }

    setStrokeColor(color) {
        if (color && this.lastUsedStrokeColor !== color) {
            this.ctx.strokeStyle = color;
            this.lastUsedStrokeColor = color;
        }
    }

    setCtxFont(font) {
        if (font && this.ctx.font !== font) {
            this.ctx.font = font;
        }
    }

    fillRect(x, y, w, h) {
        this.ctx.roundRect(x, y, w, h, nodeBorderRadius).fill();
    }

    fillText(text, x, y) {
        this.ctx.fillText(text, x, y);
    }

    renderBlock(color, x, y, w) {
        this.setCtxColor(color);
        this.fillRect(x, y, w, this.blockHeight);
    }

    renderStroke(color, x, y, w, h) {
        this.setStrokeColor(color);
        this.ctx.setLineDash([]);
        this.ctx.strokeRect(x, y, w, h);
    }

    renderHoverStroke(color, x, y, w, h) {
        this.setStrokeColor(color);
        this.ctx.setLineDash([]);
        //this.ctx.shadowBlur=3;
        this.ctx.lineWidth = 4;
        this.ctx.roundRect(x, y, w, h,nodeBorderRadius).stroke();
    }

    shadowRect(x,y,w,h,repeats,color){
        // set stroke & shadow to the same color
        this.ctx.strokeStyle=color;
        this.ctx.shadowColor=color;
        // set initial blur of 3px
        this.ctx.shadowBlur=12;
        // repeatedly overdraw the blur to make it prominent
        for(var i=0;i<repeats;i++){
          // increase the size of blur
          this.ctx.shadowBlur+=0.25;
          // stroke the rect (which also draws its shadow)
          this.ctx.roundRect(x, y, w, h,nodeBorderRadius).stroke();
        }
        // cancel shadowing by making the shadowColor transparent
        //this.ctx.shadowColor='rgba(0,0,0,0)';
        // restroke the interior of the rect for a more solid colored center
        //this.ctx.lineWidth=2;
        //this.ctx.strokeRect(x+2,y+2,w-4,h-4);
        this.ctx.shadowBlur=0;
      }

    clear(w = this.width, h = this.height, x = 0, y = 0) {
        this.ctx.clearRect(x, y, w, h - 1);
        this.setCtxColor(this.styles.backgroundColor);
        this.fillRect(x, y, w, h);

        this.emit('clear');
    }

    timeToPosition(time) {
        return time * this.zoom - this.positionX * this.zoom
    }

    pixelToTime(width) {
        return width / this.zoom;
    }

    setZoom(zoom) {

        this.zoom = zoom;
    }

    setPositionX(x) {
        const currentPos = this.positionX;

        this.positionX = x;

        return x - currentPos;
    }

    addRectToRenderQueue(color, x, y, w) {
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
        this.setCtxColor(this.styles.fontColor);

        this.textRenderQueue.forEach(({ text, x, y, w, textMaxWidth }) => {
            const { width: textWidth } = this.ctx.measureText(text);

            if (textWidth > textMaxWidth) {
                const avgCharWidth = textWidth / (text.length);
                const maxChars = Math.floor((textMaxWidth - this.placeholderWidth) / avgCharWidth);
                const halfChars = maxChars / 2;

                if (halfChars > 0) {
                    text = text.slice(0, Math.ceil(halfChars)) + '…' + text.slice(text.length - Math.floor(halfChars), text.length);
                } else {
                    text = '';
                }
            }

            if (text) {
                if (text==='All'){
                    this.setCtxColor('#ffffff');
                    this.ctx.fillText(text, (x < 0 ? 0 : x) + this.blockPaddingLeftRight, y + this.blockHeight - this.blockPaddingTopBottom);
                    this.setCtxColor(this.styles.fontColor);
                }
                else{
                    this.ctx.fillText(text, (x < 0 ? 0 : x) + this.blockPaddingLeftRight, y + this.blockHeight - this.blockPaddingTopBottom);

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

    setMinMax(min, max) {
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
        const isWidthChanged = typeof width === 'number' && this.width !== width;
        const isHeightChanged = typeof height === 'number' && this.height !== height;

        if (isWidthChanged || isHeightChanged) {
            this.width = isWidthChanged ? width : this.width;
            this.height = isHeightChanged ? height : this.height;

            this.applyCanvasSize();

            this.emit('resize', { width: this.width, height: this.height });

            return isHeightChanged;
        }
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

    copy(engine) {
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

    renderTooltipFromData(fields, mouse) {
        const mouseX = mouse.x + 10;
        const mouseY = mouse.y + 10;

        const maxWidth = fields.map(({ text }) => text)
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

        this.ctx.shadowColor = null;
        this.ctx.shadowBlur = null;

        fields.forEach(({ text, color }, index) => {
            if (color) {
                this.setCtxColor(color);
            } else {
                if (!index) {
                    this.setCtxColor(this.styles.tooltipHeaderFontColor);
                } else {
                    this.setCtxColor(this.styles.tooltipBodyFontColor);
                }
            }

            this.ctx.fillText(
                text,
                mouseX + this.blockPaddingLeftRight,
                mouseY + this.blockHeight - this.blockPaddingTopBottom + (this.charHeight + 2) * index
            );
        });
    }

    renderOuterNodeMask(fields){
        this.ctx.shadowBlur=12;
        this.ctx.shadowColor='rgba(255,255,255,0)';
        const {x, y, w} = fields;
        this.setCtxColor('rgba(255,255,255,0.5)');
        this.ctx.fillRect(0, 0, x, this.height);
        this.ctx.fillRect(x+w, 0, this.width-x-w, this.height);
        this.ctx.fillRect(x-0.1, 0, w+0.2, y);
    }

    renderNodeStrokeFromData(fields){
        const {color, x, y, w, h} = fields
        this.renderOuterNodeMask(fields);
        this.shadowRect(x, y, w, h,1,color);

        //this.renderHoverStroke(color, x, y, w, h);
    }

    renderShape(color, dots, posX, posY) {
        this.setCtxColor(color);

        this.ctx.beginPath();

        this.ctx.moveTo(dots[0].x + posX, dots[0].y + posY);

        dots.slice(1).forEach(({ x, y }) => this.ctx.lineTo(x + posX, y + posY));

        this.ctx.closePath();

        this.ctx.fill();
    }

    renderTriangle(color, x, y, width, height, direction) {
        const halfHeight = height / 2;
        const halfWidth = width / 2;
        let dots;

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

    renderCircle(color, x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.setCtxColor(color);
        this.ctx.fill();
    }
}
