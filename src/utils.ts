export const mergeObjects = <S extends Record<PropertyKey, any>>(defaultStyles: S, styles: Partial<S> = {}): S =>
    Object.keys(defaultStyles).reduce((acc, key: keyof S) => {
        if (styles[key]) {
            acc[key] = styles[key]!;
        } else {
            acc[key] = defaultStyles[key];
        }

        return acc;
    }, {} as S);

export const isNumber = (val: unknown): val is number => typeof val === 'number';
