import Maybe, { some, none, maybe } from 'maybetyped';
import * as _ from 'lodash';

class TimedEntry<T> {
    constructor(
        private readonly maxAge: number,
        private readonly created: number,
        private readonly data: T,
    ) {}

    get(): Maybe<T> {
        if (Date.now() - this.created < this.maxAge) {
            return some(this.data);
        }

        return none();
    }
}

function cacheKey(a: any[]) {
    const strs = a.map(x => JSON.stringify(a));
    return strs.join('..||..');
}

function accessMap<T>(map: Map<string, TimedEntry<T>>, key: string): Maybe<T> {
    const entry = maybe(map.get(key));
    return entry.flatMap(e => e.get());
}

export function cache<R, A extends any[]>(maxAge: number, updator: (...args: A) => R) {
    const cacheMap = new Map<string, TimedEntry<R>>();
    const cacheAccessor = _.partial(accessMap, cacheMap);

    const updateEntry = (key: string, args: A) => {
        const ret = updator(...args);
        cacheMap.set(key, new TimedEntry(maxAge, Date.now(), ret));
        return ret;
    };

    return (...args: A) => {
        const key = cacheKey(args);
        const entry = cacheAccessor(key);

        return entry
            .orElse(() => updateEntry(key, args));
    };
}

