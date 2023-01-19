import type { OrderDeliveryGroup, ProductVariant } from './types';
import type { OrderItemSummaryData, OrderItemAdjustmentInput, EntityField } from 'commerce/orderApi';
import type { FieldMapping } from 'commerce_builder/orderProducts';
const TOTAL_FIELD_ENTITY_NAME = 'OrderItemSummary.AdjustedLineAmount';
const IS_ACTIVE_FIELD = 'Product2.IsActive';

import type { OrderItem } from 'commerce_my_account/orderDeliveryGroupContainer';
import { deepClone } from 'experience/util';

export function processOrderItemData(
    orderDeliveryGroup: OrderDeliveryGroup,
    newFormattedItems: OrderItem[],
    nextPageToken: string | null | undefined
): OrderDeliveryGroup {
    return {
        ...orderDeliveryGroup,
        orderItemsErrorMessage: undefined,
        orderItems: orderDeliveryGroup.orderItems
            ? orderDeliveryGroup.orderItems.concat(newFormattedItems)
            : newFormattedItems,
        orderItemsHasNextPage: nextPageToken ? true : false,
        orderItemNextPageToken: nextPageToken,
    };
}

/*
    returns the Fields that exist for the orderItem.  
*/
export function itemFieldsList(productFieldMapping: FieldMapping[], item: OrderItemSummaryData): EntityField[] {
    return productFieldMapping.reduce((result, field) => {
        const fieldFullName = field.entity + '.' + field.name;
        if (field.entity === 'OrderAdjustmentAggregateSummary') {
            const value =
                field.name === 'TotalLinePromotionAmount'
                    ? item.adjustmentAggregates.totalLinePromotionAmount
                    : item.adjustmentAggregates.totalPromotionDistAmount;
            if (value && Number(value) !== 0) {
                result.push({ label: field.label, text: value, type: 'Currency', dataName: field.name });
            }
        } else if (item.fields[fieldFullName]) {
            result.push({ ...item.fields[fieldFullName], label: field.label });
        } else if (item.product.fields[fieldFullName]) {
            result.push({ ...item.product.fields[fieldFullName], label: field.label });
        }
        return result;
    }, <EntityField[]>[]);
}

/* 
    sets the total price field, name field, truncated orderItemSummaryId and converts the entity fields to Field type
    for an orderItem. 
*/
export function formatOrderItems(
    itemsData: OrderItemSummaryData[],
    productFieldMapping: FieldMapping[],
    showTotal: boolean
): OrderItem[] {
    // make a deep copy of the orderItems to safely mutate them.
    const items = deepClone(itemsData).value;
    return items.reduce((result, item) => {
        const totalPrice =
            showTotal && item.fields?.[TOTAL_FIELD_ENTITY_NAME]?.text
                ? Number(item.fields[TOTAL_FIELD_ENTITY_NAME].text)
                : undefined;
        item.product.media.url = item.product.media.thumbnailUrl || item.product.media.url;
        const itemFields = itemFieldsList(productFieldMapping, item);
        const isItemValid = Boolean(
            item.product?.canViewProduct && item.product.fields?.[IS_ACTIVE_FIELD]?.text === 'true'
        );
        //set product variant property
        const variants: ProductVariant[] = [];
        if (item.product?.productAttributes?.attributes.length) {
            for (const attribute of item.product.productAttributes.attributes) {
                variants.push({ name: attribute.label, value: attribute.value });
            }
        }
        result.push({
            ...(item.product as unknown as OrderItem),
            name: item.product.fields?.['Product2.Name']?.text,
            orderItemSummaryId: item.orderItemSummaryId.slice(0, 15),
            fields: itemFields,
            totalPrice: totalPrice,
            isValid: isItemValid,
            variants: variants,
        });
        return result;
    }, <OrderItem[]>[]);
}

export function orderItemIds(orderItemSummary: OrderItemSummaryData[]): OrderItemAdjustmentInput[] {
    return orderItemSummary.map((item) => {
        return { orderItemSummaryId: item.orderItemSummaryId };
    });
}
