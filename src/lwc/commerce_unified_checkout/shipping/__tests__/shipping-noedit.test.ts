import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
// @ts-ignore
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
// @ts-ignore
import Shipping from 'commerce_unified_checkout/shipping';
import { SessionContextAdapter } from 'commerce/contextApi';
import { CheckoutError } from 'commerce_unified_checkout/errorHandler';

import { CheckoutInformationAdapter, notifyAndPollCheckout, CheckoutAddressAdapter } from 'commerce/checkoutApi';
import {
    generateErrorLabel,
    generateCheckoutInformationErrorLabel,
    noErrorLabels,
} from 'commerce_unified_checkout/errorHandler';
import type { ErrorLabels } from 'types/unified_checkout';
import { CheckoutStatus } from 'commerce_unified_checkout/checkoutApiInternal';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });
jest.mock('experience/data', () => ({ fetchService: jest.fn() }));

jest.mock('commerce/effectiveAccountApi', () => ({
    effectiveAccount: Object.defineProperty({}, 'accountId', {
        get: () => '1234566',
    }),
}));

jest.mock(
    '@salesforce/userPermission/AccountAddressManager',
    // we currently use 2 separate test files to enumerate the permission possibilities
    // TODO: see doMock and resetModules to use single file test
    // https://jestjs.io/docs/jest-object#jestdomockmodulename-factory-options
    () => ({ __esModule: true, default: false }),
    { virtual: true }
);

jest.mock('commerce/checkoutApi', () => {
    return Object.assign({}, jest.requireActual('commerce/checkoutApi'), {
        notifyAndPollCheckout: jest.fn().mockImplementation(() => {
            return Promise.resolve();
        }),
        waitForCheckout: jest.fn().mockImplementation(() => {
            return Promise.resolve();
        }),
        updateShippingAddress: jest.fn(),
        createContactPointAddress: jest.fn(),
        updateContactPointAddress: jest.fn().mockImplementation(() => {
            return Promise.resolve({ addressId: 'addressUpdate' });
        }),
        updateContactInformation: jest.fn().mockImplementation(() => {
            return Promise.resolve();
        }),
        CheckoutInformationAdapter: mockCreateTestWireAdapter(),
        CheckoutGuestEmailAdapter: mockCreateTestWireAdapter(),
        CheckoutAddressAdapter: mockCreateTestWireAdapter(),
    });
});

jest.mock('commerce/contextApi', () =>
    Object.assign({}, jest.requireActual('commerce/contextApi'), {
        SessionContextAdapter: mockCreateTestWireAdapter(),
        AppContextAdapter: mockCreateTestWireAdapter(),
    })
);

const generatedErrorLabel = {
    header: 'ERROR-HEADER',
    body: 'ERROR-BODY',
};

const generatedCheckoutErrorLabel = {
    header: 'CHECKOUT-ERROR-HEADER',
    body: 'CHECKOUT-ERROR-BODY',
};

const generatedIntegrationErrorLabel = {
    header: 'INTEGRATION-ERROR-HEADER',
    body: 'INTEGRATION-ERROR-BODY',
};

jest.mock('commerce_unified_checkout/errorHandler', () => {
    return Object.assign({}, jest.requireActual('commerce_unified_checkout/errorHandler'), {
        generateErrorLabel: jest.fn(() => generatedErrorLabel),
        generateCheckoutInformationErrorLabel: jest.fn(() => generatedCheckoutErrorLabel),
        generateCheckoutIntegrationErrorLabel: jest.fn(() => generatedIntegrationErrorLabel),
    });
});
const mockedGenerateErrorLabel = generateErrorLabel as jest.Mock<ErrorLabels>;
const mockedGenerateCheckoutInformationErrorLabel = generateCheckoutInformationErrorLabel as jest.Mock<ErrorLabels>;

const assertErrorShowed = (element: HTMLElement & Shipping): void => {
    const notificationContent = element.querySelector('b2c_lite_commerce-scoped-notification');
    expect(notificationContent.textContent).toContain(generatedErrorLabel.header);
    expect(notificationContent.textContent).toContain(generatedErrorLabel.body);
};

const defaultAddresses = [
    {
        addressId: 'address1',
        isDefault: true,
        name: 'Jane Doe',
        street: '123 Broadway',
        city: 'New York',
        postalCode: '11000',
        region: 'NY',
        country: 'US',
    },
    {
        addressId: 'address2',
        isDefault: false,
        name: 'John Doe',
        street: '5 Wall Street',
        city: 'Burlington',
        postalCode: '01803',
        region: 'MA',
        country: 'US',
    },
    {
        addressId: 'address3',
        isDefault: false,
        name: 'Janice Doe',
        street: '500 Broadway',
        city: 'New York',
        postalCode: '11000',
        region: 'NY',
        country: 'US',
    },
];

const error = new Error('test');

function applyRequiredLabels(element: HTMLElement & Shipping): void {
    element.componentHeaderEditAddressLabel = 'Edit Address';
    element.makeDefaultAddressLabel = 'Make Default Address';
    element.phoneNumberLabel = 'Phone Number';
    element.editAddressLabel = 'Edit';
    element.newAddressButtonLabel = 'New Address';
    element.showMore = 'Show More';
    element.backToListLabel = 'Back to List';
}

describe('commerce_unified_checkout/shipping without AccountAddressManager permission', () => {
    describe('New Address form', () => {
        let element: HTMLElement & Shipping;

        beforeEach(async () => {
            element = createElement('commerce_unified_checkout-shipping', {
                is: Shipping,
            });

            applyRequiredLabels(element);
            element.builderMode = false;

            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: true },
            });

            (<typeof CheckoutAddressAdapter & typeof TestWireAdapter>CheckoutAddressAdapter).emit({
                data: {
                    items: defaultAddresses,
                },
            });

            // keep dirty flag clear
            element.initialValue = defaultAddresses[0].addressId;
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                },
            });

            document.body.appendChild(element);
            await Promise.resolve();
        });

        afterEach(() => {
            document.body.removeChild(element);
            jest.clearAllMocks();
        });

        it('should display the radio group address list but not add new address button when for an authenticated users', () => {
            const addressList = element.querySelector('[data-shipping-radio-group]');
            const newAddressButton = element.querySelector('[data-add-new-address]');
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            expect(addressList).toBeTruthy();
            expect(newAddressButton).toBeFalsy();
            expect(inputAddress).toBeFalsy();
            expect(notifyAndPollCheckout).toHaveBeenCalledTimes(0);
        });

        it('should report validity as true', async () => {
            element.showNewAddressForm = false;
            await Promise.resolve();
            expect(element.reportValidity()).toBe(true);
        });
    });

    describe('Empty contact info list', () => {
        let element: HTMLElement & Shipping;

        beforeEach(async () => {
            element = createElement('commerce_unified_checkout-shipping', {
                is: Shipping,
            });

            applyRequiredLabels(element);
            element.builderMode = false;
            element.addresses = [];
            document.body.appendChild(element);
            await Promise.resolve();

            mockedGenerateCheckoutInformationErrorLabel.mockReturnValue(noErrorLabels);
            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: true },
            });
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                    addresses: {
                        items: [],
                    },
                    deliveryGroups: {
                        items: [
                            {
                                availableDeliveryMethods: [{ id: 'availableMethodId' }],
                            },
                        ],
                    },
                },
            });
            (<typeof CheckoutAddressAdapter & typeof TestWireAdapter>CheckoutAddressAdapter).emit({
                data: {
                    items: [],
                },
            });
        });

        afterEach(() => {
            document.body.removeChild(element);
            jest.clearAllMocks();
        });

        it('should not display the new input address and should publish an error form when address list is empty', async () => {
            await Promise.resolve();
            const addressList = element.querySelector('[data-shipping-radio-group]');
            const newAddressButton = element.querySelector('[data-add-new-address]');
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            expect(element.showNewAddressButton).toBe(false);
            expect(addressList).toBeFalsy();
            expect(newAddressButton).toBeFalsy();
            expect(inputAddress).toBeFalsy();
            expect(notifyAndPollCheckout).toHaveBeenCalledWith(new Error(CheckoutError.NO_DELIVERY_ADDRESSES));
        });

        it('should show error message if checkout API fails to load', async () => {
            (<typeof CheckoutAddressAdapter & typeof TestWireAdapter>CheckoutAddressAdapter).emit({
                error: error,
            });
            await Promise.resolve();
            expect(element.isError).toBeTruthy();
            expect(mockedGenerateErrorLabel).toHaveBeenCalledWith(error);
            assertErrorShowed(element);
        });
    });
});
