import { createPatternCanvas } from './utils';
import { PatternCreator } from './types';

export type GradientPatternConfig = { colors: { offset: number; color: string }[] };

export const gradientPattern =
    ({ colors }: GradientPatternConfig): PatternCreator =>
    (engine) => {
        const { ctx, canvas } = createPatternCanvas();
        const scale = 4;

        const width = scale;
        const height = engine.blockHeight * scale;

        ctx.setTransform(scale, 0, 0, scale, 0, 0);

        canvas.height = height;
        canvas.width = width;

        const gradient = ctx.createLinearGradient(0, 0, width, height);

        for (const { offset, color } of colors) {
            gradient.addColorStop(offset, color);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        const pattern = engine.ctx.createPattern(canvas, 'repeat')!;

        return {
            pattern,
            width,
            scale,
        };
    };
