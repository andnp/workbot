import * as v from 'validtyped';
import { propEquals, map } from '../../utils/fp';
import { TrelloSubscribable } from './Subscribable';
import { TrelloListApi, listSchema } from './List';
import { labelSchema, TrelloLabelApi, TrelloColor } from './Label';

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

    getLabels() {
        return this.get(`boards/${this.id}/labels`, v.array(labelSchema))
            .then(map(label => new TrelloLabelApi(
                this.apikey,
                this.token,
                label.id,
                label.name,
            )));
    }

    async getLabelByName(name: string) {
        const labels = await this.getLabels();
        const label = labels.find(propEquals({ name }));

        if (!label) throw new Error('Did not find label with given name');

        return label;
    }

    createLabel(name: string, color: TrelloColor) {
        return this.post(`labels`, {
            name,
            color,
            idBoard: this.id,
        });
    }
}
