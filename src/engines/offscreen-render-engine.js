import { deepMerge } from '../utils.js';
import { BasicRenderEngine } from './basic-render-engine.js';

export class OffscreenRenderEngine extends BasicRenderEngine {
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

    setFlexible() {
        this.flexible = true;
    }

    collapse() {
        this.collapsed = true;
        this.clear();
    }

    expand() {
        this.collapsed = false;
    }

    setSettingsOverrides(settings) {
        this.setSettings(deepMerge(this.settings, settings));
        this.children.forEach((child) => child.setSettingsOverrides(settings));
    }

    resize({ width, height, position }, isParentCall) {
        const isHeightChanged = super.resize(width, height);

        if (!isParentCall && isHeightChanged) {
            this.parent.recalcChildrenSizes();
        }

        if (typeof position === 'number') {
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

    tryToChangePosition(positionDelta) {
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
        this.resolveRectRenderQueue();
        this.resolveTextRenderQueue();
        this.resolveStrokeRenderQueue();
        //this.renderTimeGrid();
    }

    renderTooltipFromData(fields, mouse) {
        this.parent.renderTooltipFromData(fields, mouse);
    }

    renderNodeStrokeFromData(fields) {
        this.parent.renderNodeStrokeFromData(fields);
    }

    resetParentView() {
        this.parent.resetView();
        this.parent.render();
    }

    render() {
        this.parent.partialRender(this.id);
    }
}
