export const propEquals = <K extends string>(equal: Record<K, any>) => {
    return (obj: Record<K, any>) => {
        return Object
            .keys(equal)
            .reduce((coll, cur) => equal[cur as K] === obj[cur as K] && coll, true);
    };
};

export function map<T, R>(f: (i: T) => R) {
    return (arr: T[]) => arr.map(f);
}

export function prop<K extends string, E extends Record<K, any>>(key: K) {
    return (obj: E) => obj[key];
}
