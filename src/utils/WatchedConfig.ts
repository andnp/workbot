import * as _ from 'lodash';
import * as v from 'validtyped';
import * as fs from 'fs';
import { files } from 'utilities-ts';

import { attempt, retry } from '../utils/tryCatch';

type WatcherCallback<T> = (data: T | undefined) => any;

export class WatchedConfig<T> {
    data: T | undefined;

    private callbacks: Array<WatcherCallback<T>> = [];
    private loaded = false;

    constructor(
        private readonly path: string,
        private readonly schema: v.Validator<T>,
    ) {
        this.load();

        retry(100, 1000, () => fs.watch(this.path, () => this.load()));
    }

    async load() {
        const data = await attempt(() => files.readJson(this.path, this.schema));

        if (_.isEqual(this.data, data)) return;

        this.data = data;
        this.loaded = true;
        this.callbacks.forEach(f => f(data));
    }

    onUpdate(f: WatcherCallback<T>) {
        this.callbacks.push(f);

        if (this.loaded) {
            f(this.data);
        }
    }

    async blockUntilLoaded() {
        return new Promise<T>(resolve => {
            if (this.data !== undefined) return resolve(this.data);

            this.onUpdate(data => {
                if (data !== undefined) resolve(data);
            });
        });
    }
}
