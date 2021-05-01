import { EventEmitter } from 'events';

export class InteractionsEngine extends EventEmitter {
    constructor(canvas, renderEngine) {
        super();

        this.renderEngine = renderEngine;
        this.canvas = canvas;

        this.mouse = {
            x: 0,
            y: 0
        }

        this.handleMouseWheel = this.handleMouseWheel.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);

        this.initListeners();

        this.reset();
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
        const startPosition = this.renderEngine.positionX;
        const startZoom = this.renderEngine.zoom;
        const positionScrollDelta = deltaX / this.renderEngine.zoom;
        let zoomDelta = (deltaY / 1000) * this.renderEngine.zoom;

        this.renderEngine.tryToChangePosition(positionScrollDelta);

        zoomDelta = this.renderEngine.zoom - zoomDelta >= this.renderEngine.initialZoom ? zoomDelta : this.renderEngine.zoom - this.renderEngine.initialZoom

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

        this.renderEngine.requestRender({
            hasChanges: startPosition !== this.renderEngine.positionX || startZoom !== this.renderEngine.zoom
        });
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
        const startPositionX = this.renderEngine.positionX;
        const startPositionY = this.positionY;

        if (this.moveActive) {
            const mouseDeltaY = this.mouse.y - e.offsetY;
            const mouseDeltaX = (this.mouse.x - e.offsetX) / this.renderEngine.zoom;

            this.tryToChangePosition(mouseDeltaX)

            if (this.positionY + mouseDeltaY >= 0) {
                this.positionY += mouseDeltaY;
            } else {
                this.positionY = 0;
            }

            this.emit('change-position', {
                deltaX: mouseDeltaX,
                deltaY: mouseDeltaY
            });
        }

        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;

        const prevHoveredRegion = this.hoveredRegion;

        this.checkRegionHover();

        if (this.moveActive || this.hoveredRegion || (prevHoveredRegion && !this.hoveredRegion)) {
            this.renderEngine.requestRender({
                hasChanges: startPositionX !== this.renderEngine.positionX || startPositionY !== this.positionY
            });
        }
    }

    handleRegionHit() {
        this.selectedRegion = this.getHoveredRegion();

        this.emit('select', this.selectedRegion, this.mouse);
    }

    clearHitRegions() {
        this.hitRegions = [];
    }

    addHitRegion(type, data, x, y, w, h) {
        this.hitRegions.push({
            type, data, x, y, w, h
        })
    }

    checkRegionHover() {
        this.hoveredRegion = this.getHoveredRegion(this.mouse.x, this.mouse.y);

        if (this.hoveredRegion) {
            this.emit('hover', this.hoveredRegion, this.mouse);
        }
    }

    getHoveredRegion(mouseX, mouseY) {
        return this.hitRegions.find(({ x, y, w, h }) => (
            mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h
        ));
    }
}
