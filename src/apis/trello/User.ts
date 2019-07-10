import * as v from 'validtyped';
import { propEquals, map } from '../../utils/fp';
import { TrelloBase } from './Base';
import { TrelloBoardApi, boardSchema } from './Board';

export class TrelloUserApi extends TrelloBase {
    constructor(
        apikey: string,
        token: string,
        readonly id: string,
    ) {
        super(apikey, token);
    }

    getBoards() {
        return this.get(`members/${this.id}/boards`, v.array(boardSchema))
            .then(map(board => new TrelloBoardApi(
                this.apikey,
                this.token,
                board.id,
                board.name,
            )));
    }

    async getBoardApiByName(name: string) {
        const boards = await this.getBoards();

        const board = boards.find(propEquals({ name }));

        if (!board) throw new Error('Did not find board with given name');

        return board;
    }
}
