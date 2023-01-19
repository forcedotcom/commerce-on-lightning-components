import type { EntityField } from 'commerce/orderApi';
import type { AddressValue } from 'commerce_my_account/orders';
import { ADDRESS_INNER_FIELDS } from './orders';
import { needAccountIdLabel, genericErrorMessage } from './labels';

export default function getAddressValues(orderFieldMap: Map<string, EntityField>): AddressValue {
    return {
        city: orderFieldMap.get(ADDRESS_INNER_FIELDS[0])?.text || '',
        country: orderFieldMap.get(ADDRESS_INNER_FIELDS[1])?.text || '',
        state: orderFieldMap.get(ADDRESS_INNER_FIELDS[2])?.text || '',
        postalcode: orderFieldMap.get(ADDRESS_INNER_FIELDS[3])?.text || '',
        street: orderFieldMap.get(ADDRESS_INNER_FIELDS[4])?.text || '',
        latitude: orderFieldMap.get(ADDRESS_INNER_FIELDS[5])?.text || '',
        longitude: orderFieldMap.get(ADDRESS_INNER_FIELDS[6])?.text || '',
    };
}

export function getCoordinate(orderFieldValue: string): string[] {
    return orderFieldValue.slice(orderFieldValue.indexOf('[') + 1, orderFieldValue.indexOf(']')).split(' ');
}

export function getCoordinateValues(coordinates: string[]): AddressValue {
    return {
        latitude: coordinates[0],
        longitude: coordinates[1],
    };
}

export function getErrorMessage(previewMode: boolean, accountId: string | undefined): string {
    return previewMode && !accountId ? needAccountIdLabel : genericErrorMessage;
}
