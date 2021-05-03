export class TimeMarksPlugin {
    constructor() {
    }

    init(renderEngine, interactionsEngine) {
        this.renderEngine = renderEngine;
        this.height = this.renderEngine.charHeight + this.renderEngine.blockPadding * 2;
    }

    handleSelect(region, mouse) {

    }

    handleHover(region, mouse) {

    }

    render() {
        this.renderEngine.parent.timeIndicators.renderTimes(this.renderEngine);
        this.renderEngine.parent.timeIndicators.renderLines(0, this.renderEngine.height, this.renderEngine);

        return true;
    }
}
