import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
// @ts-ignore
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
// @ts-ignore
import Shipping from 'commerce_unified_checkout/shipping';
// @ts-ignore
import ShippingDesignSubstitute from 'commerce_unified_checkout/shippingDesignSubstitute';
import { SessionContextAdapter } from 'commerce/contextApi';

import {
    CheckoutInformationAdapter,
    notifyAndPollCheckout,
    waitForCheckout,
    updateShippingAddress,
    createContactPointAddress,
    updateContactPointAddress,
    updateContactInformation,
    CheckoutGuestEmailAdapter,
    CheckoutAddressAdapter,
} from 'commerce/checkoutApi';
import { CheckoutMode } from 'commerce_unified_checkout/checkoutMode';
import {
    generateErrorLabel,
    generateCheckoutInformationErrorLabel,
    noErrorLabels,
} from 'commerce_unified_checkout/errorHandler';
import type { Address, CheckoutInformation, ErrorLabels } from 'types/unified_checkout';
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
    () => ({ __esModule: true, default: true }),
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

// Create a new variable and type it as jest.Mock passing the type
// https://klzns.github.io/how-to-use-type-script-and-jest-mocks
const mockCreateContactPointAddress = createContactPointAddress as jest.Mock<Promise<Address>>;
const mockedUpdateShippingAddress = updateShippingAddress as jest.Mock<Promise<CheckoutInformation>>;
const mockedUpdateContactInformation = updateContactInformation as jest.Mock<Promise<CheckoutInformation>>;
const mockWaitForCheckout = waitForCheckout as jest.Mock<Promise<CheckoutInformation>>;

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
        firstName: 'Jane',
        lastName: 'Doe',
        street: '123 Broadway',
        city: 'New York',
        postalCode: '11000',
        region: 'NY',
        country: 'US',
    },
    {
        addressId: 'address2',
        isDefault: false,
        firstName: 'John',
        lastName: 'Doe',
        street: '5 Wall Street',
        city: 'Burlington',
        postalCode: '01803',
        region: 'MA',
        country: 'US',
    },
    {
        addressId: 'address3',
        isDefault: false,
        firstName: 'Janice',
        lastName: 'Doe',
        street: '500 Broadway',
        city: 'New York',
        postalCode: '11000',
        region: 'NY',
        country: 'US',
    },
];

const editedAddress = { firstName: 'Philip', lastName: 'Sherman', city: 'Sydney', street: '24 Wallaby Way' };

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

const testAddress = {
    firstName: 'Philip',
    lastName: 'Sherman',
    city: 'Burlington',
    street: '5 Wall ST',
    country: 'US',
    postalCode: '01803',
    region: 'MA',
    isDefault: false,
};

const testContactInfo = {
    firstName: 'Philip',
    lastName: 'Sherman',
    email: '',
    phoneNumber: '6178876666',
};

async function checkoutSaveShippingAddressAndContactInfo(element: HTMLElement & Shipping): Promise<void> {
    (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
        data: { isLoggedIn: false },
    });

    (<typeof CheckoutGuestEmailAdapter & typeof TestWireAdapter>CheckoutGuestEmailAdapter).emit({
        data: 'test@gmail.com',
    });

    await Promise.resolve();
    const inputAddress = element.querySelector('[data-shipping-input-address]');
    inputAddress.address = testAddress;

    inputAddress.contactInfo = testContactInfo;

    jest.spyOn(inputAddress, 'reportValidity').mockReturnValue(true);
    mockedUpdateShippingAddress.mockImplementation(() => {
        return Promise.resolve({
            checkoutId: '2z9xx00000000ODAAY',
            contactInfo: { ...testContactInfo, email: 'test@gmail.com' },
            deliveryGroups: {
                items: [
                    {
                        deliveryAddress: testAddress,
                    },
                ],
            },
        } as CheckoutInformation);
    });
}

describe('commerce_unified_checkout/shipping with AccountAddressManager permission', () => {
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

        it('should not show error if checkout API fails to load', async () => {
            const apiError = { error: error };
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit(apiError);
            await Promise.resolve();
            expect(element.isError).toBeFalsy();
        });

        it('should not show 422 integration error message if checkout API fails to load', async () => {
            const integrationError = { data: { errors: [{ detail: 'some 422 error' }] } };
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit(
                integrationError
            );
            await Promise.resolve();
            expect(element.isError).toBeFalsy();
        });

        it('should not show error if not checkout info update request is sent but checkout API fails to load', async () => {
            const apiError = { error: error };
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit(apiError);
            await Promise.resolve();
            expect(element.isError).toBeFalsy();
            expect(mockedGenerateCheckoutInformationErrorLabel).not.toHaveBeenCalled();
        });

        it('should not show 422 integration error message if if not checkout info update request is sent but checkout API fails to load', async () => {
            const integrationError = { data: { errors: [{ detail: 'some 422 error' }] } };
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit(
                integrationError
            );
            await Promise.resolve();
            expect(element.isError).toBeFalsy();
            expect(mockedGenerateCheckoutInformationErrorLabel).not.toHaveBeenCalled();
        });

        it('should not show error if checkout API loads without error', () => {
            expect(element.isError).toBeFalsy();
            const notificationContent = element.querySelector('b2c_lite_commerce-scoped-notification');
            expect(notificationContent.textContent).not.toContain(generatedErrorLabel.header);
        });

        it('should not duplicate the default address in the shown limit', async () => {
            await Promise.resolve();
            expect(element.addresses).toHaveLength(3);
        });

        it('should display the input address form screen when add new address button is clicked', async () => {
            const newAddressButton = element.querySelector('[data-add-new-address]');
            newAddressButton.click();
            await Promise.resolve();
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            expect(inputAddress).toBeTruthy();
            expect(element.showNewAddressButton).toBe(false);
            expect(element.showAddressList).toBe(false);
        });

        it('should NOT have new form address be the default address, if addresses exist', async () => {
            const newAddressButton = element.querySelector('[data-add-new-address]');
            newAddressButton.click();
            await Promise.resolve();
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            expect(inputAddress).toBeTruthy();
            const defaultAddressCheckbox = inputAddress.querySelector('[data-default-address-checkbox]');
            expect(defaultAddressCheckbox.checked).toBeFalsy();
        });

        it('has a new form with correct labels', async () => {
            const newAddressButton = element.querySelector('[data-add-new-address]');
            newAddressButton.click();
            await Promise.resolve();
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            expect(inputAddress).toBeTruthy();
            expect(inputAddress.backToListLabel).toBe('Back to List');
        });

        it('should switch back to the address list screen when back to list link is clicked', async () => {
            const newAddressButton = element.querySelector('[data-add-new-address]');
            const addressList = element.querySelector('[data-shipping-radio-group]');
            expect(addressList).toBeTruthy();
            newAddressButton.click();
            await Promise.resolve();
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            const backToListLink = inputAddress.querySelector('[data-back-to-list-link]');
            expect(inputAddress).toBeTruthy();
            expect(backToListLink).toBeTruthy();
            expect(element.showAddressList).toBe(false);
            backToListLink.click();
            expect(element.showNewAddressForm).toBe(false);
            expect(element.showNewAddressButton).toBe(true);
            expect(element.showAddressList).toBe(true);
        });

        it('should display the radio group address list and add new address button when for an authenticated users', () => {
            const addressList = element.querySelector('[data-shipping-radio-group]');
            const newAddressButton = element.querySelector('[data-add-new-address]');
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            expect(addressList).toBeTruthy();
            expect(newAddressButton).toBeTruthy();
            expect(inputAddress).toBeFalsy();
        });

        it('should let you get and set the backToListLabel', () => {
            element.backToListLabel = 'test';
            expect(element.backToListLabel).toBe('test');
            element.backToListLabel = 'test 1';
            expect(element.backToListLabel).toBe('test 1');
        });

        it('should dispatch "dataready" event when input Address changes and valid', async () => {
            element.showNewAddressForm = true;
            jest.useFakeTimers();
            jest.spyOn(global, 'setTimeout');
            jest.spyOn(global, 'clearTimeout');
            let dispatched = false;
            element.addEventListener('dataready', () => {
                dispatched = true;
            });

            await Promise.resolve();
            // @ts-ignore
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            jest.spyOn(inputAddress, 'checkValidity').mockReturnValue(true);
            inputAddress.dispatchEvent(
                new CustomEvent('addresschanged', {
                    composed: true,
                    bubbles: true,
                    detail: {
                        valid: true,
                    },
                })
            );

            jest.advanceTimersByTime(3000);
            expect(setTimeout).toHaveBeenCalledTimes(1);
            await Promise.resolve();
            expect(dispatched).toBe(true);

            inputAddress.dispatchEvent(
                new CustomEvent('addresschanged', {
                    composed: true,
                    bubbles: true,
                    detail: {
                        valid: true,
                    },
                })
            );

            jest.advanceTimersByTime(2);
            expect(clearTimeout).toHaveBeenCalledTimes(1);
            jest.clearAllTimers();
        });

        it('should not dispatch "dataready" event when input Address changes is invalid', async () => {
            element.showNewAddressForm = true;
            jest.useFakeTimers();
            jest.spyOn(global, 'setTimeout');
            let dispatched = false;
            element.addEventListener('dataready', () => {
                dispatched = true;
            });

            await Promise.resolve();
            // @ts-ignore
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            jest.spyOn(inputAddress, 'checkValidity').mockReturnValue(false);
            inputAddress.dispatchEvent(
                new CustomEvent('addresschanged', {
                    composed: true,
                    bubbles: true,
                    detail: {
                        valid: false,
                    },
                })
            );

            jest.advanceTimersByTime(3000);
            expect(setTimeout).toHaveBeenCalledTimes(1);
            await Promise.resolve();
            expect(dispatched).toBe(false);
            expect(element.checkValidity).toBeFalsy();
            jest.clearAllTimers();
        });

        it('should dispatch "dataready" event when an address is selected from CPA list', async () => {
            let dispatched = false;
            element.addEventListener('dataready', () => {
                dispatched = true;
            });

            await Promise.resolve();
            // @ts-ignore
            const cpaAddress = element.querySelector('[data-shipping-radio-group]');
            //element.checkValidity = () => true;
            cpaAddress.dispatchEvent(
                new CustomEvent('changeaddressoption', {
                    detail: {
                        value: 'addressId',
                    },
                })
            );
            await Promise.resolve();
            expect(dispatched).toBe(true);
        });

        it('should dispatch "dataready" event when an address is edited from CPA list', async () => {
            let dispatched = false;
            element.addEventListener('dataready', () => {
                dispatched = true;
            });

            await Promise.resolve();
            // @ts-ignore
            const cpaAddress = element.querySelector('[data-shipping-radio-group]');
            //element.checkValidity = () => true;
            cpaAddress.dispatchEvent(
                new CustomEvent('editaddress', {
                    detail: {
                        value: 'address2',
                    },
                })
            );
            await Promise.resolve();
            expect(dispatched).toBe(true);
        });

        it('should not dispatch "dataready" event when an invalid address is edited from CPA list', async () => {
            let dispatched = false;
            element.addEventListener('dataready', () => {
                dispatched = true;
            });

            await Promise.resolve();
            // @ts-ignore
            const cpaAddress = element.querySelector('[data-shipping-radio-group]');
            //element.checkValidity = () => true;
            cpaAddress.dispatchEvent(
                new CustomEvent('editaddress', {
                    detail: {
                        value: 'addressInvalid',
                    },
                })
            );
            expect(dispatched).toBe(false);
        });

        it('should reload the contact info on refresh for the guest user when not dirty', async () => {
            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: false },
            });

            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                    contactInfo: {
                        phoneNumber: '6178876666',
                    },
                },
            });

            await Promise.resolve();
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            expect(inputAddress.contactInfo).toEqual({
                firstName: '',
                lastName: '',
                phoneNumber: '6178876666',
            });
        });

        it('should set the contact info phoneNumber to empty string when no data from store', async () => {
            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: false },
            });

            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                    contactInfo: {},
                },
            });

            await Promise.resolve();
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            expect(inputAddress.contactInfo).toEqual({
                firstName: '',
                lastName: '',
                phoneNumber: '',
            });
        });

        it('should report validity as true', async () => {
            element.showNewAddressForm = false;
            await Promise.resolve();
            expect(element.reportValidity()).toBe(true);
        });

        it('should report validity as true with a new complete address form', async () => {
            element.showNewAddressForm = true;
            element.address = defaultAddresses[0];
            await Promise.resolve();
            expect(element.reportValidity()).toBe(true);
        });

        it('should report validity as false with new incomplete address form', async () => {
            element.showNewAddressForm = true;
            await Promise.resolve();
            expect(element.reportValidity()).toBe(false);
        });
    });

    describe('show more button', () => {
        let element: HTMLElement & Shipping;

        beforeEach(async () => {
            element = createElement('commerce_unified_checkout-shipping', {
                is: Shipping,
            });

            applyRequiredLabels(element);
            element.builderMode = false;
            element.shippingAddressLimit = 1;
            element.shippingAddressLimitIncrease = 1;
            document.body.appendChild(element);

            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: true },
            });

            (<typeof CheckoutAddressAdapter & typeof TestWireAdapter>CheckoutAddressAdapter).emit({
                data: {
                    nextPageUrl: 'url',
                    items: defaultAddresses,
                },
            });

            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                },
            });

            await Promise.resolve();
        });

        afterEach(() => {
            document.body.removeChild(element);
            jest.clearAllMocks();
        });

        it('should increment the limit', async () => {
            await Promise.resolve();
            expect(element.shippingAddressLimit).toBe(1);
            const showMoreButton = element.querySelector('[data-show-more-addresses]');
            showMoreButton.click();
            expect(element.shippingAddressLimit).toBe(2);
        });
    });

    describe('Proceed button', () => {
        let element: HTMLElement & Shipping;

        const mockAddresses = [
            {
                addressId: 'address1',
                firstName: 'P',
                lastName: 'Sherman',
                city: 'Sydney',
                street: '42 Wallaby Way',
                country: 'US',
                isDefault: true,
            },
            {
                addressId: 'address2',
                isDefault: false,
            },
        ];

        const mockCheckoutInformation = {
            checkoutId: '2z9xx00000000ODAAY',
            deliveryGroups: {
                items: [
                    {
                        availableDeliveryMethods: [{ id: 'availableMethodId' }],
                        deliveryAddress: mockAddresses[0],
                    },
                ],
            },
        };

        const mockCheckoutInformationAddress2 = {
            checkoutId: '2z9xx00000000ODAAY',
            deliveryGroups: {
                items: [
                    {
                        availableDeliveryMethods: [{ id: 'availableMethodId' }],
                        deliveryAddress: mockAddresses[1],
                    },
                ],
            },
        };
        beforeEach(async () => {
            mockCreateContactPointAddress.mockImplementation(() => {
                return Promise.resolve({
                    ...editedAddress,
                    addressId: 'addressNew',
                } as Address);
            });
            mockedUpdateShippingAddress.mockImplementation(() => {
                return Promise.resolve(mockCheckoutInformation as CheckoutInformation);
            });
            mockWaitForCheckout.mockImplementation(() => {
                return Promise.resolve(mockCheckoutInformation as CheckoutInformation);
            });

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
                    ...mockCheckoutInformation,
                    checkoutStatus: CheckoutStatus.Ready,
                    deliveryGroups: {
                        items: [
                            {
                                availableDeliveryMethods: [{ id: 'availableMethodId' }],
                                deliveryAddress: mockAddresses[0],
                            },
                        ],
                    },
                },
            });
            (<typeof CheckoutAddressAdapter & typeof TestWireAdapter>CheckoutAddressAdapter).emit({
                data: {
                    items: mockAddresses,
                },
            });
        });

        afterEach(() => {
            document.body.removeChild(element);
            jest.clearAllMocks();
        });

        it('should show error and not proceed when set shipping address API throws an error', async () => {
            mockedUpdateShippingAddress.mockImplementation(() => {
                // see https://developer.mozilla.org/en-US/docs/Web/API/Response
                return Promise.reject(error);
            });

            element.initialValue = mockAddresses[1].addressId;
            expect.assertions(8);
            await Promise.resolve();
            expect(element.isError).toBeFalsy();
            await expect(element.checkoutSave()).rejects.toEqual(error);
            expect(updateShippingAddress).toHaveBeenCalledTimes(1);
            expect(notifyAndPollCheckout).toHaveBeenCalledTimes(0);
            expect(waitForCheckout).toHaveBeenCalledTimes(0);

            expect(element.isError).toBeTruthy();
            assertErrorShowed(element);
        });

        it('should update shipping address if the previous shipping address update is failed', async () => {
            mockedUpdateShippingAddress.mockImplementation(() => {
                // see https://developer.mozilla.org/en-US/docs/Web/API/Response
                return Promise.reject(error);
            });
            element.initialValue = mockAddresses[1].addressId;
            await Promise.resolve();
            await expect(element.checkoutSave()).rejects.toEqual(error);

            mockedUpdateShippingAddress.mockReset();
            await element.checkoutSave();
            expect(mockedUpdateShippingAddress).toHaveBeenCalledTimes(1);
        });

        it('should proceed and not show an error when set shipping address API succeeds', async () => {
            mockedUpdateShippingAddress.mockImplementation(() => {
                return Promise.resolve(mockCheckoutInformationAddress2 as CheckoutInformation);
            });
            mockWaitForCheckout.mockImplementation(() => {
                return Promise.resolve(mockCheckoutInformationAddress2 as CheckoutInformation);
            });
            element.initialValue = mockAddresses[1].addressId;
            await Promise.resolve();
            expect(element.initialValue).toBe(mockAddresses[1].addressId);
            expect(element.isError).toBeFalsy();
            await expect(element.checkoutSave()).resolves.toBeUndefined();
            expect(updateShippingAddress).toHaveBeenCalledTimes(1);
            expect(notifyAndPollCheckout).toHaveBeenCalledTimes(1);
            expect(waitForCheckout).toHaveBeenCalledTimes(1);
            expect(element.isError).toBeFalsy();
        });

        it('should not proceed and show an error when no delivery methods available', async () => {
            mockWaitForCheckout.mockImplementation(() => {
                return Promise.resolve({
                    checkoutId: '2z9xx00000000ODAAY',
                    deliveryGroups: {
                        items: [
                            {
                                deliveryAddress: mockAddresses[0],
                            },
                        ],
                    },
                } as CheckoutInformation);
            });
            expect.assertions(6);
            await Promise.resolve();
            await expect(element.checkoutSave()).rejects.toThrow('no available methods for delivery address');
            expect(updateShippingAddress).toHaveBeenCalledTimes(0);
            expect(notifyAndPollCheckout).toHaveBeenCalledTimes(0);
            expect(waitForCheckout).toHaveBeenCalledTimes(1);
            expect(mockedGenerateErrorLabel).toHaveBeenCalledWith('B2C_Lite_Checkout.noDeliveryMethodsBody');
            expect(element.isError).toBeTruthy();
        });

        it('should set shipping address (and not create CPA) when radio selected', async () => {
            mockedUpdateShippingAddress.mockImplementation(() => {
                return Promise.resolve(mockCheckoutInformationAddress2 as CheckoutInformation);
            });
            mockWaitForCheckout.mockImplementation(() => {
                return Promise.resolve(mockCheckoutInformationAddress2 as CheckoutInformation);
            });
            const addressList = element.querySelector('[data-shipping-radio-group]');
            addressList.value = 'address2';

            await element.checkoutSave();
            expect(updateShippingAddress).toHaveBeenCalledTimes(1);
            expect(createContactPointAddress).toHaveBeenCalledTimes(0);
        });

        it('should set shipping address and not proceed with an integration error', async () => {
            mockedUpdateShippingAddress.mockImplementation(() => {
                return Promise.resolve(mockCheckoutInformationAddress2 as CheckoutInformation);
            });
            mockWaitForCheckout.mockImplementation(() => {
                return Promise.resolve({
                    mockCheckoutInformationAddress2,
                    errors: [
                        {
                            detail: 'System.CalloutException',
                            title: 'There are issues with your checkout. Please try updating it.',
                            type: '/commerce/errors/shipping-failure',
                            instance: '',
                        },
                    ],
                } as CheckoutInformation);
            });
            const addressList = element.querySelector('[data-shipping-radio-group]');
            addressList.value = 'address2';

            expect.assertions(6);
            expect(element.isError).toBeFalsy();
            await expect(element.checkoutSave()).rejects.toEqual(new Error('INTEGRATION-ERROR-BODY'));

            expect(updateShippingAddress).toHaveBeenCalledTimes(1);
            expect(notifyAndPollCheckout).toHaveBeenCalledTimes(1);
            expect(waitForCheckout).toHaveBeenCalledTimes(1);
            expect(element.isError).toBeTruthy();
        });

        it('should set shipping address (and not create/update CPA) when address form is unchanged when editing a unselected CPA address', async () => {
            mockedUpdateShippingAddress.mockImplementation(() => {
                return Promise.resolve({
                    checkoutId: '2z9xx00000000ODAAY',
                    deliveryGroups: {
                        items: [
                            {
                                deliveryAddress: defaultAddresses[0],
                            },
                        ],
                    },
                } as CheckoutInformation);
            });
            element.showNewAddressForm = true;
            await Promise.resolve();

            const inputAddress = element.querySelector('[data-shipping-input-address]');

            inputAddress.address = defaultAddresses[0];
            element.address = defaultAddresses[0];

            jest.spyOn(inputAddress, 'reportValidity').mockReturnValue(true);

            await element.checkoutSave();
            expect(updateShippingAddress).toHaveBeenCalledTimes(1);
            expect(createContactPointAddress).toHaveBeenCalledTimes(0);
            expect(updateContactPointAddress).toHaveBeenCalledTimes(0);
        });
        it('should not set shipping address (and not create/update CPA) when address form is unchanged when editing a selected CPA address', async () => {
            element.showNewAddressForm = true;
            await Promise.resolve();

            const inputAddress = element.querySelector('[data-shipping-input-address]');

            inputAddress.address = mockAddresses[0];
            element.address = mockAddresses[0];

            jest.spyOn(inputAddress, 'reportValidity').mockReturnValue(true);

            await element.checkoutSave();
            expect(updateShippingAddress).toHaveBeenCalledTimes(0);
            expect(createContactPointAddress).toHaveBeenCalledTimes(0);
            expect(updateContactPointAddress).toHaveBeenCalledTimes(0);
        });
        it('should not set shipping address (and update CPA) when address form is unchanged but default is', async () => {
            element.showNewAddressForm = true;
            await Promise.resolve();

            // the component's address on initialization is the CPA that has isDefault=true
            // here, we set the address inputed as that address to simulate nothing has changed
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            inputAddress.address = {
                addressId: 'address1',
                firstName: 'P',
                lastName: 'Sherman',
                city: 'Sydney',
                street: '42 Wallaby Way',
                country: 'US',
            };

            jest.spyOn(inputAddress, 'reportValidity').mockReturnValue(true);

            await element.checkoutSave();
            expect(updateShippingAddress).toHaveBeenCalledTimes(0);
            expect(createContactPointAddress).toHaveBeenCalledTimes(0);
            expect(updateContactPointAddress).toHaveBeenCalledTimes(1);
        });
        it('should set shipping address and create new CPA when new address added', async () => {
            mockedUpdateShippingAddress.mockImplementation(() => {
                return Promise.resolve({
                    checkoutId: '2z9xx00000000ODAAY',
                    deliveryGroups: {
                        items: [
                            {
                                deliveryAddress: editedAddress,
                            },
                        ],
                    },
                } as CheckoutInformation);
            });
            element.showNewAddressForm = true;
            await Promise.resolve();

            const inputAddress = element.querySelector('[data-shipping-input-address]');
            inputAddress.address = editedAddress;
            jest.spyOn(inputAddress, 'reportValidity').mockReturnValue(true);

            await element.checkoutSave();
            expect(updateShippingAddress).toHaveBeenCalledTimes(1);
            expect(createContactPointAddress).toHaveBeenCalledTimes(1);
        });

        it('should set shipping address and update contact-info when new address added as guest user', async () => {
            await checkoutSaveShippingAddressAndContactInfo(element);
            await element.checkoutSave();

            const contactInfo = {
                firstName: 'Philip',
                lastName: 'Sherman',
                email: 'test@gmail.com',
                phoneNumber: '6178876666',
            };
            expect(updateContactInformation).toHaveBeenCalledTimes(1);
            expect(updateContactInformation).toHaveBeenCalledWith(contactInfo);
            expect(updateShippingAddress).toHaveBeenCalledTimes(1);
        });

        it('should update contact-info if the previous contact-info update is failed', async () => {
            mockedUpdateContactInformation.mockImplementation(() => {
                // see https://developer.mozilla.org/en-US/docs/Web/API/Response
                return Promise.reject(error);
            });

            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: false },
            });

            (<typeof CheckoutGuestEmailAdapter & typeof TestWireAdapter>CheckoutGuestEmailAdapter).emit({
                data: 'test@gmail.com',
            });

            await Promise.resolve();
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            inputAddress.address = { ...mockAddresses[0] };

            inputAddress.contactInfo = {
                firstName: 'Philip',
                lastName: 'Sherman',
                email: '',
                phoneNumber: '6178876666',
            };

            jest.spyOn(inputAddress, 'reportValidity').mockReturnValue(true);

            await expect(element.checkoutSave()).rejects.toEqual(error);
            expect(mockedUpdateContactInformation).toHaveBeenCalledTimes(1);

            mockedUpdateContactInformation.mockReset();
            await element.checkoutSave();
            expect(mockedUpdateContactInformation).toHaveBeenCalledTimes(1);
        });

        it('should set email address as empty string when there is no data from store', async () => {
            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: false },
            });

            (<typeof CheckoutGuestEmailAdapter & typeof TestWireAdapter>CheckoutGuestEmailAdapter).emit({});

            await Promise.resolve();
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            inputAddress.address = { ...mockAddresses[0] };

            inputAddress.contactInfo = {
                firstName: 'P',
                lastName: 'Sherman',
                email: '',
                phoneNumber: '6178876666',
            };
            Promise.resolve();

            jest.spyOn(inputAddress, 'reportValidity').mockReturnValue(true);

            const contactInfo = {
                firstName: 'P',
                lastName: 'Sherman',
                email: '',
                phoneNumber: '6178876666',
            };

            await element.checkoutSave();
            expect(updateContactInformation).toHaveBeenCalledWith(contactInfo);
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

        it('should display the new input address form when address list is empty', async () => {
            await Promise.resolve();
            const addressList = element.querySelector('[data-shipping-radio-group]');
            const newAddressButton = element.querySelector('[data-add-new-address]');
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            expect(element.showNewAddressButton).toBe(false);
            expect(addressList).toBeFalsy();
            expect(newAddressButton).toBeFalsy();
            expect(inputAddress).toBeTruthy();
            expect(notifyAndPollCheckout).toHaveBeenCalledTimes(0);
        });

        it('should stay on the new input address form when address list grows', async () => {
            await Promise.resolve();
            (<typeof CheckoutAddressAdapter & typeof TestWireAdapter>CheckoutAddressAdapter).emit({
                data: {
                    items: [
                        {
                            addressId: 'address1',
                            firstName: 'P',
                            lastName: 'Sherman',
                            city: 'Sydney',
                            street: '42 Wallaby Way',
                            country: 'US',
                            isDefault: true,
                        },
                    ],
                },
            });
            const addressList = element.querySelector('[data-shipping-radio-group]');
            const newAddressButton = element.querySelector('[data-add-new-address]');
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            expect(element.showNewAddressButton).toBe(false);
            expect(addressList).toBeFalsy();
            expect(newAddressButton).toBeFalsy();
            expect(inputAddress).toBeTruthy();
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

        it('should make the address in the new address input form the default, when address list is empty', async () => {
            await Promise.resolve();
            const addressList = element.querySelector('[data-shipping-radio-group]');
            const inputAddress = element.querySelector('[data-shipping-input-address]');
            const defaultAddressCheckbox = inputAddress.querySelector('[data-default-address-checkbox]');
            expect(addressList).toBeFalsy();
            expect(element.address.isDefault).toBe(true);
            expect(defaultAddressCheckbox.checked).toBeTruthy();
        });

        it('should not show error (UI validation instead) but not proceed when no address is entered', async () => {
            mockedUpdateShippingAddress.mockImplementation(() => {
                return Promise.resolve({} as CheckoutInformation);
            });
            await Promise.resolve();
            expect.assertions(6);
            expect(element.isError).toBeFalsy();
            await expect(element.checkoutSave()).rejects.toThrow('delivery address required');
            expect(createContactPointAddress).toHaveBeenCalledTimes(0);
            expect(updateContactInformation).toHaveBeenCalledTimes(0);
            expect(updateShippingAddress).toHaveBeenCalledTimes(0);
            expect(element.isError).toBeFalsy();
        });
    });

    describe('Readonly mode', () => {
        let element: HTMLElement & Shipping;
        const mockAddresses = [
            {
                addressId: 'address1',
                firstName: 'P',
                lastName: 'Sherman',
                city: 'Sydney',
                street: '42 Wallaby Way',
                country: 'US',
                isDefault: true,
            },
        ];

        beforeEach(() => {
            element = createElement('commerce_unified_checkout-shipping', {
                is: Shipping,
            });

            applyRequiredLabels(element);
            element.builderMode = false;
            element.addresses = [];

            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: true },
            });

            (<typeof CheckoutAddressAdapter & typeof TestWireAdapter>CheckoutAddressAdapter).emit({
                data: {
                    items: mockAddresses,
                },
            });

            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                },
            });
        });

        afterEach(() => {
            document.body.removeChild(element);
            jest.clearAllMocks();
        });

        it('should display the readonly template under readonly conditions', async () => {
            element.readOnly = true;
            document.body.appendChild(element);
            await Promise.resolve();
            const templateReadonly = element.querySelector('[data-shipping-readonly]');
            expect(templateReadonly).toBeTruthy();
        });

        it('should be disabled by default when readonly', async () => {
            element.readOnly = true;
            document.body.appendChild(element);
            await Promise.resolve();
            const formattedAddress = element.querySelector('lightning-formatted-address');
            expect(formattedAddress.disabled).toBeTruthy();
        });
    });

    describe('summary mode', () => {
        let element: HTMLElement & Shipping;
        const mockAddresses = [
            {
                addressId: 'address1',
                firstName: 'P',
                lastName: 'Sherman',
                city: 'Sydney',
                street: '42 Wallaby Way',
                country: 'US',
                isDefault: true,
            },
            {
                addressId: 'address2',
                firstName: 'First',
                lastName: 'Last',
                city: 'Some city',
                street: 'Some street',
                country: 'JP',
                isDefault: false,
            },
        ];

        beforeEach(() => {
            element = createElement('commerce_unified_checkout-shipping', {
                is: Shipping,
            });

            applyRequiredLabels(element);
            element.builderMode = false;
            element.addresses = [];

            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: true },
            });

            (<typeof CheckoutAddressAdapter & typeof TestWireAdapter>CheckoutAddressAdapter).emit({
                data: {
                    items: mockAddresses,
                },
            });
        });

        afterEach(() => {
            document.body.removeChild(element);
            jest.clearAllMocks();
        });

        it('should be summary mode by default', async () => {
            document.body.appendChild(element);
            element.summaryModeEnabled = true;
            await Promise.resolve();

            let dispatched = false;
            element.addEventListener('showsummarymode', () => {
                dispatched = true;
            });
            //address provided
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                    deliveryGroups: {
                        items: [
                            {
                                deliveryAddress: mockAddresses[0],
                            },
                        ],
                    },
                },
            });
            expect(dispatched).toBe(true);
        });

        it('should not be summary view under non summary mode conditions', async () => {
            element.summaryModeEnabled = false;
            document.body.appendChild(element);
            await Promise.resolve();

            let dispatched = false;
            element.addEventListener('hidesummarymode', () => {
                dispatched = true;
            });
            //address provided
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                    deliveryGroups: {
                        items: [
                            {
                                deliveryAddress: mockAddresses[0],
                            },
                        ],
                    },
                },
            });
            await Promise.resolve();
            expect(dispatched).toBe(true);
        });

        it('should dispatch summary mode when there is an address in the checkout session', async () => {
            element.summaryModeEnabled = true;
            document.body.appendChild(element);
            await Promise.resolve();
            let dispatched = false;
            element.addEventListener('showsummarymode', () => {
                dispatched = true;
            });

            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                    deliveryGroups: {
                        items: [
                            {
                                deliveryAddress: mockAddresses[0],
                            },
                        ],
                    },
                },
            });
            expect(dispatched).toBe(true);
        });

        it('should hide summary mode when there is no address', async () => {
            document.body.appendChild(element);
            await Promise.resolve();
            let dispatched = false;
            element.addEventListener('hidesummarymode', () => {
                dispatched = true;
            });
            //no address provided
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                },
            });

            expect(dispatched).toBe(true);
        });

        it('should show correct display name in summary mode for countries where first name comes before last name', async () => {
            document.body.appendChild(element);
            element.summaryModeEnabled = true;
            element.checkoutMode = CheckoutMode.SUMMARY;
            await Promise.resolve();
            element.addEventListener('showsummarymode', () => {
                element.checkoutMode = CheckoutMode.SUMMARY;
            });
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                    deliveryGroups: {
                        items: [
                            {
                                deliveryAddress: mockAddresses[0],
                            },
                        ],
                    },
                },
            });
            await Promise.resolve();
            expect((<HTMLElement>element.querySelector('.slds-m-bottom_medium div')).textContent).toBe('P Sherman');
        });

        it('should show correct display name in summary mode for countries where last name comes before first name', async () => {
            document.body.appendChild(element);
            element.summaryModeEnabled = true;
            element.checkoutMode = CheckoutMode.SUMMARY;
            await Promise.resolve();
            element.addEventListener('showsummarymode', () => {
                element.checkoutMode = CheckoutMode.SUMMARY;
            });
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                    deliveryGroups: {
                        items: [
                            {
                                deliveryAddress: mockAddresses[1],
                            },
                        ],
                    },
                },
            });
            await Promise.resolve();
            expect((<HTMLElement>element.querySelector('.slds-m-bottom_medium div')).textContent).toBe('Last First');
        });
    });

    describe('Stencil mode', () => {
        let element: HTMLElement & Shipping;

        beforeEach(() => {
            element = createElement('commerce_unified_checkout-shipping', {
                is: Shipping,
            });

            applyRequiredLabels(element);
            element.addresses = [];

            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: true },
            });
        });

        afterEach(() => {
            document.body.removeChild(element);
            jest.clearAllMocks();
        });

        it('should display the loading stencil template while component is loading', async () => {
            element.builderMode = false;
            document.body.appendChild(element);
            await Promise.resolve();
            const templateStencil = element.querySelector('[data-shipping-stencil]');
            expect(templateStencil).toBeTruthy();
        });

        it('should display the edit template when XHR is complete', async () => {
            element.builderMode = false;
            document.body.appendChild(element);
            await Promise.resolve();
            (<typeof CheckoutAddressAdapter & typeof TestWireAdapter>CheckoutAddressAdapter).emit({
                data: {
                    items: [],
                },
            });
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                },
            });
            await Promise.resolve();
            const templateEdit = element.querySelector('[data-shipping-edit]');
            expect(templateEdit).toBeTruthy();
        });

        it('does not display the loading stencil template in builder mode', async () => {
            element.builderMode = true;
            document.body.appendChild(element);
            await Promise.resolve();
            const templateStencil = element.querySelector('[data-shipping-stencil]');
            expect(templateStencil).toBeFalsy();
        });

        it('number of tiles should be 1 for summaryModeEnabled true', async () => {
            element.builderMode = false;
            element.summaryModeEnabled = true;
            document.body.appendChild(element);
            await Promise.resolve();
            const templateStencil = element.querySelector('[data-shipping-stencil]');
            expect(templateStencil.itemCount).toBe(1);
        });

        it('number of tiles should be 6 for summaryModeEnabled false', async () => {
            element.builderMode = false;
            element.summaryModeEnabled = false;
            document.body.appendChild(element);
            await Promise.resolve();
            const templateStencil = element.querySelector('[data-shipping-stencil]');
            expect(templateStencil.itemCount).toBe(6);
        });
    });

    describe('checkoutmode', () => {
        let element: HTMLElement & Shipping;

        beforeEach(() => {
            element = createElement('commerce_unified_checkout-shipping', {
                is: Shipping,
            });

            applyRequiredLabels(element);
            element.builderMode = false;
            element.addresses = [];

            (<typeof SessionContextAdapter & typeof TestWireAdapter>SessionContextAdapter).emit({
                data: { isLoggedIn: true },
            });
        });

        it('should set all checkout modes correctly', () => {
            [
                CheckoutMode.FUTURE,
                CheckoutMode.EDIT,
                CheckoutMode.SUMMARY,
                CheckoutMode.DISABLED,
                CheckoutMode.STENCIL,
            ].forEach((mode) => {
                element.checkoutMode = mode;
                expect(element.checkoutMode).toEqual(mode);
            });
        });
        it('should set readonly when checkout mode is readonly to true', () => {
            element.checkoutMode = CheckoutMode.SUMMARY;
            expect(element.checkoutMode).toEqual(CheckoutMode.SUMMARY);
            expect(element.readOnly).toBe(true);
        });
        it('should set readonly when checkout mode isnt readonly to false', () => {
            element.checkoutMode = CheckoutMode.EDIT;
            expect(element.checkoutMode).toEqual(CheckoutMode.EDIT);
            expect(element.readOnly).toBe(false);
        });
    });
    describe('Shipping Design Substitute component', () => {
        it('should test design substitute', async () => {
            const designElement: HTMLElement & ShippingDesignSubstitute = createElement(
                'commerce_unified_checkout-shipping-design-substitute',
                {
                    is: ShippingDesignSubstitute,
                }
            );

            designElement.phoneNumberLabel = 'Phone Number';
            document.body.appendChild(designElement);
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                loading: true,
            });
            await Promise.resolve();
            const shippingComponent = designElement.querySelector('commerce_unified_checkout-shipping');
            expect(shippingComponent.address).not.toBeNull();
            designElement.shippingAddressLimit = 2;
            expect(designElement.shippingAddressLimit).toBe(2);
            expect(designElement.addresses).toHaveLength(2);
            designElement.shippingAddressLimit = 0;
            expect(designElement.shippingAddressLimit).toBe(0);
            expect(designElement.addresses).toHaveLength(1);
            document.body.removeChild(designElement);
        });
    });
});
