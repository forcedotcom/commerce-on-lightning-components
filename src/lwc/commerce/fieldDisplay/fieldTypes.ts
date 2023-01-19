// The mapping of a product field to the display handling
const fieldTypes: Iterable<readonly [string, string]> = [
    ['BOOLEAN', 'BOOLEAN'],
    ['CHECKBOX', 'BOOLEAN'],
    ['CURRENCY', 'CURRENCY'],
    ['DATE', 'DATE'],
    ['DATETIME', 'DATETIME'],
    ['DATE/TIME', 'DATETIME'],
    ['NUMBER', 'NUMBER'],
    ['DOUBLE', 'NUMBER'],
    ['EMAIL', 'EMAIL'],
    ['INTEGER', 'NUMBER'],
    ['PERCENT', 'PERCENT'],
    ['PHONE', 'PHONE'],
    ['STRING', 'TEXT'],
    ['TEXTAREA', 'TEXT'],
    ['TIME', 'TIME'],
    ['URL', 'URL'],
    ['ADDRESS', 'ADDRESS'],
    ['GEOLOCATION', 'GEOLOCATION'],
];

/**
 * Supported product field types and their associated display handling.
 */
const FieldType: Map<string, string> = new Map(fieldTypes);

export default FieldType;
