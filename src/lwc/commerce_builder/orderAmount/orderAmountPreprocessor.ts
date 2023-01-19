import type { InputField } from 'commerce_my_account/orderTotalsWithFields';
import {
    TotalProductAmount,
    TotalProductPromotionAmount,
    TotalAdjustedDeliveryAmount,
    TotalTaxAmount,
    GrandTotalAmount,
    TotalProductAmountWithTax,
    TotalAdjDeliveryAmtWithTax,
} from './labels';

export function getDefaultNetTaxFields(): InputField[] {
    return [
        {
            entity: 'OrderSummary',
            name: 'TotalProductAmount',
            label: TotalProductAmount,
            type: 'Currency',
        },
        {
            entity: 'OrderAdjustmentAggregateSummary',
            name: 'TotalProductPromotionAmount',
            label: TotalProductPromotionAmount,
            type: 'Currency',
        },
        {
            entity: 'OrderSummary',
            name: 'TotalAdjustedDeliveryAmount',
            label: TotalAdjustedDeliveryAmount,
            type: 'Currency',
        },
        {
            entity: 'OrderSummary',
            name: 'TotalTaxAmount',
            label: TotalTaxAmount,
            type: 'Currency',
        },
        {
            entity: 'OrderSummary',
            name: 'GrandTotalAmount',
            label: GrandTotalAmount,
            type: 'Currency',
        },
    ];
}

export function getDefaultGrossTaxFields(): InputField[] {
    return [
        {
            entity: 'OrderSummary',
            name: 'TotalProductAmountWithTax',
            label: TotalProductAmountWithTax,
            type: 'Formula (Currency)',
        },
        {
            entity: 'OrderAdjustmentAggregateSummary',
            name: 'TotalProductPromotionAmount',
            label: TotalProductPromotionAmount,
            type: 'Currency',
        },
        {
            entity: 'OrderSummary',
            name: 'TotalAdjDeliveryAmtWithTax',
            label: TotalAdjDeliveryAmtWithTax,
            type: 'Formula (Currency)',
        },
        {
            entity: 'OrderSummary',
            name: 'TotalTaxAmount',
            label: TotalTaxAmount,
            type: 'Roll-Up Summary (SUM Order Product Summary)',
        },
        {
            entity: 'OrderSummary',
            name: 'GrandTotalAmount',
            label: GrandTotalAmount,
            type: 'Formula (Currency)',
        },
    ];
}
