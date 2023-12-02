import * as _ from 'lodash';
import { TrelloBase } from './trello/Base';
import { TrelloUserApi } from './trello/User';
import { TrelloCardApi } from './trello/Card';

export { setTrelloWebhookUrl } from './trello/WebhookApi';
export class TrelloApi extends TrelloBase {
    me: TrelloUserApi;

    constructor(apikey: string, token: string) {
        super(apikey, token);

        this.me = new TrelloUserApi(apikey, token, 'me');
    }

    buildCardApi(id: string) {
        return new TrelloCardApi(
            this.apikey,
            this.token,
            id,
        );
    }
}
