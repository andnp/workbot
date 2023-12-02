import { TrelloApi } from '../apis/trello';
import { TogglApi } from '../apis/toggl';
import { attempt } from '../utils/tryCatch';


export async function start(trello: TrelloApi, toggl: TogglApi) {
    const board = await trello.me.getBoardApiByName('GSD');
    const doingList = await board.getListByName('Doing');

    doingList.subscribeToAction('updateCard', async (actionData) => {
        if (!('listBefore' in actionData.action.data && 'listAfter' in actionData.action.data)) return;

        if (actionData.action.data.listAfter.name !== 'Doing') return;

        const currentTimer = await attempt(() => toggl.getRunning());
        if (currentTimer) return;

        const cardApi = trello.buildCardApi(actionData.action.data.card.id);
        const cardData = await cardApi.fetch();
        const labels = await board.getLabels();
        const label = labels.find(label => cardData.idLabels.includes(label.id));
        const labelName = label && label.name;

        await toggl.startTime({
            created_with: 'workbot',
            description: actionData.action.data.card.name,
            project: labelName,
        });
    });
}
