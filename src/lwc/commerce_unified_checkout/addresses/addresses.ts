import type { Address, ContactInfo } from 'types/unified_checkout';

/**
 * change all falsey values to null
 */
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
function coalesceFalsey(v: any): any {
    return v ? v : null;
}

/**
 * shallow object equality (or a subset of key/values)
 * does not enforce hasOwnProperty
 */
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
function shallowCompare(obj1: any, obj2: any, keys: string[]): boolean {
    return keys.every((key) => coalesceFalsey(obj1[key]) === coalesceFalsey(obj2[key]));
}

/**
 * return true if both addresses ship to the same location
 */
export function isSameDeliveryAddress(firstShippingAddress?: Address, secondShippingAddress?: Address): boolean {
    if (!firstShippingAddress || !secondShippingAddress) {
        return false;
    }
    return shallowCompare(firstShippingAddress, secondShippingAddress, [
        'firstName',
        'lastName',
        'city',
        'street',
        'postalCode',
        'region',
        'country',
    ]);
}

/**
 * return true if both addresses share same location and default
 * (does not compare ID or fields)
 */
export function isSameContactPointAddress(firstAddress?: Address, secondAddress?: Address): boolean {
    if (!firstAddress || !secondAddress) {
        return false;
    }
    return shallowCompare(firstAddress, secondAddress, [
        'firstName',
        'lastName',
        'city',
        'street',
        'postalCode',
        'region',
        'country',
        'isDefault',
    ]);
}

/**
 * compare two phone numbers assuming same country code if not explictly given in both
 */
export function isSamePhoneNumber(firstPhoneNumber?: string, secondPhoneNumber?: string): boolean {
    if (!firstPhoneNumber || !secondPhoneNumber) {
        return !!firstPhoneNumber && !!secondPhoneNumber;
    }
    // strip formatting characters: space, hyphen, parens
    firstPhoneNumber = firstPhoneNumber.replace(/[-\s()]/g, '');
    secondPhoneNumber = secondPhoneNumber.replace(/[-\s()]/g, '');
    // if only one has country code, make it the first one
    if (firstPhoneNumber[0] !== '+' && secondPhoneNumber[0] === '+') {
        const t = firstPhoneNumber;
        secondPhoneNumber = firstPhoneNumber;
        firstPhoneNumber = t;
    }
    // if first has country and second doesn't then add country code
    if (
        firstPhoneNumber[0] === '+' &&
        secondPhoneNumber[0] !== '+' &&
        firstPhoneNumber.length > secondPhoneNumber.length
    ) {
        secondPhoneNumber =
            firstPhoneNumber.substring(0, firstPhoneNumber.length - secondPhoneNumber.length) + secondPhoneNumber;
    }
    return firstPhoneNumber === secondPhoneNumber;
}

/**
 * return true if both contact info are basically the same
 */
export function isSameContactInfo(firstContactInfo?: ContactInfo, secondContactInfo?: ContactInfo): boolean {
    if (!firstContactInfo || !secondContactInfo) {
        return false;
    }
    return (
        isSamePhoneNumber(firstContactInfo.phoneNumber, secondContactInfo.phoneNumber) &&
        shallowCompare(firstContactInfo, secondContactInfo, ['email', 'firstName', 'lastName'])
    );
}
