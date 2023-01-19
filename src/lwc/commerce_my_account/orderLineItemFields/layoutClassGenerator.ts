const columnClassMap = new Map([
    [1, 'one-column-layout'],
    [2, 'two-column-layout'],
    [3, 'three-column-layout'],
    [4, 'four-column-layout'],
]);
/**
 * Generates a class name for field to utilise the maximum space in the UI.
 * For example if we have the columns as 4 and there are 2 fields only, It make more sense to divide the UI into 2 columns only to utilises maximum space.
 */
export default function getLayoutClass(columns: number, fields: number): string {
    return columnClassMap.get(Math.min(columns, fields)) || 'one-column-layout';
}
