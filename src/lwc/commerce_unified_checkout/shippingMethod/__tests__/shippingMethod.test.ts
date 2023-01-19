import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import {
    CheckoutInformationAdapter,
    notifyAndPollCheckout,
    waitForCheckout,
    updateDeliveryMethod,
} from 'commerce/checkoutApi';
// @ts-ignore
import ShippingMethod from 'commerce_unified_checkout/shippingMethod';
import { CheckoutMode } from '../../checkoutMode/checkoutMode';
import { CheckoutStatus } from 'commerce_unified_checkout/checkoutApiInternal';
// @ts-ignore
import ShippingMethodDesignSubstitute from 'commerce_unified_checkout/shippingMethodDesignSubstitute';
import { generateCheckoutInformationErrorLabel, noErrorLabels } from 'commerce_unified_checkout/errorHandler';
import type { CheckoutInformation, ErrorLabels } from 'types/unified_checkout';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('commerce/checkoutApi', () => {
    return Object.assign({}, jest.requireActual('commerce/checkoutApi'), {
        notifyAndPollCheckout: jest.fn().mockImplementation(() => {
            return Promise.resolve();
        }),
        waitForCheckout: jest.fn(),
        updateDeliveryMethod: jest.fn(),
        CheckoutInformationAdapter: mockCreateTestWireAdapter(),
    });
});

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

const mockedUpdateDeliveryMethod = updateDeliveryMethod as jest.Mock<Promise<CheckoutInformation>>;
const mockedWaitForCheckout = waitForCheckout as jest.Mock<Promise<CheckoutInformation>>;
const mockedGenerateCheckoutInformationErrorLabel = generateCheckoutInformationErrorLabel as jest.Mock<ErrorLabels>;

const defaultAddress = {
    addressId: 'address1',
    isDefault: true,
    name: 'Jane Doe',
    street: '123 Broadway',
    city: 'New York',
    postalCode: '11000',
    region: 'NY',
    country: 'US',
};

const availableOptions = [
    {
        id: '2Dmxx0000004CFVCA2',
        name: 'UPS Ground (3-5 business days)',
        shippingFee: '3.14',
        currencyIsoCode: 'USD',
        carrier: 'UPS',
        classOfService: 'Same day UPS Ground',
    },
    {
        id: '2Dmxx0000005DEWDB3',
        name: 'UPS Next Day (2 business days)',
        shippingFee: '2.03',
        currencyIsoCode: 'USD',
        carrier: 'UPS',
        classOfService: 'Next day UPS Ground',
    },
];

const availableOptions2 = [
    {
        id: '2Dmxx0000004CFVCA4',
        name: 'UPS Ground (3-5 business days)',
        shippingFee: '3.16',
        currencyIsoCode: 'USD',
        carrier: 'UPS',
        classOfService: 'Same day UPS Ground',
    },
    {
        id: '2Dmxx0000005DEWDB5',
        name: 'UPS Next Day (2 business days)',
        shippingFee: '2.15',
        currencyIsoCode: 'USD',
        carrier: 'UPS',
        classOfService: 'Next day UPS Ground',
    },
];

const availableOptions3 = [
    {
        id: '2Dmxx0000004CFVCA6',
        name: 'UPS Ground (3-5 business days)',
        shippingFee: '3.16',
        currencyIsoCode: 'USD',
        carrier: 'UPS',
        classOfService: 'Same day UPS Ground',
    },
];

const checkoutInformationAdapterData = {
    data: {
        checkoutStatus: CheckoutStatus.Ready,
        deliveryGroups: {
            items: [
                {
                    deliveryAddress: defaultAddress,
                    availableDeliveryMethods: availableOptions,
                },
            ],
        },
    },
};

describe('Shipping Method component', () => {
    let element: HTMLElement & ShippingMethod;

    beforeEach(() => {
        mockedUpdateDeliveryMethod.mockImplementation(() => {
            return Promise.resolve({
                checkoutStatus: CheckoutStatus.Ready,
                deliveryGroups: {
                    items: [
                        {
                            deliveryAddress: defaultAddress,
                            availableDeliveryMethods: availableOptions,
                            selectedDeliveryMethod: availableOptions[0],
                        },
                    ],
                },
            } as CheckoutInformation);
        });
        mockedWaitForCheckout.mockImplementation(() => Promise.resolve({} as CheckoutInformation));
        element = createElement('commerce_unified_checkout-shipping-method', {
            is: ShippingMethod,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'name',
            defaultValue: 'delivery-method',
            changeValue: 'custom-name',
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property]).not.toBe(propertyTest.changeValue);

                // Change the value.
                element[propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });

    const assertErrorShowed = (): void => {
        const notificationContent = element.querySelector('b2c_lite_commerce-scoped-notification');
        expect(notificationContent.textContent).toContain(generatedErrorLabel.header);
        expect(notificationContent.textContent).toContain(generatedErrorLabel.body);
    };

    const assertIntegrationErrorShowed = (): void => {
        const notificationContent = element.querySelector('b2c_lite_commerce-scoped-notification');
        expect(notificationContent.textContent).toContain(generatedIntegrationErrorLabel.header);
        expect(notificationContent.textContent).toContain(generatedIntegrationErrorLabel.body);
    };

    describe('content', () => {
        beforeEach(async () => {
            mockedGenerateCheckoutInformationErrorLabel.mockReturnValue(noErrorLabels);
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                loading: true,
            });
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    ...checkoutInformationAdapterData.data,
                    checkoutStatus: CheckoutStatus.AsyncInProgress,
                },
            });
            await Promise.resolve();
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit(
                checkoutInformationAdapterData
            );
            await Promise.resolve();
        });

        it('should not show error if checkout API loads without error', () => {
            expect(element.isError).toBeFalsy();

            const notificationContent = element.querySelector('b2c_lite_commerce-scoped-notification');
            expect(notificationContent.textContent).not.toContain(generatedErrorLabel.header);
        });

        it('displays an entry for each delivery option', () => {
            //  Selector to get all the delivery options.
            const deliveryMethods = element.querySelectorAll('.slds-radio_faux');

            //  Making sure all the delivery options are dispalyed in radio buttons
            expect(element.availableOptions).toHaveLength(2);
            expect(Array.from(deliveryMethods)).toHaveLength(2);
        });

        it('should render the default option', () => {
            // note: tests if first label matches hard-coded api mock
            const label = element.querySelector('[data-id=label-2Dmxx0000004CFVCA2]');

            expect(label.textContent).toBe('UPS Ground (3-5 business days)');
        });

        it('should select the first API option if any and none selected', () => {
            expect(element.value).toBe('2Dmxx0000004CFVCA2');
        });

        it('should not proceed when no selection is made', async () => {
            expect.assertions(3);
            element.value = ''; // clear value
            expect(element.isError).toBeFalsy();
            await expect(element.checkoutSave()).rejects.toThrow('delivery method required');
            expect(updateDeliveryMethod).toHaveBeenCalledTimes(0);
        });

        it('should show error and not proceed when update API throws an error', async () => {
            const error = new Error('test error');
            mockedUpdateDeliveryMethod.mockImplementation(() => {
                // see https://developer.mozilla.org/en-US/docs/Web/API/Response
                return Promise.reject(error);
            });
            expect.assertions(8);
            expect(element.isError).toBeFalsy();
            await expect(element.checkoutSave()).rejects.toEqual(error);
            expect(updateDeliveryMethod).toHaveBeenCalledTimes(1);
            expect(notifyAndPollCheckout).toHaveBeenCalledTimes(0);
            expect(waitForCheckout).toHaveBeenCalledTimes(0);
            expect(element.isError).toBeTruthy();
            assertErrorShowed();
        });

        it('should show error and not proceed when update API returns a checkout integration error', async () => {
            mockedWaitForCheckout.mockImplementation(() => {
                return Promise.resolve({
                    checkoutStatus: CheckoutStatus.Ready,
                    deliveryGroups: {
                        items: [
                            {
                                deliveryAddress: defaultAddress,
                                availableDeliveryMethods: availableOptions,
                                selectedDeliveryMethod: availableOptions[0],
                            },
                        ],
                    },
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
            expect.assertions(8);
            expect(element.isError).toBeFalsy();
            await expect(element.checkoutSave()).rejects.toEqual(new Error('INTEGRATION-ERROR-BODY'));
            expect(updateDeliveryMethod).toHaveBeenCalledTimes(1);
            expect(notifyAndPollCheckout).toHaveBeenCalledTimes(1);
            expect(waitForCheckout).toHaveBeenCalledTimes(1);
            expect(element.isError).toBeTruthy();
            assertIntegrationErrorShowed();
        });

        it('should proceed and not show an error when update API succeeds', async () => {
            expect.assertions(6);
            expect(element.isError).toBeFalsy();
            await expect(element.checkoutSave()).resolves.toBeUndefined();
            expect(updateDeliveryMethod).toHaveBeenCalledTimes(1);
            expect(notifyAndPollCheckout).toHaveBeenCalledTimes(1);
            expect(waitForCheckout).toHaveBeenCalledTimes(1);
            expect(element.isError).toBeFalsy();
        });
    });

    it('should not crash when API returns no items', async () => {
        // here we mark second option "selected: true" to differentiate from none selected case
        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {
                checkoutStatus: CheckoutStatus.Ready,
                deliveryGroups: {},
            },
        });
        await Promise.resolve();
        expect(element.value).toBe('');
    });

    it('should select the "selected" API option if any', async () => {
        // here we mark second option "selected: true" to differentiate from none selected case
        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {
                checkoutStatus: CheckoutStatus.Ready,
                deliveryGroups: {
                    items: [
                        {
                            deliveryAddress: defaultAddress,
                            availableDeliveryMethods: availableOptions,
                            selectedDeliveryMethod: availableOptions[1],
                        },
                    ],
                },
            },
        });
        await Promise.resolve();
        expect(element.value).toBe('2Dmxx0000005DEWDB3');
    });

    it('should not change the selection to API selection if already selected', async () => {
        element.value = '2Dmxx0000004CFVCA2';

        // here we mark second option "selected: true" to differentiate from none selected case
        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {
                checkoutStatus: CheckoutStatus.Ready,
                deliveryGroups: {
                    items: [
                        {
                            deliveryAddress: defaultAddress,
                            availableDeliveryMethods: availableOptions,
                            selectedDeliveryMethod: availableOptions[1],
                        },
                    ],
                },
            },
        });
        await Promise.resolve();
        expect(element.value).toBe('2Dmxx0000004CFVCA2');
    });

    it('should not reset the availableOptions when the avaliable delivery methods are the same from api response', async () => {
        element.availableOptions = availableOptions;
        // here we mark second option "selected: true" to differentiate from none selected case
        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {
                checkoutStatus: CheckoutStatus.Ready,
                deliveryGroups: {
                    items: [
                        {
                            deliveryAddress: defaultAddress,
                            availableDeliveryMethods: availableOptions,
                        },
                    ],
                },
            },
        });
        await Promise.resolve();
        expect(element.value).toBe('2Dmxx0000004CFVCA2');
    });

    it('should reset the availableOptions when the avaliable delivery methods are different from api response', async () => {
        element.availableOptions = availableOptions;
        element.value = '2Dmxx0000004CFVCA2';
        // here we mark second option "selected: true" to differentiate from none selected case
        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            data: {
                checkoutStatus: CheckoutStatus.Ready,
                deliveryGroups: {
                    items: [
                        {
                            deliveryAddress: defaultAddress,
                            availableDeliveryMethods: availableOptions2,
                        },
                    ],
                },
            },
        });
        await Promise.resolve();
        expect(element.value).toBe('2Dmxx0000004CFVCA4');
    });

    describe('Readonly mode', () => {
        beforeEach(() => {
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                    deliveryGroups: {
                        items: [
                            {
                                deliveryAddress: defaultAddress,
                                availableDeliveryMethods: availableOptions,
                                selectedDeliveryMethod: availableOptions[1],
                            },
                        ],
                    },
                },
            });
        });

        it('should display the default template under default conditions', async () => {
            await Promise.resolve();
            const templateEdit = element.querySelector('[data-shipping-method-edit]');
            expect(templateEdit).toBeTruthy();
        });

        it('should display the readonly template under readonly conditions', async () => {
            element.readOnly = true;
            await Promise.resolve();
            const templateReadonly = element.querySelector('[data-shipping-method-readonly]');
            expect(templateReadonly).toBeTruthy();
        });
    });

    describe('Stencil mode', () => {
        it('should display stencil when checkout mode is STENCIL', async () => {
            element.checkoutMode = CheckoutMode.STENCIL;
            await Promise.resolve();
            const templateStencil = element.querySelector('[data-shipping-method-stencil]');
            expect(templateStencil).toBeTruthy();
        });

        it('should display stencil when loading and no options available', async () => {
            element.checkoutMode = CheckoutMode.EDIT;
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.AsyncInProgress,
                    deliveryGroups: {
                        items: [
                            {
                                deliveryAddress: defaultAddress,
                                availableDeliveryMethods: [],
                            },
                        ],
                    },
                },
            });
            await Promise.resolve();
            element.checkoutMode = CheckoutMode.EDIT;
            const templateStencil = element.querySelector('[data-shipping-method-stencil]');
            expect(templateStencil).toBeTruthy();

            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit(
                checkoutInformationAdapterData
            );
            await Promise.resolve();
            const templateStencil2 = element.querySelector('[data-shipping-method-stencil]');
            expect(templateStencil2).toBeFalsy();
            expect(element.checkoutMode).toEqual(CheckoutMode.EDIT);
        });

        it('should not display stencil when loading and options are available', async () => {
            element.checkoutMode = CheckoutMode.EDIT;
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                ...checkoutInformationAdapterData,
            });
            await Promise.resolve();
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    ...checkoutInformationAdapterData.data,
                    checkoutStatus: CheckoutStatus.AsyncInProgress,
                },
            });
            await Promise.resolve();
            element.checkoutMode = CheckoutMode.EDIT;
            const templateStencil = element.querySelector('[data-shipping-method-stencil]');
            expect(templateStencil).toBeFalsy();
        });

        it('should not display stencil when there is no delivery method is avaliable and there is an address', async () => {
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                    deliveryGroups: {
                        items: [
                            {
                                deliveryAddress: defaultAddress,
                                availableDeliveryMethods: [],
                            },
                        ],
                    },
                },
            });
            await Promise.resolve();
            const templateStencil = element.querySelector('[data-shipping-method-stencil]');
            expect(templateStencil).toBeFalsy();
        });
    });

    describe('event', () => {
        beforeEach(async () => {
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    ...checkoutInformationAdapterData.data,
                    checkoutStatus: CheckoutStatus.AsyncInProgress,
                },
            });
            await Promise.resolve();
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit(
                checkoutInformationAdapterData
            );
            await Promise.resolve();
        });

        it('should dispatch "dataready" event when delivery method changes', async () => {
            let dispatched = false;
            element.checkoutMode = CheckoutMode.EDIT;
            element.addEventListener('dataready', () => {
                dispatched = true;
            });
            await Promise.resolve();
            const deliveryMethods = element.querySelectorAll('.slds-radio');
            const radioInput = deliveryMethods[0].querySelector('input[type="radio"]');
            radioInput.checkValidity = (): boolean => true;
            radioInput.dispatchEvent(new CustomEvent('change'));
            await Promise.resolve();
            expect(dispatched).toBe(true);
        });

        it('should dispatch "hideeditbutton" event when there is only 1 delivery method', async () => {
            let dispatched = false;
            element.checkoutMode = CheckoutMode.EDIT;
            element.addEventListener('hideeditbutton', () => {
                dispatched = true;
            });
            await Promise.resolve();
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                    deliveryGroups: {
                        items: [
                            {
                                deliveryAddress: defaultAddress,
                                availableDeliveryMethods: availableOptions3,
                            },
                        ],
                    },
                },
            });
            await Promise.resolve();
            expect(dispatched).toBe(true);
        });

        it('should dispatch "showeditbutton" event when there are multiple delivery methods', async () => {
            let dispatched = false;
            element.checkoutMode = CheckoutMode.EDIT;
            element.addEventListener('showeditbutton', () => {
                dispatched = true;
            });
            await Promise.resolve();
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    checkoutStatus: CheckoutStatus.Ready,
                    deliveryGroups: {
                        items: [
                            {
                                deliveryAddress: defaultAddress,
                                availableDeliveryMethods: availableOptions2,
                            },
                        ],
                    },
                },
            });
            await Promise.resolve();
            expect(dispatched).toBe(true);
        });

        it('radio input is focused', async () => {
            const firstRadio = element.querySelector('input[type="radio"]');
            let dispatched = false;
            firstRadio.addEventListener('focus', () => {
                dispatched = true;
            });
            jest.spyOn(firstRadio, 'focus');
            jest.spyOn(element, 'focus');
            element.focus();
            await Promise.resolve();
            expect(dispatched).toBe(true);
            expect(element.focus).toHaveBeenCalled();
        });

        it('radio input is checked', async () => {
            const firstRadio = element.querySelector('input[type="radio"]');
            firstRadio.click();
            await Promise.resolve();
            element.checkoutMode = CheckoutMode.SUMMARY;
            expect(element.value).toEqual(firstRadio.value);
        });

        it('should focus input when shouldSetFocus is set', async () => {
            element.checkoutMode = CheckoutMode.EDIT;
            element.shouldSetFocus = true;
            const firstRadio = element.querySelector('input');
            jest.spyOn(firstRadio, 'focus');
            (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
                data: {
                    ...checkoutInformationAdapterData.data,
                    checkoutStatus: CheckoutStatus.AsyncInProgress,
                },
            });
            await Promise.resolve();
            expect(firstRadio.focus).toHaveBeenCalled();
        });
    });

    describe('checkoutmode', () => {
        it('should set all checkout modes correctly', () => {
            [
                CheckoutMode.DISABLED,
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
});

describe('Shipping Method Design Substitute component', () => {
    it('should test design substitute', async () => {
        const designElement: HTMLElement & ShippingMethodDesignSubstitute = createElement(
            'commerce_unified_checkout-shipping-method-design-substitute',
            {
                is: ShippingMethodDesignSubstitute,
            }
        );

        document.body.appendChild(designElement);
        (<typeof CheckoutInformationAdapter & typeof TestWireAdapter>CheckoutInformationAdapter).emit({
            loading: true,
        });
        await Promise.resolve();
        const shippingMethodComponent = designElement.querySelector('commerce_unified_checkout-shipping-method');
        expect(shippingMethodComponent.availableOptions).not.toBeNull();
        document.body.removeChild(designElement);
    });
});
