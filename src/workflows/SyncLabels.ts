import * as v from 'validtyped';
import { WatchedConfig } from '../utils/WatchedConfig';
import { propEquals } from '../utils/fp';
import { noConcurrent } from '../utils/parallel';
import { TrelloApi } from '../apis/trello';
import { TogglApi } from '../apis/toggl';

const projectSchema = v.object({
    name: v.string(),
});

const projectsSchema = v.array(projectSchema);

type Project = v.ValidType<typeof projectSchema>;

export async function start(trello: TrelloApi, toggl: TogglApi) {
    const project = new WatchedConfig('projects.json', projectsSchema);
    const dailyBoard = await trello.me.getBoardApiByName('GSD');

    project.onUpdate(async (projects) => {
        if (!projects) return;

        const trelloLabels = await dailyBoard.getLabels();
        const priorProjects = await toggl.getProjects();

        projects.forEach(noConcurrent(async (label: Project) => {
            const priorDailyLabel = trelloLabels.find(propEquals({ name: label.name }));
            if (!priorDailyLabel) await dailyBoard.createLabel(label.name, null);

            const priorProject = priorProjects.find(propEquals({ name: label.name }));
            if (!priorProject) await toggl.createProject(label.name);
        }));
    });
}
