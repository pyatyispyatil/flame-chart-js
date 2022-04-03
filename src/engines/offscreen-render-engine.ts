import { deepMerge } from '../utils';
import { BasicRenderEngine } from './basic-render-engine';
import { RenderEngine } from './render-engine';

interface OffscreenRenderEngineOptions {
    width: number;
    height: number;
    parent: RenderEngine;
    id: number;
}

export class OffscreenRenderEngine extends BasicRenderEngine {
    parent;
    id: number;
    children;
    flexible: boolean;
    collapsed: boolean;
    position: number;
    constructor({ width, height, parent, id }: OffscreenRenderEngineOptions) {
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
            parent: this.parent,
            id: void 0,
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

    // @ts-ignore - overrides a parent function which has different signature
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

    override setMinMax(min: number, max: number) {
        super.setMinMax(min, max);
        this.children.forEach((child) => child.setMinMax(min, max));
    }

    override setSettings(settings) {
        super.setSettings(settings);

        if (this.children) {
            this.children.forEach((child) => child.setSettings(settings));
        }
    }

    override tryToChangePosition(positionDelta: number) {
        this.parent.tryToChangePosition(positionDelta);
    }

    recalcMinMax() {
        this.parent.calcMinMax();
    }

    override getTimeUnits() {
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
        this.renderTimeGrid();
    }

    override renderTooltipFromData(fields, mouse) {
        this.parent.renderTooltipFromData(fields, mouse);
    }

    resetParentView() {
        this.parent.resetView();
        this.parent.render();
    }

    render() {
        this.parent.partialRender(this.id);
    }
}
