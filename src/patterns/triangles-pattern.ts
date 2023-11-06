import { createPatternCanvas } from './utils';
import { PatternCreator } from './types';
import { TriangleDirections } from '../types';
import { getTrianglePoints } from '../utils';

export type TrianglesPatternConfig = {
    color?: string;
    background?: string;
    width?: number;
    height?: number;
    align?: 'center' | 'top' | 'bottom';
    direction?: TriangleDirections;
    spacing?: number;
};

export const trianglesPattern =
    ({
        color = 'black',
        background = 'rgb(255,255,255, 0)',
        width = 16,
        height = width / 2,
        align = 'center',
        direction = 'right',
        spacing = width,
    }: TrianglesPatternConfig): PatternCreator =>
    (engine) => {
        const { ctx, canvas } = createPatternCanvas();
        const scale = 4;

        const points = getTrianglePoints(width * scale, height * scale, direction);

        const maxWidth = Math.max(...points.map(({ x }) => x));
        const maxHeight = Math.max(...points.map(({ y }) => y));

        const fullWidth = maxWidth + spacing * scale;
        const fullHeight = engine.blockHeight * scale;

        const delta = align === 'center' ? (fullHeight - maxHeight) / 2 : align === 'top' ? 0 : fullHeight - maxHeight;

        ctx.setTransform(scale, 0, 0, scale, 0, 0);

        canvas.height = fullHeight;
        canvas.width = fullWidth;

        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = color;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y + delta);
        points.slice(1).forEach(({ x, y }) => ctx.lineTo(x, y + delta));
        ctx.closePath();
        ctx.fill();

        const pattern = engine.ctx.createPattern(canvas, 'repeat')!;

        return {
            pattern,
            width: fullWidth,
            scale,
        };
    };
