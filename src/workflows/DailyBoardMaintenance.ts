import { TrelloApi } from '../apis/trello';
import { buildScheduler } from '../utils/schedule';
import { propEquals } from '../utils/fp';

function findByName<T extends Record<'name', string>>(arr: T[], name: string): T {
    const item = arr.find(propEquals({ name }));
    if (!item) throw new Error('Expected to find item with name: ' + name);

    return item;
}

export async function start(trello: TrelloApi) {
    const schedule = buildScheduler({
        repeat: true,
        time: "23:30",
    });

    async function runner() {
        const board = await trello.me.getBoardApiByName('Daily');

        const lists = await board.getLists();
        const todoList = findByName(lists, 'Todo');
        const doingList = findByName(lists, 'Doing');
        const doneList = findByName(lists, 'Done');
        const tomorrowList = findByName(lists, 'Tomorrow');

        // archive done
        await doneList.archiveAllCards();

        // move all to Todo
        await doingList.moveAllCardsTo(board, todoList);
        await tomorrowList.moveAllCardsTo(board, todoList);

        // create start of day todos
        await todoList.createCard({
            name: "Decide on today's goals",
            pos: 'top',
        });

        await todoList.createCard({
            name: 'Empty Inbox cards',
            pos: 'top',
        });
    }


    schedule(runner);
}
