// @ts-ignore
import {
    isSameContactInfo,
    isSameContactPointAddress,
    isSameDeliveryAddress,
    isSamePhoneNumber,
} from 'commerce_unified_checkout/addresses';
import type { Address, ContactInfo } from 'types/unified_checkout';

const deliveryAddress1: Address = {
    name: 'Name1',
    street: 'Street1',
    city: 'City1',
    region: 'ON',
    postalCode: '12345',
    country: 'US',
    isDefault: true,
};
const deliveryAddress2: Address = {
    name: 'Name2',
    street: 'Street2',
    city: 'City1',
    region: 'ON',
    postalCode: '12345',
    country: 'US',
    isDefault: false,
};
const deliveryAddress2a: Address = {
    ...deliveryAddress2,
    isDefault: true,
};

describe('isSameDeliveryAddress', () => {
    it('evaluate delivery address equality', () => {
        expect(isSameDeliveryAddress(deliveryAddress1, deliveryAddress2)).toBe(false);
        expect(isSameDeliveryAddress(deliveryAddress1, deliveryAddress1)).toBe(true);
        expect(isSameDeliveryAddress(deliveryAddress2, deliveryAddress2a)).toBe(true);
        expect(isSameDeliveryAddress(undefined, deliveryAddress2)).toBe(false);
        expect(isSameDeliveryAddress(deliveryAddress1, undefined)).toBe(false);
    });
});

describe('isSameContactPointAddress', () => {
    it('evaluate contact point address equality', () => {
        expect(isSameContactPointAddress(deliveryAddress1, deliveryAddress2)).toBe(false);
        expect(isSameContactPointAddress(deliveryAddress1, deliveryAddress1)).toBe(true);
        expect(isSameContactPointAddress(deliveryAddress2, deliveryAddress2a)).toBe(false);
        expect(isSameContactPointAddress(undefined, deliveryAddress2)).toBe(false);
        expect(isSameContactPointAddress(deliveryAddress1, undefined)).toBe(false);
    });
});

describe('isSamePhoneNumber', () => {
    it('evaluate phone number equality', () => {
        expect(isSamePhoneNumber('+15551212', '5551213')).toBe(false);
        expect(isSamePhoneNumber('+15551212', '5551212')).toBe(true);
        expect(isSamePhoneNumber('5551212', '+15551212')).toBe(true);
        // from CheckoutValidationServiceImplTest#testPhoneNumberFormat
        expect(isSamePhoneNumber('+16175551212', '+16175551212')).toBe(true);
        expect(isSamePhoneNumber('+16175551212', '+1-617-555-1212')).toBe(true);
        expect(isSamePhoneNumber('+16175551212', '+1 617 555 1212')).toBe(true);
        expect(isSamePhoneNumber('+16175551212', '+1(617)555-1212')).toBe(true);
        expect(isSamePhoneNumber('+16175551212', '1(617)555-1212')).toBe(true);
        expect(isSamePhoneNumber('+16175551212', '(617)555-1212')).toBe(true);
        expect(isSamePhoneNumber('+16175551212', '617-555-1212')).toBe(true);
        expect(isSamePhoneNumber('+16175551212', '+1-(617)555-1212')).toBe(true);
        expect(isSamePhoneNumber('+919820031256', '+91 98200 31256')).toBe(true);
    });
});

describe('isSameContactInfo', () => {
    it('evaluate contact info equality', () => {
        const phoneNumber = '+15551212';
        const contactInfo1: ContactInfo = {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@test.com',
            phoneNumber: '5551212',
        };
        const contactInfo2: ContactInfo = {
            firstName: 'Jack',
            lastName: 'Doe',
            email: 'jane@test.com',
            phoneNumber: '5551212',
        };

        expect(isSameContactInfo(contactInfo1, contactInfo2)).toBe(false);
        expect(isSameContactInfo(contactInfo1, contactInfo1)).toBe(true);
        expect(isSameContactInfo(contactInfo1, { ...contactInfo1, phoneNumber: '' })).toBe(false);
        expect(isSameContactInfo({ ...contactInfo1, phoneNumber }, contactInfo1)).toBe(true);
        expect(isSameContactInfo(contactInfo1, { ...contactInfo1, phoneNumber })).toBe(true);
        expect(isSameContactInfo(undefined, contactInfo2)).toBe(false);
        expect(isSameContactInfo(contactInfo1, undefined)).toBe(false);
    });
});
