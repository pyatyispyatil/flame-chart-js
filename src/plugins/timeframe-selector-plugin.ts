import {
    metaClusterizeFlatTree,
    flatTree,
    clusterizeFlatTree,
    getFlatTreeMinMax,
    reclusterizeClusteredFlatTree
} from './utils/tree-clusters.js';
import { deepMerge } from '../utils.js';
import { TimeGrid } from '../engines/time-grid';
import {Data, Mouse, ClusterizedFlatTree} from "../types";
import {InteractionsEngine, SeparatedInteractionsEngine} from "../engines/interactions-engine";
import { OffscreenRenderEngine } from "../engines/render-engine";

interface Dot {
    pos: number;
    sort: number;
    level: number;
    index: number;
    type: 'start'| 'end';
}

export const defaultTimeframeSelectorPluginSettings = {
    styles: {
        timeframeSelectorPlugin: {
            font: '9px sans-serif',
            fontColor: 'black',
            overlayColor: 'rgba(112,112,112,0.5)',
            knobColor: 'rgb(131,131,131)',
            knobSize: 6,
            height: 60,
            backgroundColor: 'white'
        }
    }
}

export default class TimeframeSelectorPlugin {
    max = 0;
    min = 0;

    private data: Data;
    private settings: Record<any, any>;
    private shouldRender: boolean;
    private renderEngine: OffscreenRenderEngine | undefined;
    private interactionsEngine: SeparatedInteractionsEngine | undefined;
    private leftKnobMoving = false;
    private rightKnobMoving = false;
    private selectingActive = false;
    private startSelectingPosition = 0;
    private timeout: number | null = null;
    private offscreenRenderEngine: OffscreenRenderEngine | undefined;
    private timeGrid: TimeGrid | undefined;
    // TODO: fix this type with more accurate one
    private styles: Record<any, any> = {};
    private height = 0;
    private clusters: any[] = [];
    private actualClusters: any[] = [];
    private actualClusterizedFlatTree: ClusterizedFlatTree[] = [];
    private dots: Dot[] = [];
    private maxLevel = 0;

    constructor(data: Data, settings: Record<any, any> = {}) {
        this.data = data;
        this.settings = settings;
        this.shouldRender = true;
    }

    init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;

        this.interactionsEngine.on('down', (region: any, mouse: Mouse) => {
            if (region) {
                if (region.type === 'timeframeKnob') {
                    if (region.data === 'left') {
                        this.leftKnobMoving = true;
                    } else {
                        this.rightKnobMoving = true;
                    }

                    // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
                    this.interactionsEngine.setCursor('ew-resize');
                } else if (region.type === 'timeframeArea') {
                    this.selectingActive = true;
                    this.startSelectingPosition = mouse.x;
                }
            }
        });

        this.interactionsEngine.on('up', (region, mouse, isClick) => {
            let isDoubleClick = false;

            if (this.timeout) {
                isDoubleClick = true;
            }

            if (typeof this.timeout === "number") {
                clearTimeout(this.timeout);
            }

            this.timeout = setTimeout(() => this.timeout = null, 300);
            this.leftKnobMoving = false;
            this.rightKnobMoving = false;

            // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
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
                // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
                this.renderEngine.parent.setZoom(this.renderEngine.getInitialZoom());
                // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
                this.renderEngine.parent.setPositionX(this.renderEngine.min);
                // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
                this.renderEngine.parent.render();
            }
        });

        this.interactionsEngine.on('move', (region: any, mouse: Mouse) => {
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

                // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
                this.renderEngine.render();
            }
        });

        this.setSettings(this.settings);
    }

    postInit() {
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.offscreenRenderEngine = this.renderEngine.makeChild();

        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.timeGrid = new TimeGrid(this.offscreenRenderEngine, this.settings);

        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.offscreenRenderEngine.on('resize', () => {

            // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
            this.offscreenRenderEngine.setZoom(this.renderEngine.getInitialZoom());
            this.offscreenRender();
        });

        this.setData(this.data);
    }

    setLeftKnobPosition(mouseX: number) {
        const maxPosition = this.getRightKnobPosition();

        if (mouseX < maxPosition - 1) {
            // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
            const realView = this.renderEngine.getRealView();
            // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
            const delta = this.renderEngine.setPositionX(this.offscreenRenderEngine.pixelToTime(mouseX) + this.renderEngine.min);
            // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
            const zoom = this.renderEngine.width / (realView - delta);

            // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
            this.renderEngine.setZoom(zoom);
        }
    }

    setRightKnobPosition(mouseX: number) {
        const minPosition = this.getLeftKnobPosition();

        if (mouseX > minPosition + 1) {
            // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
            const realView = this.renderEngine.getRealView();
            // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
            const delta = (this.renderEngine.positionX + realView) - (this.offscreenRenderEngine.pixelToTime(mouseX) + this.renderEngine.min);
            // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
            const zoom = this.renderEngine.width / (realView - delta);

            // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
            this.renderEngine.setZoom(zoom);
        }
    }

    getLeftKnobPosition() {
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        return (this.renderEngine.positionX - this.renderEngine.min) * this.renderEngine.getInitialZoom();
    }

    getRightKnobPosition() {
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        return (this.renderEngine.positionX - this.renderEngine.min + this.renderEngine.getRealView()) * this.renderEngine.getInitialZoom();
    }

    applyChanges() {
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.renderEngine.parent.setPositionX(this.renderEngine.positionX);
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.renderEngine.parent.setZoom(this.renderEngine.zoom);
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.renderEngine.parent.render();
    }

    setSettings(settings) {
        this.settings = deepMerge(defaultTimeframeSelectorPluginSettings, settings);
        this.styles = this.settings.styles.timeframeSelectorPlugin;

        this.height = this.styles.height;

        if (this.offscreenRenderEngine) {
            this.offscreenRenderEngine.setSettingsOverrides({ styles: { main: this.styles } });
            // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
            this.timeGrid.setSettings(settings);
        }

        this.shouldRender = true;
    }

    setData(data) {
        this.data = data;

        const dots: Dot[] = [];
        const tree = flatTree(this.data);
        const { min, max } = getFlatTreeMinMax(tree);

        let maxLevel = 0;

        this.min = min;
        this.max = max;

        this.clusters = metaClusterizeFlatTree(tree, () => true);
        this.actualClusters = clusterizeFlatTree(
            this.clusters,
            // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
            this.renderEngine.zoom,
            this.min,
            this.max,
            2,
            Infinity
        );
        this.actualClusterizedFlatTree = reclusterizeClusteredFlatTree(
            this.actualClusters,
            // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
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
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        const zoom = this.offscreenRenderEngine.getInitialZoom();

        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.offscreenRenderEngine.clear();

        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.timeGrid.recalc();
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.timeGrid.renderLines(0, this.offscreenRenderEngine.height);
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.timeGrid.renderTimes();

        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.offscreenRenderEngine.ctx.strokeStyle = `rgb(0, 0, 0, 0.2)`;
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.offscreenRenderEngine.setCtxColor(`rgb(0, 0, 0, 0.25)`);
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.offscreenRenderEngine.ctx.beginPath();

        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        const levelHeight = (this.height - this.renderEngine.charHeight - 4) / this.maxLevel;

        if (this.dots.length) {
            // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
            this.offscreenRenderEngine.ctx.moveTo((this.dots[0].pos - this.offscreenRenderEngine.min) * zoom, this.castLevelToHeight(this.dots[0].level, levelHeight));

            this.dots.forEach((dot) => {
                const { pos, level } = dot;

                // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
                this.offscreenRenderEngine.ctx.lineTo((pos - this.offscreenRenderEngine.min) * zoom, this.castLevelToHeight(level, levelHeight));
            });
        }

        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.offscreenRenderEngine.ctx.closePath();

        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.offscreenRenderEngine.ctx.stroke();
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.offscreenRenderEngine.ctx.fill();
    }

    castLevelToHeight(level: number, levelHeight: number) {
        return this.height - (level * levelHeight);
    }

    renderTimeframe() {
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        const relativePositionX = this.renderEngine.positionX - this.renderEngine.min;

        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        const currentLeftPosition = relativePositionX * this.renderEngine.getInitialZoom();
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        const currentRightPosition = (relativePositionX + this.renderEngine.getRealView()) * this.renderEngine.getInitialZoom();
        const currentLeftKnobPosition = currentLeftPosition - this.styles.knobSize / 2;
        const currentRightKnobPosition = currentRightPosition - this.styles.knobSize / 2;
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        const knobHeight = this.renderEngine.height / 3;

        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.renderEngine.setCtxColor(this.styles.overlayColor);
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.renderEngine.fillRect(0, 0, currentLeftPosition, this.renderEngine.height);
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.renderEngine.fillRect(currentRightPosition, 0, this.renderEngine.width - currentRightPosition, this.renderEngine.height);

        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.renderEngine.setCtxColor(this.styles.overlayColor);
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.renderEngine.fillRect(currentLeftPosition - 1, 0, 1, this.renderEngine.height);
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.renderEngine.fillRect(currentRightPosition + 1, 0, 1, this.renderEngine.height);

        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.renderEngine.setCtxColor(this.styles.knobColor);
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.renderEngine.fillRect(currentLeftKnobPosition, 0, this.styles.knobSize, knobHeight);
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.renderEngine.fillRect(currentRightKnobPosition, 0, this.styles.knobSize, knobHeight);

        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.renderEngine.renderStroke('white', currentLeftKnobPosition, 0, this.styles.knobSize, knobHeight);
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.renderEngine.renderStroke('white', currentRightKnobPosition, 0, this.styles.knobSize, knobHeight);

        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.interactionsEngine.clearHitRegions();
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.interactionsEngine.addHitRegion('timeframeKnob', 'left', currentLeftKnobPosition, 0, this.styles.knobSize, knobHeight, 'ew-resize');
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.interactionsEngine.addHitRegion('timeframeKnob', 'right', currentRightKnobPosition, 0, this.styles.knobSize, knobHeight, 'ew-resize');
        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.interactionsEngine.addHitRegion('timeframeArea', null, 0, 0, this.renderEngine.width, this.renderEngine.height, 'text');
    }

    render() {
        if (this.shouldRender) {
            this.shouldRender = false;
            this.offscreenRender();
        }

        // @ts-ignore TODO: complains that it is undefined since it is not initialized in the constructor
        this.renderEngine.copy(this.offscreenRenderEngine);
        this.renderTimeframe();

        return true;
    }
}
