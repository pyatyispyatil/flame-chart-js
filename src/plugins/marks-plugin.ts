import Color from 'color';
import UIPlugin from './ui-plugin';

export default class MarksPlugin extends UIPlugin {
    marks;
    min;
    max;
    interactionsEngine;
    hoveredRegion;
    selectedRegion;
    renderEngine;
    constructor(marks) {
        super();
        this.marks = this.prepareMarks(marks);

        this.calcMinMax();
    }

    calcMinMax() {
        const { marks } = this;

        if (marks.length) {
            this.min = marks.reduce((acc, { timestamp }) => (timestamp < acc ? timestamp : acc), marks[0].timestamp);
            this.max = marks.reduce((acc, { timestamp }) => (timestamp > acc ? timestamp : acc), marks[0].timestamp);
        }
    }

    init(renderEngine, interactionsEngine) {
        super.init(renderEngine, interactionsEngine);

        this.interactionsEngine.on('hover', this.handleHover.bind(this));
        this.interactionsEngine.on('select', this.handleSelect.bind(this));
    }

    handleHover(region) {
        this.hoveredRegion = region;
    }

    handleSelect(region) {
        if (region && region.type === 'timestamp') {
            this.selectedRegion = region;
            this.emit('select', region.data, 'timestamp');
            this.renderEngine.render();
        } else if (this.selectedRegion && !region) {
            this.selectedRegion = null;
            this.emit('select', null, 'timestamp');
            this.renderEngine.render();
        }
    }

    get height() {
        return this.renderEngine.blockHeight + 1;
    }

    prepareMarks(marks) {
        return marks
            .map(({ color, ...rest }) => ({
                ...rest,
                color: new Color(color).alpha(0.7).rgb().toString(),
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    setMarks(marks) {
        this.marks = this.prepareMarks(marks);

        this.calcMinMax();

        this.renderEngine.recalcMinMax();
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
            const { width } = this.renderEngine.ctx.measureText(shortName);
            const fullWidth = width + this.renderEngine.blockPaddingLeftRight * 2;
            const position = this.renderEngine.timeToPosition(timestamp);
            const blockPosition = this.calcMarksBlockPosition(position, prevEnding);

            this.renderEngine.addRectToRenderQueue(color, blockPosition, 0, fullWidth);
            this.renderEngine.addTextToRenderQueue(shortName, blockPosition, 0, fullWidth);

            this.interactionsEngine.addHitRegion(
                'timestamp',
                node,
                blockPosition,
                0,
                fullWidth,
                this.renderEngine.blockHeight
            );

            return blockPosition + fullWidth;
        }, 0);
    }

    postRender() {
        this.marks.forEach((node) => {
            const { timestamp, color } = node;
            const position = this.renderEngine.timeToPosition(timestamp);

            this.renderEngine.parent.setStrokeColor(color);
            this.renderEngine.parent.ctx.beginPath();
            this.renderEngine.parent.ctx.setLineDash([8, 7]);
            this.renderEngine.parent.ctx.moveTo(position, this.renderEngine.position);
            this.renderEngine.parent.ctx.lineTo(position, this.renderEngine.parent.height);
            this.renderEngine.parent.ctx.stroke();
        });
    }

    renderTooltip() {
        if (this.hoveredRegion && this.hoveredRegion.type === 'timestamp') {
            if (this.renderEngine.settings.tooltip === false) {
                return true;
            } else if (typeof this.renderEngine.settings.tooltip === 'function') {
                this.renderEngine.settings.tooltip(
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
    }
}
