import * as v from 'validtyped';
import { TrelloSubscribable } from './Subscribable';

export const trelloColorSchema = v.string([
    'yellow' as const,
    'purple' as const,
    'blue' as const,
    'red' as const,
    'green' as const,
    'orange' as const,
    'black' as const,
    'sky' as const,
    'pink' as const,
    'lime' as const,
]).orNull();

export type TrelloColor = v.ValidType<typeof trelloColorSchema>;

export const labelSchema = v.object({
    id: v.string(),
    name: v.string(),
    color: trelloColorSchema,
}, { optional: ['name' ]});

export class TrelloLabelApi extends TrelloSubscribable {
    constructor(
        apikey: string,
        token: string,
        readonly id: string,
        readonly name: string | undefined,
    ) { super(apikey, token, id); }
}
