export function attempt<T>(f: () => T): T | undefined;
export function attempt<D, T>(def: D, f: () => T): D | T;
export function attempt(def: any, f?: any) {
    const func = f || def;
    const d = f ? def : undefined;

    try {
        const ret = func();
        return ret instanceof Promise
            ? ret.catch(() => d)
            : ret;
    } catch (e) {
        return d;
    }
}

export async function retry<T>(times: number, timeout: number, f: () => T | undefined): Promise<T> {
    let n = 0;

    return new Promise<T>((resolve, reject) => {
        const tryAgain = () => {
            const result = Promise.resolve(attempt(f));
            result.then(res => {
                if (res !== undefined) return resolve(res);
                if (n++ > times) return reject();

                setTimeout(tryAgain, timeout);
            });
        };

        tryAgain();
    });
}
