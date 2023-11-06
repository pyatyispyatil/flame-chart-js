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
        const radius = realSize / 2;
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

        const freeSpace = height - ((realSize + realVerticalSpacing) * rowsCount - realVerticalSpacing);
        const padding = align === 'center' ? freeSpace / 2 : align === 'top' ? 0 : freeSpace;

        for (let row = 0; row < rowsCount; row++) {
            ctx.arc(width / 2, padding + (realSize + realVerticalSpacing) * row + radius, radius, 0, 2 * Math.PI);
            ctx.fill();
        }

        const pattern = engine.ctx.createPattern(canvas, 'repeat')!;

        return {
            pattern,
            width,
            scale,
        };
    };
