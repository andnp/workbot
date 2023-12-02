export const rateLimit = <R, A extends any[]>(maxCalls: number, interval: number, f: (...args: A) => R) => {
    const buffer = [] as Array<TimeStamped<A>>;
    let tracker = [] as Array<TimeStamped<void>>;

    const clearBuffer = () => {
        if (!buffer.length) return;

        tracker = filterOld(interval, tracker);
        if (tracker.length >= maxCalls) return;

        const item = buffer.shift()!;
        f(...item.data);

        tracker.push({
            time: Date.now(),
            data: undefined,
        });

        setTimeout(clearBuffer, 100);
    };

    const caller = async (...args: A) => {
        tracker.push({
            time: Date.now(),
            data: undefined,
        });
        tracker = filterOld(interval, tracker);

        if (tracker.length < maxCalls) return f(...args);

        buffer.push({
            time: Date.now(),
            data: args,
        });

        setTimeout(clearBuffer, 100);
    };
};

function filterOld<T>(age: number, entries: Array<TimeStamped<T>>) {
    const now = Date.now();
    return entries.filter(entry => now - entry.time < age);
}

interface TimeStamped<T> {
    time: number;
    data: T;
}

function firstValue<K extends keyof any, T>(promises: Record<K, Promise<T>>): Promise<[K, T]> {
    return new Promise<[K, T]>((resolve) => {
        Object.keys(promises).forEach((key) => {
            const k = key as K;
            const p = promises[k];
            p.then(v => resolve([ k, v ]));
        });
    });
}
