import type { FieldMapping } from './types';
import {
    StockKeepingUnit,
    Quantity,
    TotalLineAdjustmentAmount,
    AdjustedLineAmount,
    Name,
    TotalLineAmount,
} from './labels';
export function getDefaultProductFields(): FieldMapping[] {
    return [
        {
            entity: 'OrderItemSummary',
            name: 'StockKeepingUnit',
            label: StockKeepingUnit,
            type: 'Text(255)',
        },
        {
            entity: 'OrderItemSummary',
            name: 'Quantity',
            label: Quantity,
            type: 'Number(18, 0)',
        },
        {
            entity: 'OrderItemSummary',
            name: 'TotalLineAdjustmentAmount',
            label: TotalLineAdjustmentAmount,
            type: 'Roll-Up Summary ( Order Product Adjustment Line Item Summary)',
        },
        {
            entity: 'OrderItemSummary',
            name: 'AdjustedLineAmount',
            label: AdjustedLineAmount,
            type: 'Formula (Currency)',
        },
    ];
}

export function getDefaultShippingFields(): FieldMapping[] {
    return [
        {
            entity: 'OrderDeliveryMethod',
            name: 'Name',
            label: Name,
            type: 'Text(255)',
        },
        {
            entity: 'OrderDeliveryGroupSummary',
            name: 'TotalLineAmount',
            label: TotalLineAmount,
            type: 'Currency(16, 2)',
        },
    ];
}
