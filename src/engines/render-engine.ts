import { TimeGrid } from './time-grid';
import { BasicRenderEngine, RenderSettings } from './basic-render-engine';
import { OffscreenRenderEngine } from './offscreen-render-engine';
import { isNumber } from '../utils';
import UIPlugin from '../plugins/ui-plugin';

const MAX_ACCURACY = 6;

export type RenderEngineArgs = {
    canvas: HTMLCanvasElement;
    settings: RenderSettings;
    timeGrid: TimeGrid;
    plugins: UIPlugin[];
};

type EngineTypes = 'flexibleStatic' | 'flexibleGrowing' | 'static';

type ChildrenLayout = {
    position: number;
    placements: { width: number; position: number; height: number; type: EngineTypes }[];
    freeSpace: number;
};

export class RenderEngine extends BasicRenderEngine {
    plugins: UIPlugin[];
    children: OffscreenRenderEngine[];
    requestedRenders: number[];
    timeGrid: TimeGrid;
    freeSpace = 0;
    lastPartialAnimationFrame: number | null = null;
    lastGlobalAnimationFrame: number | null = null;

    constructor({ canvas, settings, timeGrid, plugins }: RenderEngineArgs) {
        super(canvas, settings);

        this.plugins = plugins;

        this.children = [];
        this.requestedRenders = [];

        this.timeGrid = timeGrid;
        this.timeGrid.setDefaultRenderEngine(this);
    }

    makeInstance() {
        const offscreenRenderEngine = new OffscreenRenderEngine({
            width: this.width,
            height: 0,
            id: this.children.length,
            parent: this,
        });

        offscreenRenderEngine.setMinMax(this.min, this.max);
        offscreenRenderEngine.resetView();

        this.children.push(offscreenRenderEngine);

        return offscreenRenderEngine;
    }

    calcMinMax() {
        const mins = this.plugins.map(({ min }) => min).filter(isNumber);
        const min = mins.length ? mins.reduce((acc, min) => Math.min(acc, min)) : 0;

        const maxs = this.plugins.map(({ max }) => max).filter(isNumber);
        const max = maxs.length ? maxs.reduce((acc, max) => Math.max(acc, max)) : 0;

        this.setMinMax(min, max);
    }

    calcTimeGrid() {
        this.timeGrid.recalc();
    }

    override setMinMax(min: number, max: number) {
        super.setMinMax(min, max);

        this.children.forEach((engine) => engine.setMinMax(min, max));
    }

    override setSettings(data: RenderSettings) {
        super.setSettings(data);

        if (this.children) {
            this.children.forEach((engine) => engine.setSettings(data));
            this.recalcChildrenLayout();
        }
    }

    override resize(width: number, height: number): boolean {
        const currentWidth = this.width;

        super.resize(width, height);
        this.recalcChildrenLayout();

        if (this.getInitialZoom() > this.zoom) {
            this.resetView();
        } else if (this.positionX > this.min) {
            this.tryToChangePosition(-this.pixelToTime((width - currentWidth) / 2));
        }

        return true;
    }

    recalcChildrenLayout() {
        const childrenLayout = this.getChildrenLayout();

        if (childrenLayout.freeSpace > 0) {
            this.expandGrowingChildrenLayout(childrenLayout);
        } else if (childrenLayout.freeSpace < 0) {
            this.truncateChildrenLayout(childrenLayout);
        }

        this.freeSpace = childrenLayout.freeSpace;
        this.children.forEach((engine, index) => {
            engine.resize(childrenLayout.placements[index], true);
        });
    }

    getChildrenLayout() {
        return this.children.reduce<ChildrenLayout>(
            (acc, engine, index) => {
                const plugin = this.plugins[index];
                const pluginHeight = plugin.fullHeight;
                let type: EngineTypes = 'static';
                let height = 0;

                if (engine.flexible && typeof plugin.height === 'number') {
                    type = 'flexibleStatic';
                } else if (plugin.height === 'flexible') {
                    type = 'flexibleGrowing';
                }

                if (engine.collapsed) {
                    height = 0;
                } else {
                    switch (type) {
                        case 'static':
                            height = pluginHeight;
                            break;
                        case 'flexibleGrowing':
                            height = engine.height || 0;
                            break;
                        case 'flexibleStatic':
                            height = (engine.height || pluginHeight) ?? 0;
                            break;
                    }
                }

                acc.placements.push({
                    width: this.width,
                    position: acc.position,
                    height,
                    type,
                });

                acc.position += height;
                acc.freeSpace -= height;

                return acc;
            },
            {
                position: 0,
                placements: [],
                freeSpace: this.height,
            },
        );
    }

    expandGrowingChildrenLayout(childrenLayout: ChildrenLayout) {
        const { placements, freeSpace } = childrenLayout;

        const last = placements[placements.length - 1];
        const growingChildren = placements.map(
            ({ type, height }, index) => type === 'flexibleGrowing' && !this.children[index].collapsed && height === 0,
        );
        const growingChildrenCount = growingChildren.filter(Boolean).length;

        if (growingChildrenCount) {
            const vacantSpacePart = Math.max(0, Math.floor(freeSpace / growingChildrenCount));

            growingChildren.forEach((isGrowing, index) => {
                if (isGrowing) {
                    placements[index].height += vacantSpacePart;
                    childrenLayout.freeSpace -= vacantSpacePart;

                    for (let nextIndex = index + 1; nextIndex < placements.length; nextIndex++) {
                        placements[nextIndex].position += vacantSpacePart;
                    }
                }
            });
        }

        if (last.type === 'flexibleGrowing' && !this.children[this.children.length - 1].collapsed) {
            last.height = Math.max(0, this.height - last.position);
            childrenLayout.freeSpace = 0;
        }

        return childrenLayout;
    }

    truncateChildrenLayout(childrenLayout: ChildrenLayout) {
        const { placements, freeSpace } = childrenLayout;

        let diff = Math.abs(freeSpace);

        while (diff > 0) {
            const lastFlexibleIndex = placements.findLastIndex(({ height, type }) => height > 0 && type !== 'static');

            if (lastFlexibleIndex !== -1) {
                const size = placements[lastFlexibleIndex];
                const newHeight = Math.max(0, size.height - diff);
                const delta = size.height - newHeight;

                size.height = newHeight;
                diff -= delta;
                childrenLayout.freeSpace += delta;

                placements.forEach((size, index) => {
                    if (index > lastFlexibleIndex) {
                        size.position -= delta;
                    }
                });
            }
        }

        return childrenLayout;
    }

    getAccuracy() {
        return this.timeGrid.accuracy;
    }

    override setZoom(zoom: number) {
        if (this.getAccuracy() < MAX_ACCURACY || zoom <= this.zoom) {
            super.setZoom(zoom);
            this.children.forEach((engine) => engine.setZoom(zoom));

            return true;
        }

        return false;
    }

    override setPositionX(x: number) {
        const res = super.setPositionX(x);

        this.children.forEach((engine) => engine.setPositionX(x));

        return res;
    }

    renderPlugin(index: number) {
        const plugin = this.plugins[index];
        const engine = this.children[index];

        engine?.clear();

        if (!engine.collapsed) {
            const isFullRendered = plugin?.render?.();

            if (!isFullRendered) {
                engine.standardRender();
            }
        }
    }

    partialRender(id?: number) {
        if (typeof id === 'number') {
            this.requestedRenders.push(id);
        }

        if (!this.lastPartialAnimationFrame) {
            this.lastPartialAnimationFrame = requestAnimationFrame(() => {
                this.requestedRenders.forEach((index) => this.renderPlugin(index));

                this.shallowRender();

                this.requestedRenders = [];

                this.lastPartialAnimationFrame = null;
            });
        }
    }

    shallowRender() {
        this.clear();

        this.timeGrid.renderLines(this.height - this.freeSpace, this.freeSpace);

        this.children.forEach((engine) => {
            if (!engine.collapsed) {
                this.copy(engine);
            }
        });
        let tooltipRendered = false;

        this.plugins.forEach((plugin) => {
            if (plugin.postRender) {
                plugin.postRender();
            }
        });

        this.plugins.forEach((plugin) => {
            if (plugin.renderTooltip) {
                tooltipRendered = tooltipRendered || Boolean(plugin.renderTooltip());
            }
        });

        if (!tooltipRendered && typeof this.options.tooltip === 'function') {
            // notify tooltip of nothing to render
            this.options.tooltip(null, this, null);
        }
    }

    render(prepare?: () => void) {
        if (typeof this.lastPartialAnimationFrame === 'number') {
            cancelAnimationFrame(this.lastPartialAnimationFrame);
        }

        this.requestedRenders = [];
        this.lastPartialAnimationFrame = null;

        if (!this.lastGlobalAnimationFrame) {
            this.lastGlobalAnimationFrame = requestAnimationFrame(() => {
                prepare?.();

                this.timeGrid.recalc();

                this.children.forEach((_, index) => this.renderPlugin(index));

                this.shallowRender();

                this.lastGlobalAnimationFrame = null;
            });
        }
    }
}
