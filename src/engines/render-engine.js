import { TimeGrid } from './time-grid.js';
import { BasicRenderEngine } from './basic-render-engine.js';
import { OffscreenRenderEngine } from './offscreen-render-engine.js';
import { isNumber } from '../utils.js';

const MAX_ACCURACY = 6;

export class RenderEngine extends BasicRenderEngine {
    constructor(canvas, settings, plugins) {
        super(canvas, settings);

        this.plugins = plugins;

        this.childEngines = [];
        this.requestedRenders = [];

        this.timeGrid = new TimeGrid(this, settings);
    }

    makeInstance() {
        const offscreenRenderEngine = new OffscreenRenderEngine({
            width: this.width,
            height: 0,
            id: this.childEngines.length,
            parent: this,
            settings: this.settings
        });

        offscreenRenderEngine.setMinMax(this.min, this.max);
        offscreenRenderEngine.resetView();

        this.childEngines.push(offscreenRenderEngine);

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

    calcTimeGrid() {
        this.timeGrid.recalc();
    }

    setMinMax(min, max) {
        super.setMinMax(min, max);

        this.childEngines.forEach((engine) => engine.setMinMax(min, max));
    }

    setSettings(data) {
        super.setSettings(data);

        this.settings = data;

        if (this.timeGrid) {
            this.timeGrid.setSettings(data);
        }

        if (this.childEngines) {
            this.childEngines.forEach((engine) => engine.setSettings(data));
            this.plugins.forEach((plugin) => plugin.setSettings && plugin.setSettings(data));
            this.recalcChildrenSizes();
        }
    }

    resize(width, height) {
        const currentWidth = this.width;

        super.resize(width, height);
        this.recalcChildrenSizes();

        if (this.getInitialZoom() > this.zoom) {
            this.resetView();
        } else if (this.positionX > this.min) {
            this.tryToChangePosition(-this.pixelToTime((width - currentWidth) / 2));
        }
    }

    recalcChildrenSizes() {
        const childrenSizes = this.getChildrenSizes();

        this.freeSpace = childrenSizes.reduce((acc, { height }) => acc - height, this.height);
        this.childEngines.forEach((engine, index) => {
            engine.resize(childrenSizes[index], true);
        });
    }

    getChildrenSizes() {
        const indexes = this.childEngines.map((engine, index) => index);

        const enginesTypes = indexes.map((index) => {
            const plugin = this.plugins[index];
            const engine = this.childEngines[index];

            if (engine.flexible && !plugin.height) {
                return 'flexibleGrowing';
            } else if (engine.flexible && plugin.height) {
                return 'flexibleStatic';
            } else {
                return 'static';
            }
        });

        const freeSpace = enginesTypes.reduce((acc, type, index) => {
            const plugin = this.plugins[index];
            const engine = this.childEngines[index];

            if (engine.collapsed) {
                return acc;
            } else if (type === 'flexibleGrowing') {
                return acc - (engine.height || 0);
            } else if (type === 'flexibleStatic') {
                return acc - (engine.height || plugin.height);
            } else if (type === 'static') {
                return acc - this.plugins[index].height;
            } else {
                return acc;
            }
        }, this.height);

        const flexibleGrowingCount = enginesTypes.filter((type) => type === 'flexibleGrowing').length;

        const freeSpacePart = Math.floor(freeSpace / flexibleGrowingCount);

        return enginesTypes
            .reduce((acc, type, index) => {
                const engine = this.childEngines[index];
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
                    height
                });

                acc.position += height;

                return acc;
            }, {
                position: 0,
                result: []
            }).result;
    }

    getAccuracy() {
        return this.timeGrid.accuracy;
    }

    setZoom(zoom) {
        if (this.getAccuracy() < MAX_ACCURACY || zoom <= this.zoom) {
            super.setZoom(zoom);
            this.childEngines.forEach((engine) => engine.setZoom(zoom));

            return true;
        }

        return false;
    }

    setPositionX(x) {
        const res = super.setPositionX(x);
        this.childEngines.forEach((engine) => engine.setPositionX(x));

        return res;
    }

    renderPlugin(index) {
        const plugin = this.plugins[index];
        const engine = this.childEngines[index];

        engine.clear();

        if (!engine.collapsed) {
            const isFullRendered = plugin.render();

            if (!isFullRendered) {
                engine.standardRender();
            }
        }
    }

    partialRender(id) {
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

        this.childEngines.forEach((engine) => {
            if (!engine.collapsed) {
                this.copy(engine);
            }
        });

        this.plugins.forEach((plugin) => {
            if (plugin.postRender) {
                plugin.postRender();
            }

            if (plugin.renderTooltip) {
                plugin.renderTooltip();
            }
        });
    }

    render() {
        cancelAnimationFrame(this.lastPartialAnimationFrame);

        this.requestedRenders = [];
        this.lastPartialAnimationFrame = null;

        if (!this.lastGlobalAnimationFrame) {
            this.lastGlobalAnimationFrame = requestAnimationFrame(() => {
                this.timeGrid.recalc();

                this.childEngines.forEach((engine, index) => this.renderPlugin(index));

                this.shallowRender();

                this.lastGlobalAnimationFrame = null;
            });
        }
    }
}
