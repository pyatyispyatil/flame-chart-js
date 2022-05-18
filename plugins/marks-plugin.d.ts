import UIPlugin from './ui-plugin';
import { Marks } from '../types';
import { OffscreenRenderEngine } from '../engines/offscreen-render-engine';
import { SeparatedInteractionsEngine } from '../engines/separated-interactions-engine';
export default class MarksPlugin extends UIPlugin {
    name: string;
    marks: Marks;
    hoveredRegion: any;
    selectedRegion: any;
    constructor(marks: Marks);
    calcMinMax(): void;
    init(renderEngine: OffscreenRenderEngine, interactionsEngine: SeparatedInteractionsEngine): void;
    handleHover(region: any): void;
    handleSelect(region: any): void;
    get height(): number;
    prepareMarks(marks: Marks): {
        color: string;
        shortName: string;
        fullName: string;
        timestamp: number;
    }[];
    setMarks(marks: Marks): void;
    calcMarksBlockPosition(position: number, prevEnding: number): number;
    render(): void;
    postRender(): void;
    renderTooltip(): boolean;
}
//# sourceMappingURL=marks-plugin.d.ts.map