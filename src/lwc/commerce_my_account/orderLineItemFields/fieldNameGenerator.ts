import type { EntityField } from './types';

const userDisplayField: EntityField = {
    objectApiName: 'User',
    fieldApiName: 'Name',
};
const accountDisplayField: EntityField = {
    objectApiName: 'Account',
    fieldApiName: 'Name',
};
const orderDisplayField: EntityField = {
    objectApiName: 'Order',
    fieldApiName: 'OrderNumber',
};
const orderSummaryDisplayField: EntityField = {
    objectApiName: 'OrderSummary',
    fieldApiName: 'OrderNumber',
};
const contactDisplayField: EntityField = {
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
 * Returns a preconfigured field based on orderId
 */
export default function getFieldNameFromEntity(orderId?: string | null): EntityField | undefined {
    let field: EntityField | undefined;
    if (orderId && (orderId.length === 15 || orderId.length === 18)) {
        const prefix = orderId.substring(0, 3);
        if (entityFieldMap.has(prefix)) {
            field = entityFieldMap.get(prefix);
        }
    }
    return field;
}
