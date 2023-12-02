import * as v from 'validtyped';
import { findByName } from './utils/array';
import { WatchedConfig } from './utils/WatchedConfig';
import { TrelloApi, setTrelloWebhookUrl } from './apis/trello';
import { TogglApi } from './apis/toggl';

import * as DailyBoardMaintenance from './workflows/DailyBoardMaintenance';
import * as TimeActiveTrelloTask from './workflows/TimeActiveTrelloTask';
import * as SyncLabel from './workflows/SyncLabels';

const loginSchema = v.object({
    trello: v.object({
        apiKey: v.string(),
        token: v.string(),
        webhook: v.string(),
    }),
    toggl: v.object({
        apiKey: v.string(),
    }),
});

async function start() {
    const config = new WatchedConfig('login.json', loginSchema);
    const login = await config.blockUntilLoaded();

    setTrelloWebhookUrl(login.trello.webhook);
    const trello = new TrelloApi(login.trello.apiKey, login.trello.token);
    const toggl = new TogglApi(login.toggl.apiKey);

    // DailyBoardMaintenance.start(trello);
    TimeActiveTrelloTask.start(trello, toggl);
    // SyncLabel.start(trello, toggl);

    // const gsd_api = await trello.me.getBoardApiByName('GSD');
    // const doingList = await gsd_api.getListByName('Doing');

    // doingList.subscribeToAction('createCard', (data) => {
    //     console.log(data);
    //     console.log(data.action.data.card);
    // });
}

start()
    .catch(console.log);
