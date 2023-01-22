import { mergeObjects } from '../utils';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import UIPlugin from './ui-plugin';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';

export type TimeGridPluginStyles = {
    font: string;
    fontColor: string;
};

export type TimeGridPluginSettings = {
    styles?: Partial<TimeGridPluginStyles>;
};

export const defaultTimeGridPluginStyles: TimeGridPluginStyles = {
    font: '10px sans-serif',
    fontColor: 'black',
};

export class TimeGridPlugin extends UIPlugin<TimeGridPluginStyles> {
    override styles: TimeGridPluginStyles = defaultTimeGridPluginStyles;
    height = 0;

    constructor(settings: TimeGridPluginSettings = {}) {
        super('timeGridPlugin');
        this.setSettings(settings);
    }

    override setSettings({ styles }: TimeGridPluginSettings) {
        this.styles = mergeObjects(defaultTimeGridPluginStyles, styles);

        if (this.renderEngine) {
            this.overrideEngineSettings();
        }
    }

    overrideEngineSettings() {
        this.renderEngine.setSettingsOverrides({ styles: this.styles });
        this.height = Math.round(this.renderEngine.charHeight + 10);
    }

    override init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine) {
        super.init(renderEngine, interactionsEngine);

        this.overrideEngineSettings();
    }

    override render() {
        this.renderEngine.parent.timeGrid.renderTimes(this.renderEngine);
        this.renderEngine.parent.timeGrid.renderLines(0, this.renderEngine.height, this.renderEngine);

        return true;
    }
}
