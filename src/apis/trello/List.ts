import * as v from 'validtyped';
import { TrelloBoardApi } from './Board';
import { TrelloSubscribable } from './Subscribable';

export const listSchema = v.object({
    id: v.string(),
    name: v.string(),
});

const createCardSchema = v.object({
    idList: v.string(),
}).and(v.partial(v.object({
    name: v.string(),
    desc: v.string(),
    due: v.string(),
    pos: v.string(['top', 'bottom']).or(v.number()),
})));

const moveAllCardsSchema = v.object({
    idBoard: v.string(),
    idList: v.string(),
});

export class TrelloListApi extends TrelloSubscribable {
    constructor(
        apikey: string,
        token: string,
        readonly id: string,
        readonly name: string,
    ) { super(apikey, token, id); }

    archiveAllCards() {
        return this.post(`lists/${this.id}/archiveAllCards`);
    }

    private moveAllCardsPoster = this.postBuilder(`lists/${this.id}/moveAllCards`, moveAllCardsSchema, v.any());
    moveAllCardsTo(board: TrelloBoardApi, list: TrelloListApi) {
        return this.moveAllCardsPoster({
            idBoard: board.id,
            idList: list.id,
        });
    }

    private createCardPoster = this.postBuilder('cards', createCardSchema, v.any());
    createCard(opts: Omit<v.ValidType<typeof createCardSchema>, 'idList'>) {
        return this.createCardPoster({
            idList: this.id,
            ...opts,
        });
    }
}
