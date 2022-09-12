/* eslint-disable @typescript-eslint/ban-ts-comment */
import { mergeObjects } from '../utils';
import { RenderSettings, BasicRenderEngine } from './basic-render-engine';
import { RenderEngine } from './render-engine';
import { Mouse, TooltipField } from '../types';

interface OffscreenRenderEngineOptions {
    width: number;
    height: number;
    parent: RenderEngine;
    id: number | undefined;
}

export class OffscreenRenderEngine extends BasicRenderEngine {
    parent: RenderEngine;
    id: number | undefined;
    children: OffscreenRenderEngine[];
    flexible: boolean;
    collapsed: boolean;
    position: number;

    constructor({ width, height, parent, id }: OffscreenRenderEngineOptions) {
        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        super(canvas, { options: parent.options, styles: parent.styles });

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

    setSettingsOverrides(settings: RenderSettings) {
        this.setSettings({
            styles: mergeObjects(this.styles, settings.styles),
            options: mergeObjects(this.options, settings.options),
        });
        this.children.forEach((child) => child.setSettingsOverrides(settings));
    }

    // @ts-ignore - overrides a parent function which has different signature
    override resize(
        { width, height, position }: { width?: number; height?: number; position?: number },
        isParentCall?: boolean
    ) {
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

    override setSettings(settings: RenderSettings) {
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

    override getInverted() {
        return this.parent.getInverted();
    }

    getAccuracy() {
        return 0;
    }

    standardRender() {
        this.resolveRectRenderQueue();
        this.resolveTextRenderQueue();
        this.resolveStrokeRenderQueue();
    }

    override renderTooltipFromData(fields: TooltipField[], mouse: Mouse) {
        this.parent.renderTooltipFromData(fields, mouse);
    }

    override renderNodeStrokeFromData(fields) {
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
