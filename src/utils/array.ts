import { propEquals } from './fp'

export function any(bools: boolean[]): boolean {
    return bools.reduce((x, y) => x || y, false);
}

export function findByName<T extends Record<'name', string>>(arr: T[], name: string): T {
    const item = arr.find(propEquals({ name }));
    if (!item) throw new Error('Expected to find item with name: ' + name);

    return item;
}
