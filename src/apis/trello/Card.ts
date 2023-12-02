import * as v from 'validtyped';
import { TrelloSubscribable } from './Subscribable';

export const cardSchema = v.object({
    id: v.string(),
    name: v.string(),
    idLabels: v.array(v.string()),
    idList: v.string(),
    idBoard: v.string(),
    desc: v.string(),
    closed: v.boolean(),
});

export class TrelloCardApi extends TrelloSubscribable {
    constructor(
        apikey: string,
        token: string,
        readonly id: string,
    ) { super(apikey, token, id); }

    fetch() {
        return this.get(`cards/${this.id}`, cardSchema);
    }
}
