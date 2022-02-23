export const deepMerge = (target, object) => {
    return Object.entries(target)
        .reduce((acc, [key, value]) => {
            const type = typeof value;

            if (type === 'object' && value !== null) {
                if (object && object[key]) {
                    acc[key] = deepMerge(target[key], object[key]);
                } else {
                    acc[key] = target[key];
                }
            } else {
                acc[key] = object && object[key] || target[key];
            }

            return acc;
        }, {});
};

export const isNumber = (val) => typeof val === 'number';

export const addAlpha = (color, opacity) => {                                                                                                                                     [0/254]
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
};
