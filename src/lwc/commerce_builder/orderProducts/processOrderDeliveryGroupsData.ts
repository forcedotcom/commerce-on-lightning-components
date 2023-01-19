import type { OrderDeliveryGroup } from 'commerce_my_account/orderDeliveryGroupContainer';
import { formatAddress } from './formatAddress';
import type { EntityField } from 'commerce/orderApi';
import type { OrderDeliveryGroupData } from 'commerce/orderApi';
import type { FieldMapping } from './types';
import { getEntityFieldNames } from './helpers';

/*
 * returns the subset of the ui shipping fields the user selected in the field picker that actually exist in the orderDeliveryGroupData.
 */
export function getShippingFieldsForOrderDeliveryGroup(
    orderDeliveryGroup: OrderDeliveryGroupData,
    shippingFieldMapping: FieldMapping[]
): EntityField[] {
    return shippingFieldMapping.reduce((result, field) => {
        const entityName = getEntityFieldNames([field])[0];
        if (orderDeliveryGroup.fields[entityName]) {
            result.push({ ...orderDeliveryGroup.fields[entityName], label: field.label });
        }
        return result;
    }, <EntityField[]>[]);
}

/**
 * @description sets the odg id, odg shipping fields, and odg address using the data from the wire adapter
 */
export function processODGData(
    data: OrderDeliveryGroupData[],
    shippingFieldMapping: FieldMapping[],
    prefixToShippingGroup: string
): OrderDeliveryGroup[] {
    return data.map((rawOrderDeliveryGroupApiData) => {
        let groupTitle = prefixToShippingGroup;
        const rawAddressValue =
            rawOrderDeliveryGroupApiData.fields?.['OrderDeliveryGroupSummary.DeliverToAddress']?.text;
        if (rawAddressValue) {
            const formattedAddress = formatAddress(rawAddressValue);
            groupTitle =
                prefixToShippingGroup === '' ? formattedAddress : prefixToShippingGroup + ': ' + formattedAddress;
        }
        return {
            groupTitle: groupTitle,
            shippingFields: getShippingFieldsForOrderDeliveryGroup(rawOrderDeliveryGroupApiData, shippingFieldMapping),
            orderDeliveryGroupSummaryId: rawOrderDeliveryGroupApiData.fields?.['OrderDeliveryGroupSummary.Id']?.text,
            orderItemsHasNextPage: false,
        };
    });
}
