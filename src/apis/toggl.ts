import * as v from 'validtyped';
import btoa from 'btoa';
import { arrays } from 'utilities-ts';
import * as remote from '../utils/request';
import { prop, propEquals } from '../utils/fp';

interface StartTimeOptions {
    description?: string;
    wid?: number;
    pid?: number;
    tid?: number;
    billable?: boolean;
    created_with: string;
    tags?: string[];
    duronly?: boolean;
    project?: string;
}

const timeEntrySchema = v.object({
    data: v.object({
        id: v.number(),
        wid: v.number(),
        pid: v.number(),
        duration: v.number(),
        start: v.string(),
        description: v.string(),
    }, { optional: ['pid'] }),
});

const workspaceSchema = v.object({
    id: v.number(),
    name: v.string(),
});

const projectSchema = v.object({
    id: v.number(),
    wid: v.number(),
    name: v.string(),
    active: v.boolean(),
});

export class TogglApi {
    protected readonly base = 'https://www.toggl.com/api/v8';
    constructor(
        protected apiKey: string,
    ) {}

    protected getAuthHeader() {
        return {
            Authorization: 'Basic ' + btoa(`${this.apiKey}:api_token`),
        };
    }

    protected get<T>(url: string, validator: v.Validator<T>) {
        return remote.get(`${this.base}/${url}`, validator, this.getAuthHeader());
    }

    protected post<T>(url: string, data: any, validator?: v.Validator<T>) {
        return validator
            ? remote.post(`${this.base}/${url}`, data, validator, this.getAuthHeader())
            : remote.post(`${this.base}/${url}`, data, this.getAuthHeader());
    }

    protected put(url: string, data: any) {
        return remote.put(`${this.base}/${url}`, data, this.getAuthHeader());
    }

    getMe() {
        return this.get('me', v.any());
    }

    getWorkspaces() {
        return this.get('workspaces', v.array(workspaceSchema));
    }

    getFirstWorkspace() {
        return this.getWorkspaces().then(arrays.getFirst);
    }

    async getProjects(workspaceId?: number) {
        const wid = workspaceId
            ? workspaceId
            : await this.getFirstWorkspace().then(prop('id'));

        return this.get(`workspaces/${wid}/projects`, v.array(projectSchema));
    }

    async getProjectByName(name: string) {
        const projects = await this.getProjects();
        const project = projects.find(propEquals({ name }));

        if (!project) throw new Error('Expected to find project');

        return project;
    }

    async createProject(name: string, workspaceId?: number) {
        const wid = workspaceId
            ? workspaceId
            : await this.getFirstWorkspace().then(prop('id'));

        return this.post('projects', {
            name,
            wid,
        });
    }

    async startTime(opts: StartTimeOptions) {
        if (opts.project) {
            const project = await this.getProjectByName(opts.project);
            opts.pid = project.id;
        }

        if (!opts.pid && !opts.wid && !opts.tid) {
            const workspace = await this.getFirstWorkspace();
            opts.wid = workspace.id;
        }

        return this.post('time_entries/start', { time_entry: opts }, timeEntrySchema);
    }

    getRunning() {
        return this.get('time_entries/current', timeEntrySchema);
    }

    async stopTime(id?: number) {
        const time_id = id
            ? id
            : await this.getRunning()
                .then(prop('data'))
                .then(prop('id'));

        return this.put(`time_entries/${time_id}/stop`, undefined);
    }
}
