import { createPatternCanvas } from './utils';
import { PatternCreator } from './types';

export type StripesPatternConfig = {
    color?: string;
    background?: string;
    lineWidth?: number;
    spacing?: number;
    angle?: number;
    dash?: number[];
};

export const stripesPattern =
    ({
        color = 'black',
        background = 'rgb(255,255,255, 0)',
        lineWidth = 6,
        spacing = 4,
        angle = 45,
        dash,
    }: StripesPatternConfig = {}): PatternCreator =>
    (engine) => {
        const { ctx, canvas } = createPatternCanvas();
        const scale = 4;

        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        canvas.height = engine.blockHeight * scale;

        const realLineWidth = lineWidth * scale;
        const realSpacing = spacing * scale + realLineWidth;

        const angleRad = (angle * Math.PI) / 180.0;

        const isAscending =
            (angleRad > (Math.PI * 3) / 2 && angleRad < Math.PI * 2) || (angleRad > Math.PI / 2 && angleRad < Math.PI);
        const isStraight = angleRad === Math.PI || angleRad === Math.PI * 2;
        const isPerpendicular = angleRad === Math.PI / 2 || angleRad === (Math.PI * 3) / 2;

        const width =
            isStraight || isPerpendicular
                ? isStraight
                    ? realLineWidth
                    : realLineWidth + realSpacing / 2
                : Math.abs(Math.ceil(realSpacing / Math.cos(Math.PI / 2 - angleRad)));

        canvas.width = width;
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = color;
        ctx.lineWidth = realLineWidth;
        ctx.lineCap = 'square';

        let y = 0;

        ctx.beginPath();

        if (dash) {
            ctx.setLineDash(dash.map((value) => value * scale));
        }

        if (isStraight) {
            y = realLineWidth / 2;

            while (y <= canvas.height) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                y += realSpacing;
            }
        } else if (isPerpendicular) {
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(width / 2, canvas.height);
        } else {
            const delta = Math.abs(realSpacing / Math.cos(angleRad));
            const fixY = Math.abs(Math.ceil(Math.sin(angleRad) * realLineWidth));

            if (!isAscending) {
                while (y <= canvas.height + realLineWidth) {
                    ctx.moveTo(0, y - fixY);
                    y += delta;
                    ctx.lineTo(width, y - fixY);
                }
            } else {
                y = canvas.height;

                while (y >= 0 - realLineWidth) {
                    ctx.moveTo(0, y + fixY);
                    y -= delta;
                    ctx.lineTo(width, y + fixY);
                }
            }
        }

        ctx.stroke();

        const pattern = engine.ctx.createPattern(canvas, 'repeat')!;

        return {
            pattern,
            width,
            scale,
        };
    };
