import { EventEmitter } from 'events';

export class InteractionsEngine extends EventEmitter {
    constructor(canvas, renderEngine) {
        super();

        this.renderEngine = renderEngine;
        this.canvas = canvas;

        this.hitRegions = [];
        this.instances = [];
        this.mouse = {
            x: 0,
            y: 0
        }

        this.handleMouseWheel = this.handleMouseWheel.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);

        this.initListeners();

        this.reset();
    }

    makeInstance(renderEngine) {
        const separatedInteractionsEngine = new SeparatedInteractionsEngine(this, renderEngine);

        this.instances.push(separatedInteractionsEngine);

        return separatedInteractionsEngine;
    }

    reset() {
        this.selectedRegion = null;
        this.hoveredRegion = null;
        this.hitRegions = [];
    }

    destroy() {
        this.removeListeners();
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

        const realView = this.renderEngine.getRealView();
        const initialZoom = this.renderEngine.getInitialZoom();
        const startPosition = this.renderEngine.positionX;
        const startZoom = this.renderEngine.zoom;
        const positionScrollDelta = deltaX / this.renderEngine.zoom;
        let zoomDelta = (deltaY / 1000) * this.renderEngine.zoom;

        this.renderEngine.tryToChangePosition(positionScrollDelta);

        zoomDelta = this.renderEngine.zoom - zoomDelta >= initialZoom ? zoomDelta : this.renderEngine.zoom - initialZoom

        if (zoomDelta !== 0) {
            const zoomed = this.renderEngine.setZoom(this.renderEngine.zoom - zoomDelta);

            if (zoomed) {
                const proportion = this.mouse.x / this.renderEngine.width;
                const timeDelta = realView - (this.renderEngine.width / this.renderEngine.zoom);
                const positionDelta = timeDelta * proportion;

                this.renderEngine.tryToChangePosition(positionDelta);
            }
        }

        this.checkRegionHover();

        if (startPosition !== this.renderEngine.positionX || startZoom !== this.renderEngine.zoom) {
            this.renderEngine.render();
        }
    }

    handleMouseDown() {
        this.moveActive = true;
        this.mouseClickStartPosition = {
            x: this.mouse.x,
            y: this.mouse.y
        };

        this.emit('down', this.hoveredRegion, this.mouse);
    }

    handleMouseUp() {
        this.moveActive = false;

        const isClick = this.mouseClickStartPosition && this.mouseClickStartPosition.x === this.mouse.x && this.mouseClickStartPosition.y === this.mouse.y;

        if (isClick) {
            this.handleRegionHit(this.mouse.x, this.mouse.y);
        }

        this.emit('up', this.hoveredRegion, this.mouse, isClick);

        if (isClick) {
            this.emit('click', this.hoveredRegion, this.mouse);
        }
    }

    handleMouseMove(e) {
        if (this.moveActive) {
            const mouseDeltaY = this.mouse.y - e.offsetY;
            const mouseDeltaX = (this.mouse.x - e.offsetX) / this.renderEngine.zoom;

            if (mouseDeltaY || mouseDeltaX) {
                this.emit('change-position', {
                    deltaX: mouseDeltaX,
                    deltaY: mouseDeltaY,
                });
            }
        }

        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;

        this.checkRegionHover();

        this.emit('move', this.hoveredRegion, this.mouse);
    }

    handleRegionHit() {
        const selectedRegion = this.getHoveredRegion();

        this.emit('select', selectedRegion, this.mouse);
    }

    checkRegionHover() {
        const hoveredRegion = this.getHoveredRegion(this.mouse.x, this.mouse.y);

        if (hoveredRegion) {
            if (!this.currentCursor && hoveredRegion.cursor) {
                this.renderEngine.canvas.style.cursor = hoveredRegion.cursor;
            }

            this.hoveredRegion = hoveredRegion;
            this.emit('hover', hoveredRegion, this.mouse);
            this.renderEngine.partialRender();
        } else if (this.hoveredRegion && !hoveredRegion) {
            if (!this.currentCursor) {
                this.clearCursor();
            }

            this.hoveredRegion = null;
            this.emit('hover', null, this.mouse);
            this.renderEngine.partialRender();
        }
    }

    getHoveredRegion() {
        const hoveredRegion = this.hitRegions.find(({ x, y, w, h }) => (
            this.mouse.x >= x && this.mouse.x <= x + w && this.mouse.y >= y && this.mouse.y <= y + h
        ));

        if (hoveredRegion) {
            return hoveredRegion;
        } else {
            const hoveredInstance = this.instances.find(({ renderEngine }) => (
                renderEngine.position <= this.mouse.y
            ) && (
                renderEngine.height + renderEngine.position >= this.mouse.y
            ));

            if (hoveredInstance) {
                const offsetTop = hoveredInstance.renderEngine.position;

                return hoveredInstance.hitRegions.find(({ x, y, w, h }) => (
                    this.mouse.x >= x && this.mouse.x <= x + w && this.mouse.y >= y + offsetTop && this.mouse.y <= y + h + offsetTop
                ));
            }
        }
    }

    clearHitRegions() {
        this.hitRegions = [];
    }

    addHitRegion(type, data, x, y, w, h, cursor) {
        this.hitRegions.push({
            type, data, x, y, w, h,
            cursor
        });
    }

    setCursor(cursor) {
        this.renderEngine.canvas.style.cursor = cursor;
        this.currentCursor = cursor;
    }

    clearCursor() {
        const hoveredRegion = this.getHoveredRegion(this.mouse.x, this.mouse.y);
        this.currentCursor = null;

        if (hoveredRegion && hoveredRegion.cursor) {
            this.renderEngine.canvas.style.cursor = hoveredRegion.cursor;
        } else {
            this.renderEngine.canvas.style.cursor = null;
        }
    }
}

class SeparatedInteractionsEngine extends EventEmitter {
    constructor(parent, renderEngine) {
        super();

        this.parent = parent;
        this.renderEngine = renderEngine;

        [
            'down',
            'up',
            'move',
            'change-position',
            'click'
        ].forEach((eventName) => parent.on(eventName, (...args) => this.resend(eventName, ...args)));

        [
            'select',
            'hover'
        ].forEach((eventName) => parent.on(eventName, (...args) => this.emit(eventName, ...args)));

        this.clearHitRegions();
    }

    resend(...args) {
        if ((
            this.renderEngine.position <= this.parent.mouse.y
        ) && (
            this.renderEngine.height + this.renderEngine.position >= this.parent.mouse.y
        )) {
            this.emit(...args);
        }
    }

    getMouse() {
        const { x, y } = this.parent.mouse;

        return {
            x,
            y: y - this.renderEngine.position
        };
    }

    getGlobalMouse() {
        return this.parent.mouse;
    }

    clearHitRegions() {
        this.hitRegions = [];
    }

    addHitRegion(type, data, x, y, w, h, cursor) {
        this.hitRegions.push({
            type, data, x, y, w, h,
            cursor
        });
    }

    setCursor(cursor) {
        this.parent.setCursor(cursor);
    }

    clearCursor() {
        this.parent.clearCursor();
    }
}
