import { ADDRESS_INNER_FIELDS, BILLING_ADDRESS } from './orders';
import type { InputField } from './types';
import { Name, OrderedDate, Status, GrandTotalAmount } from './labels';

export default function getOrderFieldNames(orderFields: InputField[]): string[] {
    const startIndex = 0;
    const fieldNames: string[] = orderFields.map((field: InputField) => field.name);
    const index: number = fieldNames.indexOf(BILLING_ADDRESS, startIndex);
    if (index > -1) {
        fieldNames.splice(index, 1);
        fieldNames.push(...ADDRESS_INNER_FIELDS);
    }
    return fieldNames;
}

export function getDefaultOrderFields(): InputField[] {
    return [
        {
            entity: 'OrderSummary',
            name: 'OrderNumber',
            label: Name,
            type: 'Text(255)',
        },
        {
            entity: 'OrderSummary',
            name: 'OrderedDate',
            label: OrderedDate,
            type: 'Date/Time',
        },
        {
            entity: 'OrderSummary',
            name: 'Status',
            label: Status,
            type: 'Text(255)',
        },
        {
            entity: 'OrderSummary',
            name: 'GrandTotalAmount',
            label: GrandTotalAmount,
            type: 'Currency',
        },
    ];
}
