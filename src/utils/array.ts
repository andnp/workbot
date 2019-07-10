export function any(bools: boolean[]): boolean {
    return bools.reduce((x, y) => x || y, false);
}
