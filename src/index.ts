import * as v from 'validtyped';
import { WatchedConfig } from './utils/WatchedConfig';
import { TrelloApi, setTrelloWebhookUrl } from './apis/trello';

import * as DailyBoardMaintenance from './workflows/DailyBoardMaintenance';

const loginSchema = v.object({
    trello: v.object({
        apiKey: v.string(),
        token: v.string(),
        webhook: v.string(),
    }),
});

async function start() {
    const config = new WatchedConfig('login.json', loginSchema);

    const login = await config.blockUntilLoaded();

    setTrelloWebhookUrl(login.trello.webhook);
    const trello = new TrelloApi(login.trello.apiKey, login.trello.token);

    DailyBoardMaintenance.start(trello);

    // const gsd_api = await trello.me.getBoardApiByName('GSD');
    // const doingList = await gsd_api.getListByName('Doing');

    // doingList.subscribeToAction('createCard', (data) => {
    //     console.log(data);
    //     console.log(data.action.data.card);
    // });
}

start()
    .catch(console.log);
