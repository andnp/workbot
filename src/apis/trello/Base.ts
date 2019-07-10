import * as v from 'validtyped';
import * as remote from '../../utils/request';

export abstract class TrelloBase {
    protected readonly base = 'https://api.trello.com/1';

    constructor(
        protected apikey: string,
        protected token: string,
    ) {}

    protected authenticate(url: string) {
        const auth = `key=${this.apikey}&token=${this.token}`;

        if (!url.includes('?')) return `${url}?${auth}`;
        return `${url}&${auth}`;
    }

    protected get<T>(url: string, validator: v.Validator<T>) {
        return remote.get(this.authenticate(`${this.base}/${url}`), validator);
    }

    protected async post(url: string) {
        const ret = await remote.post(this.authenticate(`${this.base}/${url}`), v.any());

        if (typeof ret === 'string') throw new Error(ret);
        return ret;
    }

    protected postBuilder<I, O>(url: string, inValidator: v.Validator<I>, outValidator: v.Validator<O>) {
        return remote.postBuilder(this.authenticate(`${this.base}/${url}`), inValidator, outValidator);
    }
}
