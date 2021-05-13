import { deepMerge } from '../utils.js';

export const defaultTimeGridPluginSettings = {
    styles: {
        timeGridPlugin: {
            font: '10px sans-serif',
            fontColor: 'black'
        }
    }
};

export default class TimeGridPlugin {
    constructor(settings = {}) {
        this.setSettings(settings);
    }

    setSettings(settings) {
        this.styles = deepMerge(defaultTimeGridPluginSettings, settings).styles.timeGridPlugin;

        if (this.renderEngine) {
            this.overrideEngineSettings();
        }
    }

    overrideEngineSettings() {
        this.renderEngine.setSettingsOverrides({ styles: { main: this.styles } });
        this.height = Math.round(this.renderEngine.charHeight + 10);
    }

    init(renderEngine) {
        this.renderEngine = renderEngine;

        this.overrideEngineSettings();
    }

    render() {
        this.renderEngine.parent.timeGrid.renderTimes(this.renderEngine);
        this.renderEngine.parent.timeGrid.renderLines(0, this.renderEngine.height, this.renderEngine);

        return true;
    }
}
