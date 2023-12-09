import { Dot, TriangleDirections } from './types';

export const mergeObjects = <S extends Record<PropertyKey, any>>(defaults: S, current: Partial<S> = {}): S =>
    Object.keys(defaults).reduce((acc, key: keyof S) => {
        if (current[key]) {
            acc[key] = current[key]!;
        } else {
            acc[key] = defaults[key];
        }

        return acc;
    }, {} as S);

export const isNumber = (val: unknown): val is number => typeof val === 'number';

export const last = <T>(array: T[]): T => array[array.length - 1];

export const getTrianglePoints = (width: number, height: number, direction: TriangleDirections) => {
    const side = (width * Math.SQRT2) / 2;
    let points: Dot[] = [];

    switch (direction) {
        case 'top':
            points = [
                { x: 0, y: height },
                { x: width / 2, y: 0 },
                { x: width, y: height },
            ];
            break;
        case 'bottom':
            points = [
                { x: 0, y: 0 },
                { x: width, y: 0 },
                { x: width / 2, y: height },
            ];
            break;
        case 'left':
            points = [
                { x: height, y: 0 },
                { x: height, y: width },
                { x: 0, y: width / 2 },
            ];
            break;
        case 'right':
            points = [
                { x: 0, y: 0 },
                { x: 0, y: width },
                { x: height, y: width / 2 },
            ];
            break;
        case 'top-left':
            points = [
                { x: 0, y: 0 },
                { x: side, y: 0 },
                { x: 0, y: side },
            ];
            break;
        case 'top-right':
            points = [
                { x: 0, y: 0 },
                { x: side, y: 0 },
                { x: side, y: side },
            ];
            break;
        case 'bottom-left':
            points = [
                { x: 0, y: 0 },
                { x: 0, y: side },
                { x: side, y: side },
            ];
            break;
        case 'bottom-right':
            points = [
                { x: side, y: 0 },
                { x: 0, y: side },
                { x: side, y: side },
            ];
            break;
    }

    return points;
};
