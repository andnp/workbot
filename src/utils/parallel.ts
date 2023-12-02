import { OverwriteReturn } from "simplytyped";

export function noConcurrent<F extends (...args: any[]) => Promise<any>>(f: F): OverwriteReturn<F, ReturnType<F> | Promise<void>> {
    let running = false;
    return (async (...args: any[]) => {
        if (running) return;
        running = true;

        const ret = await f(...args);

        running = false;
        return ret;
    }) as any;
}
