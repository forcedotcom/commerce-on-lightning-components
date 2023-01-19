import type { OrderData } from '../../types';
import type { OrderData as OrderDataApi } from 'commerce/orderApi';

export const data: OrderDataApi = {
    adjustmentAggregates: {},
    createdDate: '2022-06-13T20:29:43.000Z',
    fields: {
        TotalAdjustedDeliveryAmount: {
            dataName: 'TotalAdjustedDeliveryAmount',
            label: 'Shipping',
            text: '11.99',
            type: 'currency',
        },
        TotalProductAmount: {
            dataName: 'TotalProductAmount',
            label: 'Product Subtotal',
            text: '189.0',
            type: 'currency',
        },
        TotalProductTaxAmount: {
            dataName: 'TotalProductTaxAmount',
            label: 'Product Subtotal Tax',
            text: '15.12',
            type: 'currency',
        },
        TotalAmount: {
            dataName: 'TotalAmount',
            label: 'Pretax Subtotal',
            text: '200.99',
            type: 'currency',
        },
        GrandTotalAmount: {
            dataName: 'GrandTotalAmount',
            label: 'Total',
            text: '217.07',
            type: 'currency',
        },
        TotalAdjustedProductTaxAmount: {
            dataName: 'TotalAdjustedProductTaxAmount',
            label: 'Subtotal Tax',
            text: '15.12',
            type: 'currency',
        },
        TotalDeliveryAmount: {
            dataName: 'TotalDeliveryAmount',
            label: 'Shipping Subtotal',
            text: '11.99',
            type: 'currency',
        },
        TotalAdjustedProductAmount: {
            dataName: 'TotalAdjustedProductAmount',
            label: 'Subtotal',
            text: '189.0',
            type: 'currency',
        },
        OCE_Order_Total__c: {
            dataName: 'OCE_Order_Total__c',
            label: 'OCE Order Total',
            text: '217.07',
            type: 'currency',
        },
        TotalTaxAmount: {
            dataName: 'TotalTaxAmount',
            label: 'Tax',
            text: '16.08',
            type: 'currency',
        },
        TotalAdjDeliveryAmtWithTax: {
            dataName: 'TotalAdjDeliveryAmtWithTax',
            label: 'Shipping with Tax',
            text: '12.95',
            type: 'currency',
        },
        TotalProductAmountWithTax: {
            dataName: 'TotalProductAmountWithTax',
            label: 'Product Subtotal With Tax',
            text: '204.12',
            type: 'currency',
        },
        TotalDeliveryTaxAmount: {
            dataName: 'TotalDeliveryTaxAmount',
            label: 'Shipping Subtotal Tax',
            text: '0.96',
            type: 'currency',
        },
        TotalDeliveryAmountWithTax: {
            dataName: 'TotalDeliveryAmountWithTax',
            label: 'Shipping Subtotal With Tax',
            text: '12.95',
            type: 'currency',
        },
        TotalAdjProductAmtWithTax: {
            dataName: 'TotalAdjProductAmtWithTax',
            label: 'Subtotal with Tax',
            text: '204.12',
            type: 'currency',
        },
        TotalAdjustedDeliveryTaxAmount: {
            dataName: 'TotalAdjustedDeliveryTaxAmount',
            label: 'Shipping Tax',
            text: '0.96',
            type: 'currency',
        },
    },
    orderNumber: 'QNCPW-I42UW-TX3TL-EWU23',
    orderSummaryId: '1Osxx0000004CXECA2',
    orderedDate: '2022-06-13T20:29:40.000Z',
    ownerId: '005xx000001XTG5AAO',
    status: 'Created',
    totalAmount: '200.99',
};

export const orderDataProviderData: OrderData = {
    Details: data,
};
