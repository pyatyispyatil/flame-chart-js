import { createPatternCanvas } from './utils';
import { PatternCreator } from './types';

export type DotsPatternConfig = {
    color?: string;
    background?: string;
    size?: number;
    rows?: number;
    align?: 'center' | 'top' | 'bottom';
    spacing?: number;
    verticalSpicing?: number;
    horizontalSpicing?: number;
};

export const dotsPattern =
    ({
        color = 'black',
        background = 'rgb(255,255,255, 0)',
        size = 2,
        rows,
        align = 'center',
        spacing = 2,
        verticalSpicing = spacing,
        horizontalSpicing = spacing,
    }: DotsPatternConfig = {}): PatternCreator =>
    (engine) => {
        const { ctx, canvas } = createPatternCanvas();
        const scale = 4;

        const realSize = size * scale;
        const realVerticalSpacing = verticalSpicing * scale;
        const realHorizontalSpacing = horizontalSpicing * scale;
        const width = (size + realHorizontalSpacing / 4) * scale;
        const height = engine.blockHeight * scale;
        const rowsCount = rows ? rows : Math.floor(height / (realSize + realVerticalSpacing));

        ctx.setTransform(scale, 0, 0, scale, 0, 0);

        canvas.height = height;
        canvas.width = width;

        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = color;

        const delta =
            align === 'center'
                ? (height - (realSize + realVerticalSpacing) * (rowsCount + 1)) / 2
                : align === 'top'
                ? 0
                : height - (realSize + realVerticalSpacing) * (rowsCount + 1);

        for (let row = 1; row <= rowsCount; row++) {
            ctx.arc(width / 2, delta + (realSize + realVerticalSpacing) * row, realSize / 2, 0, 2 * Math.PI);
            ctx.fill();
        }

        const pattern = engine.ctx.createPattern(canvas, 'repeat')!;

        return {
            pattern,
            width,
            scale,
        };
    };
