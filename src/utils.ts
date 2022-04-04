export const deepMerge = (target, object): Record<string, any> => {
    return Object.entries(target).reduce((acc, [key, value]) => {
        const type = typeof value;

        if (type === 'object' && value !== null) {
            if (object?.[key]) {
                acc[key] = deepMerge(target[key], object[key]);
            } else {
                acc[key] = target[key];
            }
        } else {
            acc[key] = object?.[key] || target[key];
        }

        return acc;
    }, {});
};

export const isNumber = (val: unknown): val is number => typeof val === 'number';
