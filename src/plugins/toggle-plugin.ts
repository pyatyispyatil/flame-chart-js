import { deepMerge } from '../utils';

export const defaultTogglePluginSettings = {
    styles: {
        togglePlugin: {
            height: 16,
            color: 'rgb(202,202,202, 0.25)',
            strokeColor: 'rgb(138,138,138, 0.50)',
            dotsColor: 'rgb(97,97,97)',
            fontColor: 'black',
            font: '10px sans-serif',
            triangleWidth: 10,
            triangleHeight: 7,
            triangleColor: 'black',
            leftPadding: 10,
        },
    },
};

export default class TogglePlugin {
    title: string;
    settings;
    styles;
    height: number;
    renderEngine;
    interactionsEngine;
    resizeActive: boolean;
    resizeStartHeight: number;
    resizeStartPosition: number;
    constructor(title: string, settings) {
        this.setSettings(settings);
        this.title = title;
    }

    setSettings(data) {
        this.settings = deepMerge(defaultTogglePluginSettings, data);
        this.styles = this.settings.styles.togglePlugin;

        this.height = this.styles.height + 1;
    }

    init(renderEngine, interactionsEngine) {
        this.renderEngine = renderEngine;
        this.interactionsEngine = interactionsEngine;

        const nextEngine = this.getNextEngine();
        nextEngine.setFlexible();

        this.interactionsEngine.on('click', (region) => {
            if (region && region.type === 'toggle' && region.data === this.renderEngine.id) {
                const nextEngine = this.getNextEngine();

                if (nextEngine.collapsed) {
                    nextEngine.expand();
                } else {
                    nextEngine.collapse();
                }

                this.renderEngine.parent.recalcChildrenSizes();
                this.renderEngine.parent.render();
            }
        });

        this.interactionsEngine.on('down', (region) => {
            if (region && region.type === 'knob-resize' && region.data === this.renderEngine.id) {
                const prevEngine = this.getPrevEngine();

                this.interactionsEngine.setCursor('row-resize');
                this.resizeActive = true;
                this.resizeStartHeight = prevEngine.height;
                this.resizeStartPosition = this.interactionsEngine.getGlobalMouse().y;
            }
        });

        this.interactionsEngine.parent.on('move', () => {
            if (this.resizeActive) {
                const prevEngine = this.getPrevEngine();
                const mouse = this.interactionsEngine.getGlobalMouse();

                if (prevEngine.flexible) {
                    const newPosition = this.resizeStartHeight - (this.resizeStartPosition - mouse.y);

                    if (newPosition <= 0) {
                        prevEngine.collapse();
                        prevEngine.resize({ height: 0 });
                    } else {
                        if (prevEngine.collapsed) {
                            prevEngine.expand();
                        }

                        prevEngine.resize({ height: newPosition });
                    }

                    this.renderEngine.parent.render();
                }
            }
        });

        this.interactionsEngine.parent.on('up', () => {
            this.interactionsEngine.clearCursor();
            this.resizeActive = false;
        });
    }

    getPrevEngine() {
        return this.renderEngine.parent.children[this.renderEngine.id - 1];
    }

    getNextEngine() {
        return this.renderEngine.parent.children[this.renderEngine.id + 1];
    }

    render() {
        const nextEngine = this.getNextEngine();
        const prevEngine = this.getPrevEngine();
        const triangleFullWidth = this.styles.leftPadding + this.styles.triangleWidth;
        const centerW = this.renderEngine.width / 2;
        const centerH = this.styles.height / 2;

        this.renderEngine.setCtxFont(this.styles.font);

        this.renderEngine.setCtxColor(this.styles.color);
        this.renderEngine.setStrokeColor(this.styles.strokeColor);
        this.renderEngine.fillRect(0, 0, this.renderEngine.width, this.styles.height);

        this.renderEngine.setCtxColor(this.styles.fontColor);
        this.renderEngine.addTextToRenderQueue(this.title, triangleFullWidth, 0, this.renderEngine.width);
        this.renderEngine.renderTriangle(
            this.styles.triangleColor,
            this.styles.leftPadding,
            0 + this.styles.height / 2,
            this.styles.triangleWidth,
            this.styles.triangleHeight,
            nextEngine.collapsed ? 'right' : 'bottom'
        );

        const { width: titleWidth } = this.renderEngine.ctx.measureText(this.title);
        const buttonWidth = titleWidth + triangleFullWidth;

        this.interactionsEngine.addHitRegion(
            'toggle',
            this.renderEngine.id,
            0,
            0,
            buttonWidth,
            this.styles.height,
            'pointer'
        );

        if (prevEngine.flexible) {
            this.renderEngine.renderCircle(this.styles.dotsColor, centerW, centerH, 1.5);
            this.renderEngine.renderCircle(this.styles.dotsColor, centerW - 10, centerH, 1.5);
            this.renderEngine.renderCircle(this.styles.dotsColor, centerW + 10, centerH, 1.5);

            this.interactionsEngine.addHitRegion(
                'knob-resize',
                this.renderEngine.id,
                buttonWidth,
                0,
                this.renderEngine.width - buttonWidth,
                this.styles.height,
                'row-resize'
            );
        }
    }
}
