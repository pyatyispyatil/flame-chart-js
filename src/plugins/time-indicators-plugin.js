export default class TimeIndicatorsPlugin {
    constructor() {
    }

    init(renderEngine) {
        this.renderEngine = renderEngine;
        this.height = this.renderEngine.charHeight + this.renderEngine.blockPadding * 2;
    }

    render() {
        this.renderEngine.parent.timeIndicators.renderTimes(this.renderEngine);
        this.renderEngine.parent.timeIndicators.renderLines(0, this.renderEngine.height, this.renderEngine);

        return true;
    }
}
