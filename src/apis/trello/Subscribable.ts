import * as v from 'validtyped';
import { TrelloBase } from './Base';
import { TrelloWebhookApi, Subscriber } from './WebhookApi';

export abstract class TrelloSubscribable extends TrelloBase {
    protected webhook: TrelloWebhookApi;

    constructor(
        apikey: string,
        token: string,
        id: string,
    ) {
        super(apikey, token);
        this.webhook = new TrelloWebhookApi(this.apikey, this.token, id);
    }

    subscribe(f: Subscriber): void;
    subscribe(url: string, f: Subscriber): void;
    subscribe(urlOrF: string | Subscriber, maybeF?: Subscriber) {
        this.webhook.create(urlOrF as string, maybeF as Subscriber);
    }

    subscribeToAction<A extends ActionData['action']['type']>(action: A, f: (data: ActionDataByType<A>) => any) {
        this.subscribe((data) => {
            if (!actionSchema.isValid(data)) return;
            if (data.action.type !== action) return;

            f(data as ActionDataByType<A>);
        });
    }
}

const simpleEntitySchema = v.object({
    id: v.string(),
    name: v.string(),
});

const createCardActionSchema = v.object({
    model: v.object({
        id: v.string(),
    }),
    action: v.object({
        id: v.string(),
        type: v.string(['createCard' as const]),
        date: v.string(),
        data: v.object({
            card: simpleEntitySchema,
            list: simpleEntitySchema,
            board: simpleEntitySchema,
        }),
    }),
});

const updateCardActionSchema = v.object({
    model: v.object({
        id: v.string(),
    }),
    action: v.object({
        id: v.string(),
        type: v.string(['updateCard' as const]),
        date: v.string(),
        data: v.object({
            card: simpleEntitySchema,
            list: simpleEntitySchema,
            board: simpleEntitySchema,
            old: simpleEntitySchema,
        }),
    }),
});

const actionSchema = v.union([
    createCardActionSchema,
    updateCardActionSchema,
]);

type ActionData = v.ValidType<typeof actionSchema>;
type ActionType = ActionData['action']['type'];
type ActionDataByType<T extends ActionType> = Extract<ActionData, { action: { type: T} }>;
