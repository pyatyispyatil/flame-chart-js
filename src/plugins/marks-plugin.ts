import Color from 'color';
import UIPlugin from './ui-plugin';
import { HitRegion, Mark, Marks, RegionTypes } from '../types';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';

type MarkHitRegion = HitRegion<Mark>;

export class MarksPlugin extends UIPlugin {
    marks: Marks;
    hoveredRegion: MarkHitRegion | null = null;
    selectedRegion: MarkHitRegion | null = null;

    constructor({ data, name = 'marksPlugin' }: { data: Marks; name?: string }) {
        super(name);
        this.marks = this.prepareMarks(data);

        this.calcMinMax();
    }

    calcMinMax() {
        const { marks } = this;

        if (marks.length) {
            this.min = marks.reduce((acc, { timestamp }) => (timestamp < acc ? timestamp : acc), marks[0].timestamp);
            this.max = marks.reduce((acc, { timestamp }) => (timestamp > acc ? timestamp : acc), marks[0].timestamp);
        }
    }

    override init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine) {
        super.init(renderEngine, interactionsEngine);

        this.interactionsEngine.on('hover', this.handleHover.bind(this));
        this.interactionsEngine.on('select', this.handleSelect.bind(this));
    }

    handleHover(region: MarkHitRegion) {
        this.hoveredRegion = region;
    }

    handleSelect(region: MarkHitRegion) {
        if (this.selectedRegion !== region) {
            this.selectedRegion = region;
            this.emit('select', { node: region?.data ?? null, type: 'mark' });
            this.renderEngine.render();
        }
    }

    override get height() {
        return this.renderEngine.blockHeight + 2;
    }

    prepareMarks(marks: Marks) {
        return marks
            .map(({ color, ...rest }) => ({
                ...rest,
                color: new Color(color).alpha(0.7).rgb().toString(),
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    setMarks(marks: Marks) {
        this.marks = this.prepareMarks(marks);

        this.calcMinMax();

        this.renderEngine.recalcMinMax();
        this.renderEngine.resetParentView();
    }

    calcMarksBlockPosition(position: number, prevEnding: number) {
        if (position > 0) {
            if (prevEnding > position) {
                return prevEnding;
            }

            return position;
        }

        return position;
    }

    override render() {
        this.marks.reduce((prevEnding, node) => {
            const { timestamp, color, shortName } = node;
            const { width } = this.renderEngine.ctx.measureText(shortName);
            const fullWidth = width + this.renderEngine.blockPaddingLeftRight * 2;
            const position = this.renderEngine.timeToPosition(timestamp);
            const blockPosition = this.calcMarksBlockPosition(position, prevEnding);

            this.renderEngine.addRectToRenderQueue(color, blockPosition, 1, fullWidth);
            this.renderEngine.addTextToRenderQueue(shortName, blockPosition, 1, fullWidth);

            this.interactionsEngine.addHitRegion(
                RegionTypes.TIMESTAMP,
                node,
                blockPosition,
                1,
                fullWidth,
                this.renderEngine.blockHeight
            );

            return blockPosition + fullWidth;
        }, 0);
    }

    override postRender() {
        this.marks.forEach((node) => {
            const { timestamp, color } = node;
            const position = this.renderEngine.timeToPosition(timestamp);

            this.renderEngine.parent.setCtxValue('strokeStyle', color);
            this.renderEngine.parent.setCtxValue('lineWidth', 1);
            this.renderEngine.parent.callCtx('setLineDash', [8, 7]);
            this.renderEngine.parent.ctx.beginPath();
            this.renderEngine.parent.ctx.moveTo(position, this.renderEngine.position);
            this.renderEngine.parent.ctx.lineTo(position, this.renderEngine.parent.height);
            this.renderEngine.parent.ctx.stroke();
        });
    }

    override renderTooltip() {
        if (this.hoveredRegion && this.hoveredRegion.type === 'timestamp') {
            if (this.renderEngine.options.tooltip === false) {
                return true;
            } else if (typeof this.renderEngine.options.tooltip === 'function') {
                this.renderEngine.options.tooltip(
                    this.hoveredRegion,
                    this.renderEngine,
                    this.interactionsEngine.getGlobalMouse()
                );
            } else {
                const {
                    data: { fullName, timestamp },
                } = this.hoveredRegion;

                const marksAccuracy = this.renderEngine.getAccuracy() + 2;
                const header = `${fullName}`;
                const time = `${timestamp.toFixed(marksAccuracy)} ${this.renderEngine.timeUnits}`;

                this.renderEngine.renderTooltipFromData(
                    [{ text: header }, { text: time }],
                    this.interactionsEngine.getGlobalMouse()
                );
            }

            return true;
        }

        return false;
    }
}
