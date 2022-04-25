import {
    metaClusterizeFlatTree,
    flatTree,
    clusterizeFlatTree,
    getFlatTreeMinMax,
    reclusterizeClusteredFlatTree
} from './utils/tree-clusters.js';
import { deepMerge } from '../utils.js';
import { TimeGrid } from '../engines/time-grid.js';

const walk = (treeList, cb, parent = null, level = 0) => {
    treeList.forEach((child) => {
        const res = cb(child, parent, level);

        if (child.children) {
            walk(child.children, cb, res || child, level + 1);
        }
    });
}

export const defaultTimeframeSelectorPluginSettings = {
    styles: {
        timeframeSelectorPlugin: {
            font: '9px sans-serif',
            fontColor: 'black',            
            overlayColor: 'rgba(112, 112, 112, 0.5)',
            graphStrokeColor: 'rgb(0, 0, 0, 0.2)',
            graphFillColor: 'rgb(0, 0, 0, 0.25)',
            bottomLineColor: 'rgb(0, 0, 0, 0.25)',
            knobColor: 'rgb(131, 131, 131)',
            knobStrokeColor: 'white',
            knobSize: 6,
            height: 60,
            backgroundColor: 'white'
        }
    }
}

export default class TimeframeSelectorPlugin {
    constructor(data, settings = {}) {
        this.data = data;
        this.settings = settings;
        this.shouldRender = true;
    }

    init(renderEngine, interactionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;

        this.interactionsEngine.on('down', this.handleMouseDown.bind(this));
        this.interactionsEngine.on('up', this.handleMouseUp.bind(this));
        this.interactionsEngine.on('move', this.handleMouseMove.bind(this));

        this.setSettings(this.settings);
    }

    handleMouseDown(region, mouse) {
        if (region) {
            if (region.type === 'timeframeKnob') {
                if (region.data === 'left') {
                    this.leftKnobMoving = true;
                } else {
                    this.rightKnobMoving = true;
                }

                this.interactionsEngine.setCursor('ew-resize');
            } else if (region.type === 'timeframeArea') {
                this.selectingActive = true;
                this.startSelectingPosition = mouse.x;
            }
        }
    }

    handleMouseUp(region, mouse, isClick) {
        let isDoubleClick = false;

        if (this.timeout) {
            isDoubleClick = true;
        }

        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.timeout = null, 300);
        this.leftKnobMoving = false;
        this.rightKnobMoving = false;
        this.interactionsEngine.clearCursor();

        if (this.selectingActive && !isClick) {
            this.applyChanges();
        }

        this.selectingActive = false;

        if (isClick && !isDoubleClick) {
            const rightKnobPosition = this.getRightKnobPosition();
            const leftKnobPosition = this.getLeftKnobPosition();

            if (mouse.x > rightKnobPosition) {
                this.setRightKnobPosition(mouse.x);
            } else if (mouse.x > leftKnobPosition && mouse.x < rightKnobPosition) {
                if (mouse.x - leftKnobPosition > rightKnobPosition - mouse.x) {
                    this.setRightKnobPosition(mouse.x);
                } else {
                    this.setLeftKnobPosition(mouse.x);
                }
            } else {
                this.setLeftKnobPosition(mouse.x);
            }

            this.applyChanges();
        }

        if (isDoubleClick) {
            this.renderEngine.parent.setZoom(this.renderEngine.getInitialZoom());
            this.renderEngine.parent.setPositionX(this.renderEngine.min);
            this.renderEngine.parent.render();
        }
    }

    handleMouseMove(region, mouse) {
        if (this.leftKnobMoving) {
            this.setLeftKnobPosition(mouse.x);
            this.applyChanges();
        }

        if (this.rightKnobMoving) {
            this.setRightKnobPosition(mouse.x);
            this.applyChanges();
        }

        if (this.selectingActive) {
            if (this.startSelectingPosition >= mouse.x) {
                this.setLeftKnobPosition(mouse.x);
                this.setRightKnobPosition(this.startSelectingPosition);
            } else {
                this.setRightKnobPosition(mouse.x);
                this.setLeftKnobPosition(this.startSelectingPosition);
            }

            this.renderEngine.render();
        }
    }

    postInit() {
        this.offscreenRenderEngine = this.renderEngine.makeChild();
        this.offscreenRenderEngine.setSettingsOverrides({ styles: { main: this.styles } });
        this.timeGrid = new TimeGrid(this.offscreenRenderEngine, this.settings);

        this.offscreenRenderEngine.on('resize', () => {
            this.offscreenRenderEngine.setZoom(this.renderEngine.getInitialZoom());
            this.offscreenRender();
        });

        this.offscreenRenderEngine.on('min-max-change', () => this.shouldRender = true);

        this.setData(this.data);
    }

    setLeftKnobPosition(mouseX) {
        const maxPosition = this.getRightKnobPosition();

        if (mouseX < maxPosition - 1) {
            const realView = this.renderEngine.getRealView();
            const delta = this.renderEngine.setPositionX(this.offscreenRenderEngine.pixelToTime(mouseX) + this.renderEngine.min);
            const zoom = this.renderEngine.width / (realView - delta);

            this.renderEngine.setZoom(zoom);
        }
    }

    setRightKnobPosition(mouseX) {
        const minPosition = this.getLeftKnobPosition();

        if (mouseX > minPosition + 1) {
            const realView = this.renderEngine.getRealView();
            const delta = (this.renderEngine.positionX + realView) - (this.offscreenRenderEngine.pixelToTime(mouseX) + this.renderEngine.min);
            const zoom = this.renderEngine.width / (realView - delta);

            this.renderEngine.setZoom(zoom);
        }
    }

    getLeftKnobPosition() {
        return (this.renderEngine.positionX - this.renderEngine.min) * this.renderEngine.getInitialZoom();
    }

    getRightKnobPosition() {
        return (this.renderEngine.positionX - this.renderEngine.min + this.renderEngine.getRealView()) * this.renderEngine.getInitialZoom();
    }

    applyChanges() {
        this.renderEngine.parent.setPositionX(this.renderEngine.positionX);
        this.renderEngine.parent.setZoom(this.renderEngine.zoom);
        this.renderEngine.parent.render();
    }

    setSettings(settings) {
        this.settings = deepMerge(defaultTimeframeSelectorPluginSettings, settings);
        this.styles = this.settings.styles.timeframeSelectorPlugin;

        this.height = this.styles.height;

        if (this.offscreenRenderEngine) {
            this.offscreenRenderEngine.setSettingsOverrides({ styles: { main: this.styles } });
            this.timeGrid.setSettings({ styles: { timeGrid: this.styles } });
        }

        this.shouldRender = true;
    }

    setData(data) {
        this.data = data;

        const dots = [];
        const tree = flatTree(this.data);
        const { min, max } = getFlatTreeMinMax(tree);

        let maxLevel = 0;

        this.min = min;
        this.max = max;

        this.clusters = metaClusterizeFlatTree(tree, () => true);
        this.actualClusters = clusterizeFlatTree(
            this.clusters,
            this.renderEngine.zoom,
            this.min,
            this.max,
            2,
            Infinity
        );
        this.actualClusterizedFlatTree = reclusterizeClusteredFlatTree(
            this.actualClusters,
            this.renderEngine.zoom,
            this.min,
            this.max,
            2,
            Infinity
        ).sort((a, b) => a.start - b.start);

        this.actualClusterizedFlatTree.forEach(({ start, end, level }, index) => {
            if (maxLevel < level + 1) {
                maxLevel = level + 1;
            }

            dots.push({
                pos: start,
                sort: 0,
                level: level,
                index,
                type: 'start'
            }, {
                pos: start,
                sort: 1,
                level: level + 1,
                index,
                type: 'start'
            }, {
                pos: end,
                sort: 2,
                level: level + 1,
                index,
                type: 'end'
            }, {
                pos: end,
                sort: 3,
                level: level,
                index,
                type: 'end'
            });
        });

        this.dots = dots
            .sort((a, b) => {
                if (a.pos !== b.pos) {
                    return a.pos - b.pos;
                } else {
                    if (a.index === b.index) {
                        return a.sort - b.sort;
                    } else {
                        if (a.type === 'start' && b.type === 'start') {
                            return a.level - b.level;
                        } else if (a.type === 'end' && b.type === 'end') {
                            return b.level - a.level;
                        } else {
                            return 0;
                        }
                    }
                }
            })

        this.maxLevel = maxLevel;

        this.offscreenRender();
    }

    offscreenRender() {
        const zoom = this.zoom ? this.zoom : this.offscreenRenderEngine.getInitialZoom();
        const positionX = this.renderEngine.positionX || this.offscreenRenderEngine.min;

        this.offscreenRenderEngine.setZoom(zoom);
        this.offscreenRenderEngine.setPositionX(positionX);
        this.offscreenRenderEngine.clear();

        this.timeGrid.recalc();
        this.timeGrid.renderLines(0, this.offscreenRenderEngine.height);
        this.timeGrid.renderTimes();

        this.offscreenRenderEngine.setStrokeColor(this.styles.graphStrokeColor);
        this.offscreenRenderEngine.setCtxColor(this.styles.graphFillColor);
        this.offscreenRenderEngine.ctx.beginPath();

        const levelHeight = (this.height - this.renderEngine.charHeight - 4) / this.maxLevel;

        if (this.dots.length) {
            this.offscreenRenderEngine.ctx.moveTo((this.dots[0].pos - this.offscreenRenderEngine.min) * zoom, this.castLevelToHeight(this.dots[0].level, levelHeight));

            this.dots.forEach((dot) => {
                const { pos, level } = dot;

                this.offscreenRenderEngine.ctx.lineTo((pos - this.offscreenRenderEngine.min) * zoom, this.castLevelToHeight(level, levelHeight));
            });
        }

        this.offscreenRenderEngine.ctx.closePath();

        this.offscreenRenderEngine.ctx.stroke();
        this.offscreenRenderEngine.ctx.fill();

        this.offscreenRenderEngine.setCtxColor(this.styles.bottomLineColor);
        this.offscreenRenderEngine.ctx.fillRect(0, this.height - 1, this.offscreenRenderEngine.width, 1);
    }

    castLevelToHeight(level, levelHeight) {
        return level * levelHeight;
    }

    renderTimeframe() {
        const relativePositionX = this.renderEngine.positionX - this.renderEngine.min;

        const currentLeftPosition = relativePositionX * this.renderEngine.getInitialZoom();
        const currentRightPosition = (relativePositionX + this.renderEngine.getRealView()) * this.renderEngine.getInitialZoom();
        const currentLeftKnobPosition = currentLeftPosition - this.styles.knobSize / 2;
        const currentRightKnobPosition = currentRightPosition - this.styles.knobSize / 2;
        const knobHeight = this.renderEngine.height / 3;

        this.renderEngine.setCtxColor(this.styles.overlayColor);
        this.renderEngine.fillRect(0, 0, currentLeftPosition, this.renderEngine.height);
        this.renderEngine.fillRect(currentRightPosition, 0, this.renderEngine.width - currentRightPosition, this.renderEngine.height);

        this.renderEngine.setCtxColor(this.styles.overlayColor);
        this.renderEngine.fillRect(currentLeftPosition - 1, 0, 1, this.renderEngine.height);
        this.renderEngine.fillRect(currentRightPosition + 1, 0, 1, this.renderEngine.height);

        this.renderEngine.setCtxColor(this.styles.knobColor);
        this.renderEngine.fillRect(currentLeftKnobPosition, 0, this.styles.knobSize, knobHeight);
        this.renderEngine.fillRect(currentRightKnobPosition, 0, this.styles.knobSize, knobHeight);

        this.renderEngine.renderStroke(this.styles.knobStrokeColor, currentLeftKnobPosition, 0, this.styles.knobSize, knobHeight);
        this.renderEngine.renderStroke(this.styles.knobStrokeColor, currentRightKnobPosition, 0, this.styles.knobSize, knobHeight);

        this.interactionsEngine.addHitRegion('timeframeKnob', 'left', currentLeftKnobPosition, 0, this.styles.knobSize, knobHeight, 'ew-resize');
        this.interactionsEngine.addHitRegion('timeframeKnob', 'right', currentRightKnobPosition, 0, this.styles.knobSize, knobHeight, 'ew-resize');
        this.interactionsEngine.addHitRegion('timeframeArea', null, 0, 0, this.renderEngine.width, this.renderEngine.height, 'text');
    }

    render() {
        if (this.shouldRender) {
            this.shouldRender = false;
            this.offscreenRender();
        }

        this.renderEngine.copy(this.offscreenRenderEngine);
        this.renderTimeframe();

        return true;
    }
}
