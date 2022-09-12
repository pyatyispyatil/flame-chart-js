import { BasicRenderEngine, RenderSettings } from './basic-render-engine';
import { OffscreenRenderEngine } from './offscreen-render-engine';
import { isNumber } from '../utils';
import UIPlugin from '../plugins/ui-plugin';

export type RenderEngineArgs = {
    canvas: HTMLCanvasElement;
    settings: RenderSettings;
    plugins: UIPlugin[];
};

interface ChildrenSizes {
    position: number;
    result: { width: number; position: number; height: number }[];
}

export class RenderEngine extends BasicRenderEngine {
    plugins: UIPlugin[];
    children: OffscreenRenderEngine[];
    requestedRenders: number[];
    freeSpace: number;
    lastPartialAnimationFrame: number | null;
    lastGlobalAnimationFrame: number | null;

    constructor({ canvas, settings, plugins }: RenderEngineArgs) {
        super(canvas, settings);

        this.plugins = plugins;

        this.children = [];
        this.requestedRenders = [];
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
        const min = this.plugins
            .map(({ min }) => min)
            .filter(isNumber)
            .reduce((acc, min) => Math.min(acc, min));

        const max = this.plugins
            .map(({ max }) => max)
            .filter(isNumber)
            .reduce((acc, max) => Math.max(acc, max));

        this.setMinMax(min, max);
    }

    override setMinMax(min: number, max: number) {
        super.setMinMax(min, max);

        this.children.forEach((engine) => engine.setMinMax(min, max));
    }

    override setSettings(data) {
        super.setSettings(data);

        if (this.children) {
            this.children.forEach((engine) => engine.setSettings(data));
            this.recalcChildrenSizes();
        }
    }

    override resize(width, height): boolean {
        const currentWidth = this.width;

        super.resize(width, height);
        this.recalcChildrenSizes();

        if (this.getInitialZoom() > this.zoom) {
            this.resetView();
        } else if (this.positionX > this.min) {
            this.tryToChangePosition(-this.pixelToTime((width - currentWidth) / 2));
        }

        return true;
    }

    recalcChildrenSizes() {
        const childrenSizes = this.getChildrenSizes();

        this.freeSpace = childrenSizes.reduce((acc, { height }) => acc - height, this.height);
        this.children.forEach((engine, index) => {
            engine.resize(childrenSizes[index], true);
        });
    }

    getChildrenSizes() {
        const indexes = this.children.map((engine, index) => index);

        const enginesTypes = indexes.map((index) => {
            const plugin = this.plugins[index];
            const engine = this.children[index];

            if (engine.flexible && plugin.height) {
                return 'flexibleStatic';
            } else if (!plugin.height) {
                return 'flexibleGrowing';
            }
            return 'static';
        });

        const freeSpace = enginesTypes.reduce((acc, type, index) => {
            const plugin = this.plugins[index];
            const engine = this.children[index];

            if (engine.collapsed) {
                return acc;
            } else if (type === 'flexibleGrowing') {
                return acc - (engine.height || 0);
            } else if (type === 'flexibleStatic') {
                return acc - (engine?.height || plugin?.height || 0);
            } else if (type === 'static') {
                return acc - (this.plugins[index]?.height ?? 0);
            }
            return acc;
        }, this.height);

        const flexibleGrowingCount = enginesTypes.filter((type) => type === 'flexibleGrowing').length;

        const freeSpacePart = Math.floor(freeSpace / flexibleGrowingCount);

        return enginesTypes.reduce<ChildrenSizes>(
            (acc, type, index) => {
                const engine = this.children[index];
                const plugin = this.plugins[index];
                let height;

                if (engine.collapsed) {
                    height = 0;
                } else {
                    switch (type) {
                        case 'static':
                            height = plugin.height;
                            break;
                        case 'flexibleGrowing':
                            height = (engine.height || 0) + freeSpacePart;
                            break;
                        case 'flexibleStatic':
                            height = engine.height || this.plugins[index].height;
                            break;
                    }
                }

                acc.result.push({
                    width: this.width,
                    position: acc.position,
                    height,
                });

                acc.position += height;

                return acc;
            },
            {
                position: 0,
                result: [],
            }
        ).result;
    }

    override setZoom(zoom: number) {
        super.setZoom(zoom);
        this.children.forEach((engine) => engine.setZoom(zoom));

        return true;
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

        const isFullRendered = plugin?.render?.();

        if (!isFullRendered) {
            engine.standardRender();
            this.plugins.forEach((plugin) => {
                if (plugin.renderSelectedNodeMask) {
                    plugin.renderSelectedNodeMask();
                }
            });
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

            if (plugin.renderTooltip) {
                tooltipRendered = tooltipRendered || Boolean(plugin.renderTooltip());
            }
            if (plugin.renderNodeStroke) {
                plugin.renderNodeStroke();
            }
        });

        if (!tooltipRendered && typeof this.options.tooltip === 'function') {
            // notify tooltip of nothing to render
            this.options.tooltip(null, this, null);
        }
    }

    render() {
        if (typeof this.lastPartialAnimationFrame === 'number') {
            cancelAnimationFrame(this.lastPartialAnimationFrame);
        }

        this.requestedRenders = [];
        this.lastPartialAnimationFrame = null;

        if (!this.lastGlobalAnimationFrame) {
            this.lastGlobalAnimationFrame = requestAnimationFrame(() => {
                this.children.forEach((engine, index) => this.renderPlugin(index));

                this.shallowRender();

                this.lastGlobalAnimationFrame = null;
            });
        }
    }
}
