import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import UIPlugin from './ui-plugin';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
export declare type TimeGridPluginStyles = {
    font: string;
    fontColor: string;
};
export declare type TimeGridPluginSettings = {
    styles?: Partial<TimeGridPluginStyles>;
};
export declare const defaultTimeGridPluginStyles: TimeGridPluginStyles;
export default class TimeGridPlugin extends UIPlugin<TimeGridPluginStyles> {
    name: string;
    styles: TimeGridPluginStyles;
    height: number;
    constructor(settings?: TimeGridPluginSettings);
    setSettings({ styles }: TimeGridPluginSettings): void;
    overrideEngineSettings(): void;
    init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine): void;
    render(): boolean;
}
//# sourceMappingURL=time-grid-plugin.d.ts.map