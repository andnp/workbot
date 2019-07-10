import * as v from 'validtyped';
import * as _ from 'lodash';
import * as http from 'http';
import * as uuid from 'uuid';

import { TrelloBase } from './Base';
import { attempt } from '../../utils/tryCatch';
import * as array from '../../utils/array';

type HttpSubscriber = (req: http.IncomingMessage, resp: http.ServerResponse) => any;
export const getWebhookSubscriber = _.once((port: number) => {
    const subscriptions: HttpSubscriber[] = [];
    const subscribe = (f: HttpSubscriber) => subscriptions.push(f);

    const server = http.createServer((req, resp) => {
        const handled = subscriptions.map(f => f(req, resp));
        if (!array.any(handled)) resp.statusCode = 410;
        resp.end();
    });

    server.listen(port);

    return subscribe;
});

export type Subscriber = (data: unknown) => any;
const createWebhookSchema = v.object({
    callbackURL: v.string(),
    idModel: v.string(),
});

export class TrelloWebhookApi extends TrelloBase {
    private uuid = uuid.v4();

    constructor(
        apikey: string,
        token: string,
        private modelId: string,
    ) { super(apikey, token); }

    private subscriber: ((f: HttpSubscriber) => any) | undefined;
    private createWebhook = this.postBuilder('webhooks', createWebhookSchema, v.any());

    private processEvent = (f: Subscriber) => (req: http.IncomingMessage, resp: http.ServerResponse) => {
        const key = this.uuid + '/' + this.modelId;
        if (!req.url!.includes(key)) return;

        if (req.method === 'HEAD') return true;
        if (req.method !== 'POST') return;

        req.on('readable', () => {
            const data = req.read();
            const parsed = attempt(() => JSON.parse(data));
            if (!_.isNil(parsed)) f(parsed);
        });

        return true;
    }

    async create(f: Subscriber): Promise<void>;
    async create(url: string, f: Subscriber): Promise<void>;
    async create(urlOrF: string | Subscriber, maybeF?: Subscriber) {
        // if already created, skip
        if (this.subscriber) return;

        const [ url, f ] = typeof urlOrF === 'string'
            ? [ urlOrF, maybeF! ]
            : [ globalUrl, urlOrF ];

        if (!url) throw new Error("Expected url to have been set");

        this.subscriber = getWebhookSubscriber(8194);
        this.subscriber(this.processEvent(f));

        await this.createWebhook({
            callbackURL: `${url}/${this.uuid}/${this.modelId}`,
            idModel: this.modelId,
        });
    }

    subscribe(f: Subscriber) {
        if (!this.subscriber) throw new Error('Expected webhook to already have been created');

        this.subscriber(this.processEvent(f));
    }
}

let globalUrl: string | null = null;
export function setTrelloWebhookUrl(url: string) {
    globalUrl = url;
}
