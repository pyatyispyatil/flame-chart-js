import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import UIPlugin from './ui-plugin';
export declare type TogglePluginStyles = {
    height: number;
    color: string;
    strokeColor: string;
    dotsColor: string;
    fontColor: string;
    font: string;
    triangleWidth: number;
    triangleHeight: number;
    triangleColor: string;
    leftPadding: number;
};
export declare type TogglePluginSettings = {
    styles?: Partial<TogglePluginStyles>;
};
export declare const defaultTogglePluginStyles: TogglePluginStyles;
export default class TogglePlugin extends UIPlugin<TogglePluginStyles> {
    name: string;
    styles: TogglePluginStyles;
    height: number;
    title: string;
    resizeActive: boolean;
    resizeStartHeight: number;
    resizeStartPosition: number;
    constructor(title: string, settings: TogglePluginSettings);
    setSettings({ styles }: TogglePluginSettings): void;
    init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine): void;
    getPrevEngine(): OffscreenRenderEngine;
    getNextEngine(): OffscreenRenderEngine;
    render(): void;
}
//# sourceMappingURL=toggle-plugin.d.ts.map