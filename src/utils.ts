export const deepMerge = <T>(target: T, object: T): T => {
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
    }, {} as T);
};

export const mergeObjects = <S>(defaultStyles: S, styles: Partial<S> = {}): S =>
    Object.keys(defaultStyles).reduce((acc, key) => {
        if (styles[key]) {
            acc[key] = styles[key];
        } else {
            acc[key] = defaultStyles[key];
        }

        return acc;
    }, {} as S);

export const isNumber = (val: unknown): val is number => typeof val === 'number';
