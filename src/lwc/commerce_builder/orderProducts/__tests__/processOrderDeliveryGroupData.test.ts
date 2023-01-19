import { orderDeliveryGroupDataResponse } from './data/orderDeliveryGroupDataResponse';
import { getShippingFieldsForOrderDeliveryGroup, processODGData } from '../processOrderDeliveryGroupsData';
import type { OrderDeliveryGroupData } from 'commerce/orderApi';
import { multipleOrderDlieveryGroupsDataResponse } from './data/orderDeliveryGroupDataResponse';

describe('getShippingFieldsForOrderDeliveryGroup', () => {
    const expectedResult = [
        { dataName: 'Name', label: 'Name', text: 'Order Delivery Method1', type: 'string' },
        {
            dataName: 'TotalAmount',
            label: 'User Custom Label different from that of api data response',
            text: '11.99',
            type: 'currency',
        },
    ];

    const shippingUiFieldsRequested = [
        {
            entity: 'OrderDeliveryMethod',
            name: 'Name',
            label: 'Name',
            type: 'Text(255)',
        },
        {
            entity: 'OrderDeliveryGroupSummary',
            name: 'TotalAmount',
            label: 'User Custom Label different from that of api data response',
            type: 'Currency(16, 2)',
        },
        {
            entity: 'Product2',
            name: 'thisFieldDoesNotExist',
            label: 'Pretax Total',
            type: 'Currency(16, 2)',
        },
    ];
    it('returns a list of the shipping fields that exist for an orderDeliveryGroup', () => {
        const fieldsToShow = getShippingFieldsForOrderDeliveryGroup(
            <OrderDeliveryGroupData>orderDeliveryGroupDataResponse.orderDeliveryGroups?.[0],
            shippingUiFieldsRequested
        );
        expect(fieldsToShow).toStrictEqual(expectedResult);
    });
});

describe('processODGData', () => {
    it('sets the groupTitle, shippingFields and orderDeliveryGroupSummaryId', () => {
        const formattedODG = processODGData(
            <OrderDeliveryGroupData[]>multipleOrderDlieveryGroupsDataResponse.orderDeliveryGroups,
            [],
            'ship to'
        );
        expect(formattedODG[0].groupTitle).toBeDefined();
        expect(formattedODG[0].shippingFields).toBeDefined();
        expect(formattedODG[0].orderDeliveryGroupSummaryId).toBeDefined();
    });
});
