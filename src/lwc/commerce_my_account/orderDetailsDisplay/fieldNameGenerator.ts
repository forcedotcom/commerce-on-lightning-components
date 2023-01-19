import type { Field } from 'commerce_my_account/recordFieldValue';

const userDisplayField = {
    objectApiName: 'User',
    fieldApiName: 'Name',
};
const accountDisplayField = {
    objectApiName: 'Account',
    fieldApiName: 'Name',
};
const orderDisplayField = {
    objectApiName: 'Order',
    fieldApiName: 'OrderNumber',
};
const orderSummaryDisplayField = {
    objectApiName: 'OrderSummary',
    fieldApiName: 'OrderNumber',
};
const contactDisplayField = {
    objectApiName: 'Contact',
    fieldApiName: 'Name',
};
const entityFieldMap = new Map([
    ['005', userDisplayField],
    ['001', accountDisplayField],
    ['801', orderDisplayField],
    ['1Os', orderSummaryDisplayField],
    ['003', contactDisplayField],
]);

/**
 * A Field of an entity
 *
 * @typedef {object} Field
 *
 * @property {string} fieldApiName
 * 	Name of the field
 *
 * @property {string} objectApiName
 * 	Name of the Entity
 *
 */
/**
 * Returns a preconfigured field based on recordId
 *
 * @param {string} recordId
 * Unique identifier of the record
 *
 * @returns {Field}
 * Returns a preconfigured field based on recordId
 */
export default function getFieldNameFromRecord(recordId: string | undefined | null): Field | undefined {
    let field;
    if (recordId && (recordId.length === 15 || recordId.length === 18)) {
        const prefix = recordId.substring(0, 3);
        field = entityFieldMap.get(prefix);
    }
    return field;
}
