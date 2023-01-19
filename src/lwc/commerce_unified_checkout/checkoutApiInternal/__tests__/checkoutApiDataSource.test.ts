import { currentRelease } from 'commerce/config';
import { fetchService } from 'experience/data';
import { getAllMarkersDiff } from 'commerce_unified_checkout/ekg';
import {
    getContactPointAddresses,
    updateContactPointAddress,
    stringifyParams,
    authorizePayment,
    clientRequest,
    createContactPointAddress,
    startCheckout,
    getCheckoutInformation,
    deleteCheckoutInformation,
    updateShippingAddress,
    updateDeliveryMethod,
    updateContactInformation,
    placeOrder,
    prefixUrl,
} from '../checkoutApiDataSource';
// eslint-disable-next-line jest/no-mocks-import
import { fetchServiceWrapperRequestInit, mockFetchResponseAndData } from '../__mocks__/fetchServiceWrapper.mock';
import type {
    Address,
    AddressesRequest,
    CheckoutPaymentRequestBody,
    ContactPointAddressData,
    DeliveryGroup,
    ContactInfo,
    PaymentAuthorizationResponse,
    PaymentClientRequestResponse,
} from 'types/unified_checkout';

// These mocks cover aspects of interaction with the server that we don't want to be testing
jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });
jest.mock('commerce/context');
jest.mock('commerce/contextApi');
jest.mock('experience/data', () => {
    const originalModule = jest.requireActual('experience/data');
    return Object.assign({ __esModule: true }, originalModule, { fetchService: jest.fn().mockResolvedValue({}) });
});
jest.mock('commerce/contextApi', () => {
    return {
        getAppContext: jest.fn().mockResolvedValue({
            webstoreId: 'testWebstoreId',
        }),
    };
});

let mockAccountId: string | null = null;
jest.mock('commerce/effectiveAccountApi', () => ({
    effectiveAccount: Object.defineProperty({}, 'accountId', {
        get: () => mockAccountId,
    }),
}));

const { apiVersion: API_VERSION } = currentRelease;

describe('commerce/checkoutApiDataSource tests', () => {
    afterEach(() => {
        mockAccountId = null;
    });

    it('stringifyParams convert params to strings', () => {
        expect(
            stringifyParams({
                addressType: 'Shipping',
                defaultOnly: true,
                pageSize: 5,
            } as AddressesRequest)
        ).toEqual({
            addressType: 'Shipping',
            defaultOnly: 'true',
            pageSize: '5',
        });
    });

    it('startCheckout calls the API correctly', async () => {
        const expectedURL = `/services/data/${API_VERSION}/commerce/webstores/0ZER00000004ZWc/checkouts`;

        const cartId = 'cartId123';
        expect(await startCheckout(cartId)).toMatchObject({});
        expect(fetchService).toHaveBeenCalledWith(expectedURL, {
            method: 'POST',
            body: JSON.stringify({
                cartId: cartId,
                deliveryAddress: 'default',
            }),
            ...fetchServiceWrapperRequestInit,
        });
    });

    it('getCheckoutInformation calls the API correctly', async () => {
        const checkoutId = '2z9xx00000000b7AAA';
        const expectedURL = `/services/data/${API_VERSION}/commerce/webstores/0ZER00000004ZWc/checkouts/${checkoutId}`;

        expect(await getCheckoutInformation(checkoutId)).toMatchObject({});
        expect(fetchService).toHaveBeenCalledWith(expectedURL, {
            method: 'GET',
            ...fetchServiceWrapperRequestInit,
        });
    });

    it('deleteCheckoutInformation calls the API correctly', async () => {
        const checkoutId = '2z9xx00000000b7AAA';
        const expectedURL = `/services/data/${API_VERSION}/commerce/webstores/0ZER00000004ZWc/checkouts/${checkoutId}`;

        expect(await deleteCheckoutInformation(checkoutId)).toMatchObject({});
        expect(fetchService).toHaveBeenCalledWith(expectedURL, {
            method: 'DELETE',
            ...fetchServiceWrapperRequestInit,
        });
    });

    it('updateShippingAddress calls the API correctly', async () => {
        const checkoutId = '2z9xx00000000b7AAA';
        const expectedURL = `/services/data/${API_VERSION}/commerce/webstores/0ZER00000004ZWc/checkouts/${checkoutId}`;
        const inputParams: DeliveryGroup = {
            deliveryAddress: {
                city: 'Cityville',
                country: 'Countrystan',
                name: 'Namo',
                postalCode: '12344',
                region: 'CA',
                street: '122 Boulevard Street',
            },
        };

        expect(await updateShippingAddress(inputParams, checkoutId)).toMatchObject({});
        expect(fetchService).toHaveBeenCalledWith(expectedURL, {
            method: 'PATCH',
            body: JSON.stringify(inputParams),
            ...fetchServiceWrapperRequestInit,
        });
    });

    it('updateDeliveryMethod calls the API correctly', async () => {
        const checkoutId = '2z9xx00000000b7AAA';
        const expectedURL = `/services/data/${API_VERSION}/commerce/webstores/0ZER00000004ZWc/checkouts/${checkoutId}`;
        const deliveryMethodId = '2Dmxx0000004C92CAE';

        expect(await updateDeliveryMethod(deliveryMethodId, checkoutId)).toMatchObject({});
        expect(fetchService).toHaveBeenCalledWith(expectedURL, {
            method: 'PATCH',
            body: JSON.stringify({ deliveryMethodId }),
            ...fetchServiceWrapperRequestInit,
        });
    });

    it('updateContactInformation calls the API correctly', async () => {
        const checkoutId = '2z9xx00000000b7AAA';
        const expectedURL = `/services/data/${API_VERSION}/commerce/webstores/0ZER00000004ZWc/checkouts/${checkoutId}`;
        const inputParams: ContactInfo = {
            firstName: 'Philip',
            lastName: 'Sherman',
            email: 'test@gmail.com',
            phoneNumber: '6178876666',
        };

        expect(await updateContactInformation(inputParams, checkoutId)).toMatchObject({});
        expect(fetchService).toHaveBeenCalledWith(expectedURL, {
            method: 'PATCH',
            body: JSON.stringify({ contactInfo: inputParams }),
            ...fetchServiceWrapperRequestInit,
        });
    });

    it('placeOrder calls the API correctly', async () => {
        const checkoutId = '2z9xx00000000b7AAA';
        const expectedURL = `/services/data/${API_VERSION}/commerce/webstores/0ZER00000004ZWc/checkouts/${checkoutId}/orders`;

        expect(await placeOrder(checkoutId)).toMatchObject({});
        expect(fetchService).toHaveBeenCalledWith(expectedURL, {
            method: 'POST',
            ...fetchServiceWrapperRequestInit,
        });
    });

    it('gets the contact point address', async () => {
        expect(
            await getContactPointAddresses({ pageSize: 1, addressType: 'Shipping', defaultOnly: false })
        ).toMatchObject({});
    });

    it('updates the contact point address', async () => {
        const addressId = 'abc123';
        const address = {
            city: 'Cityville',
            country: 'Countrystan',
            isDefault: false,
            name: 'Namo',
            postalCode: '12344',
            region: 'CA',
            street: '122 Boulevard Street',
        };
        const expectedURL = `/services/data/${API_VERSION}/commerce/webstores/0ZER00000004ZWc/accounts/current/addresses/${addressId}`;

        expect(await updateContactPointAddress(addressId, address)).toMatchObject({});
        expect(fetchService).toHaveBeenCalledWith(expectedURL, {
            method: 'PATCH',
            body: JSON.stringify(address),
            ...fetchServiceWrapperRequestInit,
        });
    });

    it(`should create a url using effective account id`, () => {
        mockAccountId = '005000000000ABC';
        const url = 'checkouts/0ZExx0000000001GAA';
        const expectedUrl = `/services/data/${API_VERSION}/commerce/webstores/0ZER00000004ZWc/checkouts/0ZExx0000000001GAA?effectiveAccountId=005000000000ABC`;
        expect(prefixUrl(url)).toBe(expectedUrl);
    });

    it(`should create a url without effective account id when effectiveAccountSupport parameter is set to false`, () => {
        mockAccountId = '005000000000ABC';
        const url = 'checkouts/0ZExx0000000001GAA';
        const expectedUrl = `/services/data/${API_VERSION}/commerce/webstores/0ZER00000004ZWc/checkouts/0ZExx0000000001GAA`;
        expect(prefixUrl(url, false)).toBe(expectedUrl);
    });

    describe('createContactPointAddress', () => {
        it('should call the API correctly', async () => {
            const mockAddress: Address = {
                city: 'Boston',
                country: 'US',
                postalCode: '02128',
                region: 'MA',
                street: '9 Chaucer St.',
            };

            const contactAddressPointData: ContactPointAddressData = {
                count: 1,
                currentPageUrl: '/url',
                items: [],
                nextPageToken: '',
                nextPageUrl: '/urlnext',
                sortOrder: 'asc',
            };

            (<jest.Mock>fetchService).mockResolvedValue(contactAddressPointData);

            const createContactPointAddressResponse = await createContactPointAddress(mockAddress);
            expect(fetchService).toHaveBeenCalledWith(
                `/services/data/${API_VERSION}/commerce/webstores/0ZER00000004ZWc/accounts/current/addresses`,
                {
                    method: 'POST',
                    body: JSON.stringify(mockAddress),
                    ...fetchServiceWrapperRequestInit,
                }
            );
            return expect(createContactPointAddressResponse).toEqual(contactAddressPointData);
        });
    });

    describe('ekg', () => {
        it('getCheckoutInformation adds EKG mark t-checkout-2', async () => {
            (<jest.Mock>fetchService).mockResolvedValue(
                mockFetchResponseAndData(200, {
                    checkoutId: 'checkoutIdResult',
                })
            );

            const checkoutId = '2z9xx00000000b7AAA';
            const expectedURL = `/services/data/${API_VERSION}/commerce/webstores/0ZER00000004ZWc/checkouts/${checkoutId}`;

            const responseAndData = await getCheckoutInformation(checkoutId);
            expect(responseAndData).toMatchObject({
                response: {
                    status: 200,
                    ok: true,
                },
                data: {
                    checkoutId: 'checkoutIdResult',
                },
            });
            expect(fetchService).toHaveBeenCalledWith(expectedURL, {
                method: 'GET',
                ...fetchServiceWrapperRequestInit,
            });
            expect(getAllMarkersDiff()).toHaveProperty('t-checkout-2');
        });

        it('getContactPointAddresses adds EKG mark t-address-2', async () => {
            const responseAndData = await getContactPointAddresses({
                pageSize: 1,
                addressType: 'Shipping',
                defaultOnly: false,
            });
            expect(responseAndData).toMatchObject({});
            expect(getAllMarkersDiff()).toHaveProperty('t-address-2');
        });
    });

    describe('authorizePayment', () => {
        describe('Auth requestType', () => {
            let authorizeResponse: Promise<PaymentAuthorizationResponse>;
            const mockCheckoutSession = 'checkoutsession';
            const mockToken = 'mockpaymenttoken';
            const mockAddress: Address = {
                city: 'Boston',
                country: 'USA',
                postalCode: '02128',
                region: 'MA',
                street: '9 Chaucer St.',
            };

            describe('Successful authorization', () => {
                const expectedURL = `/services/data/${API_VERSION}/commerce/webstores/0ZER00000004ZWc/checkouts/${mockCheckoutSession}/payments`;
                const mockSuccesfulAuthorizationResponse: PaymentAuthorizationResponse = {
                    salesforceResultCode: 'Success',
                    errors: [],
                };

                beforeEach(() => {
                    (<jest.Mock>fetchService).mockResolvedValue(mockSuccesfulAuthorizationResponse);

                    authorizeResponse = authorizePayment(mockCheckoutSession, mockToken, 'Auth', mockAddress);
                });

                it('should call the fetchService with the correct arguments', () => {
                    const expectedRequestBody: CheckoutPaymentRequestBody = {
                        paymentToken: mockToken,
                        requestType: 'Auth',
                        billingAddress: mockAddress,
                    };

                    expect(fetchService).toHaveBeenCalledWith(expectedURL, {
                        method: 'POST',
                        body: JSON.stringify(expectedRequestBody),
                        ...fetchServiceWrapperRequestInit,
                    });
                });

                it('should return a Promise with an authorization response', async () => {
                    const expectedAuthResponse: PaymentAuthorizationResponse = {
                        salesforceResultCode: 'Success',
                        errors: [],
                    };
                    return expect(authorizeResponse).resolves.toEqual(expectedAuthResponse);
                });
            });

            describe('card declined response', () => {
                const expectedResponseBody: PaymentAuthorizationResponse = {
                    salesforceResultCode: 'Decline',
                    errors: [
                        {
                            detail: 'Your payment was not accepted.  Please try another form of payment',
                            title: 'Your payment was not accepted.  Please try another form of payment',
                            instance: '',
                            type: '/commerce/errors/payment-failure',
                        },
                    ],
                };

                beforeEach(() => {
                    (<jest.Mock>fetchService).mockRejectedValue(expectedResponseBody);
                });

                it('should return a rejected promise with associated errors a result code', () => {
                    return expect(
                        authorizePayment(mockCheckoutSession, mockToken, 'Auth', mockAddress)
                    ).rejects.toMatchObject(expectedResponseBody);
                });
            });
        });

        describe('PostAuth requestType', () => {
            let authorizeResponse: Promise<PaymentAuthorizationResponse>;
            const mockCheckoutSession = 'checkoutsession';
            const mockToken = 'mockpaymenttoken';
            const mockAddress: Address = {
                city: 'Boston',
                country: 'US',
                postalCode: '02128',
                region: 'MA',
                street: '9 Chaucer St.',
            };
            const expectedURL = `/services/data/${API_VERSION}/commerce/webstores/0ZER00000004ZWc/checkouts/${mockCheckoutSession}/payments`;
            const mockSuccesfulAuthorizationResponse: PaymentAuthorizationResponse = {
                salesforceResultCode: 'Success',
                errors: [],
            };

            beforeEach(() => {
                (<jest.Mock>fetchService).mockResolvedValue(mockSuccesfulAuthorizationResponse);

                authorizeResponse = authorizePayment(mockCheckoutSession, mockToken, 'PostAuth', mockAddress);
            });

            it('should call the fetchService with the correct arguments', () => {
                const expectedRequestBody: CheckoutPaymentRequestBody = {
                    paymentToken: mockToken,
                    requestType: 'PostAuth',
                    billingAddress: mockAddress,
                };

                expect(fetchService).toHaveBeenCalledWith(expectedURL, {
                    method: 'POST',
                    body: JSON.stringify(expectedRequestBody),
                    ...fetchServiceWrapperRequestInit,
                });
            });

            it('should return a Promise with an authorization response', async () => {
                const expectedAuthResponse: PaymentAuthorizationResponse = {
                    salesforceResultCode: 'Success',
                    errors: [],
                };
                return expect(authorizeResponse).resolves.toEqual(expectedAuthResponse);
            });
        });
    });

    describe('clientRequest', () => {
        let clientRequestResponse: Promise<PaymentClientRequestResponse>;
        const mockCheckoutSession = 'checkoutsession';
        const paymentsDataInput = {
            test: 'input',
        };

        const expectedURL = `/services/data/${API_VERSION}/commerce/webstores/0ZER00000004ZWc/checkouts/${mockCheckoutSession}/payments`;
        const mockSuccesfulClientRequestResponse: PaymentClientRequestResponse = {
            errors: [],
            paymentsData: {
                test: 'value',
            },
        };

        beforeEach(() => {
            (<jest.Mock>fetchService).mockResolvedValue(mockSuccesfulClientRequestResponse);
        });

        describe('calling without paymentsData', () => {
            beforeEach(() => {
                clientRequestResponse = clientRequest(mockCheckoutSession);
            });

            it('should call the fetchService with the correct arguments', () => {
                const expectedRequestBody: CheckoutPaymentRequestBody = {
                    requestType: 'ClientRequest',
                    paymentsData: JSON.stringify({}),
                };

                expect(fetchService).toHaveBeenCalledWith(expectedURL, {
                    method: 'POST',
                    body: JSON.stringify(expectedRequestBody),
                    ...fetchServiceWrapperRequestInit,
                });
            });

            it('should return a Promise with a client request response', async () => {
                return expect(clientRequestResponse).resolves.toEqual(mockSuccesfulClientRequestResponse);
            });
        });

        describe('calling with paymentsData', () => {
            beforeEach(() => {
                clientRequestResponse = clientRequest(mockCheckoutSession, paymentsDataInput);
            });

            it('should call the fetchService with the correct arguments', () => {
                const expectedRequestBody: CheckoutPaymentRequestBody = {
                    requestType: 'ClientRequest',
                    paymentsData: JSON.stringify(paymentsDataInput),
                };

                expect(fetchService).toHaveBeenCalledWith(expectedURL, {
                    method: 'POST',
                    body: JSON.stringify(expectedRequestBody),
                    ...fetchServiceWrapperRequestInit,
                });
            });

            it('should return a Promise with a client request response', async () => {
                return expect(clientRequestResponse).resolves.toEqual(mockSuccesfulClientRequestResponse);
            });
        });
    });
});
