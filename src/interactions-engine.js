import { EventEmitter } from 'events';

export class InteractionsEngine extends EventEmitter {
    constructor(canvas, renderEngine) {
        super();

        this.renderEngine = renderEngine;
        this.canvas = canvas;

        this.instances = [];
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

    makeInstance(renderEngine) {
        const separatedInteractionsEngine = new SeparatedInteractionsEngine(this, renderEngine);

        this.instances.push(separatedInteractionsEngine);

        return separatedInteractionsEngine;
    }

    reset() {
        this.selectedRegion = null;
        this.hoveredRegion = null;
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

            this.renderEngine.tryToChangePosition(mouseDeltaX)

            if (mouseDeltaY) {
                this.emit('change-position-y', mouseDeltaY);
            }
        }

        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;

        if (startPositionX !== this.renderEngine.positionX || startPositionY !== this.positionY) {
            this.renderEngine.render();
        }

        this.checkRegionHover();
    }

    handleRegionHit() {
        this.selectedRegion = this.getHoveredRegion();

        this.emit('select', this.selectedRegion, this.mouse);
    }

    checkRegionHover() {
        const hoveredRegion = this.getHoveredRegion(this.mouse.x, this.mouse.y);

        if (hoveredRegion) {
            this.hoveredRegion = hoveredRegion;
            this.emit('hover', hoveredRegion, this.mouse);
            this.renderEngine.shallowRender();
        } else if (this.hoveredRegion && !hoveredRegion) {
            this.hoveredRegion = null;
            this.emit('hover', null, this.mouse);
            this.renderEngine.shallowRender();
        }
    }

    getHoveredRegion() {
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

class SeparatedInteractionsEngine extends EventEmitter {
    constructor(parent, renderEngine) {
        super();

        this.parent = parent;
        this.renderEngine = renderEngine;

        parent.on('select', (...args) => this.emit('select', ...args));
        parent.on('hover', (...args) => this.emit('hover', ...args));
        parent.on('change-position-y', (...args) => this.emit('change-position-y', ...args));

        this.clearHitRegions();
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

    addHitRegion(type, data, x, y, w, h) {
        this.hitRegions.push({
            type, data, x, y, w, h
        });
    }
}
