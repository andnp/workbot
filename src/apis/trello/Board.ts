import * as v from 'validtyped';
import { propEquals, map } from '../../utils/fp';
import { TrelloSubscribable } from './Subscribable';
import { TrelloListApi, listSchema } from './List';

export const boardSchema = v.object({
    name: v.string(),
    id: v.string(),
    closed: v.boolean(),
});

export class TrelloBoardApi extends TrelloSubscribable {
    constructor(
        apikey: string,
        token: string,
        readonly id: string,
        readonly name: string,
    ) {
        super(apikey, token, id);
    }

    fetch() {
        return this.get(`boards/${this.id}`, boardSchema);
    }

    getLists() {
        return this.get(`boards/${this.id}/lists`, v.array(listSchema))
            .then(map(list => new TrelloListApi(
                this.apikey,
                this.token,
                list.id,
                list.name,
            )));
    }

    async getListByName(name: string) {
        const lists = await this.getLists();
        const list = lists.find(propEquals({ name }));

        if (!list) throw new Error('Did not find list with given name');

        return list;
    }
}
