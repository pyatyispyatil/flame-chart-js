import Color from 'color';
import { Marks } from "../types";
import { OffscreenRenderEngine } from "../engines/render-engine";
import { SeparatedInteractionsEngine } from "../engines/interactions-engine";

export default class MarksPlugin {
    max = 0;
    min = 0;
    private hoveredRegion: any;
    private marks: Marks;
    private renderEngine: OffscreenRenderEngine | undefined;
    private interactionsEngine: SeparatedInteractionsEngine | undefined;

    constructor(marks) {
        this.marks = this.prepareMarks(marks);

        this.calcMinMax();
    }

    calcMinMax() {
        const { marks } = this;

        this.min = marks.reduce((acc, { timestamp }) => timestamp < acc ? timestamp : acc, marks[0].timestamp);
        this.max = marks.reduce((acc, { timestamp }) => timestamp > acc ? timestamp : acc, marks[0].timestamp);
    }

    init(renderEngine, interactionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;

        // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
        this.interactionsEngine.on('hover', (region) => {
            this.hoveredRegion = region;
        });
    }

    get height() {
        // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
        return this.renderEngine.blockHeight + 1;
    }

    prepareMarks(marks) {
        return marks
            .map(({ color, ...rest }) => ({
                ...rest,
                color: new Color(color).alpha(0.7).rgb().toString()
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    setMarks(marks) {
        this.marks = this.prepareMarks(marks);

        // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
        this.renderEngine.recalcMinMax();
        // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
        this.renderEngine.resetParentView();
    }

    calcMarksBlockPosition(position, prevEnding) {
        if (position > 0) {
            if (prevEnding > position) {
                return prevEnding;
            } else {
                return position;
            }
        } else {
            return position;
        }
    }

    render() {
        this.marks.reduce((prevEnding, node) => {
            const { timestamp, color, shortName } = node;
            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
            const { width } = this.renderEngine.ctx.measureText(shortName);
            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
            const fullWidth = width + this.renderEngine.blockPaddingLeftRight * 2;
            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
            const position = this.renderEngine.timeToPosition(timestamp);
            // TODO: calcMarksBlockPosition expects only two params, here are three passed in
            const blockPosition = this.calcMarksBlockPosition(position, prevEnding);

            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
            this.renderEngine.addRectToRenderQueue(color, blockPosition, 0, fullWidth);
            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
            this.renderEngine.addTextToRenderQueue(shortName, blockPosition, 0, fullWidth);

            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor, also seems like one parameter (cursor) is missing here?
            this.interactionsEngine.addHitRegion('timestamp', node, blockPosition, 0, fullWidth, this.renderEngine.blockHeight);

            return blockPosition + fullWidth;
        }, 0);
    }

    postRender() {
        this.marks.forEach((node) => {
            const { timestamp, color } = node;
            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
            const position = this.renderEngine.timeToPosition(timestamp);
            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
            this.renderEngine.parent.ctx.strokeStyle = color;
            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
            this.renderEngine.parent.ctx.beginPath();
            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
            this.renderEngine.parent.ctx.setLineDash([8, 7]);
            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor, also complains about position field on render engine
            this.renderEngine.parent.ctx.moveTo(position, this.renderEngine.position);
            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
            this.renderEngine.parent.ctx.lineTo(position, this.renderEngine.parent.height);
            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
            this.renderEngine.parent.ctx.stroke();
        });
    }

    renderTooltip() {
        if (this.hoveredRegion && this.hoveredRegion.type === 'timestamp') {
            const { data: { fullName, timestamp } } = this.hoveredRegion;

            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
            const marksAccuracy = this.renderEngine.getAccuracy() + 2;
            const header = `${fullName}`;
            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
            const time = `${timestamp.toFixed(marksAccuracy)} ${this.renderEngine.timeUnits}`;

            // @ts-ignore TODO: Complains that it is undefined because it is not initialized in constructor
            this.renderEngine.renderTooltipFromData(header, [time], this.interactionsEngine.getGlobalMouse());

            return true;
        }
    }
}
