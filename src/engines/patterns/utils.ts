export const createPatternCanvas = () => {
    const canvas = document.createElement('canvas')!;
    const ctx = canvas.getContext('2d')!;

    return {
        ctx,
        canvas,
    };
};
