export const propEquals = <E extends Record<string, any>, O extends E>(equal: E) => {
    return (obj: O) => {
        return Object
            .keys(equal)
            .reduce((coll, cur) => equal[cur] === obj[cur] && coll, true);
    };
};

export function map<T, R>(f: (i: T) => R) {
    return (arr: T[]) => arr.map(f);
}
