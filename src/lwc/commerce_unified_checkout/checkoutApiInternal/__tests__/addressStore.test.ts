// imports to mock:

// datasource imports
import {
    createContactPointAddress,
    updateContactPointAddress,
    getContactPointAddresses,
} from '../checkoutApiDataSource';

// eslint-disable-next-line jest/no-mocks-import
import { getSessionContext } from 'commerce/contextApi';
import { getStoreAdapterValue } from 'experience/store';

// imports to test
import {
    addressStore,
    createContactPointAddress as createContactPointAddressCheckoutApi,
    updateContactPointAddress as updateContactPointAddressCheckoutApi,
    CheckoutAddressAdapter,
} from '../addressStore';

import { CREATECONTACTPOINTADDRESS, UPDATECONTACTPOINTADDRESS } from '../action-types';

// types:
import type { Address, ContactPointAddressData, PlatformError } from 'types/unified_checkout';

// These mocks cover aspects of interaction with the server that we don't want to be testing
jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('commerce/contextApi', () => {
    return {
        getSessionContext: jest.fn().mockReturnValue({ isLoggedIn: true }),
    };
});

/**
 * CPA response
 */
function mockedCPAResponse(): ContactPointAddressData {
    return {
        nextPageUrl: 'url',
        items: [
            {
                addressId: 'address1',
                isDefault: true,
            },
            {
                addressId: 'address2',
                isDefault: false,
            },
        ],
    } as ContactPointAddressData;
}

function mockedCPA404Response(): PlatformError[] {
    return [
        {
            errorCode: 'ITEM_NOT_FOUND',
            message: "You can't perform this operation.",
        },
    ];
}

// Most of the mocks come from the checkoutApiDataSource where we mock every needed function generally returning a generic string
jest.mock('../checkoutApiDataSource', () => {
    const originalModule = jest.requireActual('../checkoutApiDataSource');
    return Object.assign({ __esModule: true }, originalModule, {
        createContactPointAddress: jest.fn().mockResolvedValue('createContactPointAddressResult'),
        updateContactPointAddress: jest.fn().mockResolvedValue('updateContactPointAddressResult'),
        getContactPointAddresses: jest.fn().mockResolvedValue(mockedCPAResponse()),
    });
});

/**
 * These tests cover just the checkoutApi file but do touch other files that weren't mocked. Not every method
 * was mocked, however just enough to ensure no calls were attempted of the server.
 */
describe('commerce_unified_checkout/addressStore tests', () => {
    // Generic address usable in a several tests
    const address: Address | null = {
        city: 'Cityville',
        country: 'Countrystan',
        isDefault: false,
        name: 'Namo',
        postalCode: '12344',
        region: 'CA',
        street: '122 Boulevard Street',
    };

    /**
     * Make sure we clear the mocks and Store state between methods to not create dependencies
     */
    afterEach(() => {
        addressStore.delete();
        jest.clearAllMocks();
    });

    it('correctly makes a call to the correct DataSource for creating contact point address', async () => {
        // Testing CheckoutApi.createContactPointAddress()
        const result = await createContactPointAddressCheckoutApi(address);
        expect(createContactPointAddress).toHaveBeenCalledTimes(1);
        expect(createContactPointAddress).toHaveBeenCalledWith(address);
        expect(result).toBe('createContactPointAddressResult');
    });

    it('correctly makes a call to the correct DataSource for updating contact point address', async () => {
        // Testing CheckoutApi.updateContactPointAddress()
        const addressId = '0x123';
        const result = await updateContactPointAddressCheckoutApi({
            ...address,
            addressId,
        });
        expect(updateContactPointAddress).toHaveBeenCalledTimes(1);
        expect(updateContactPointAddress).toHaveBeenCalledWith(addressId, address);
        expect(result).toBe('updateContactPointAddressResult');
    });

    it('prevents a call to the correct DataSource for updating contact point address with no addressId', async () => {
        // Testing CheckoutApi.updateContactPointAddress()
        await expect(updateContactPointAddressCheckoutApi(address)).rejects.toThrow('addressId is required');
        expect(updateContactPointAddress).toHaveBeenCalledTimes(0);
    });

    it('correctly calls the contact point address api', async () => {
        const result = await getContactPointAddresses({ pageSize: 5, addressType: 'Shipping', defaultOnly: false });
        expect(result).toEqual(mockedCPAResponse());
    });

    describe('actions', () => {
        [CREATECONTACTPOINTADDRESS, UPDATECONTACTPOINTADDRESS].forEach((action: string) => {
            it(`should reload the address items when the '${action}' action occurs `, async () => {
                const dataCallback = jest.fn();
                const adapter = new CheckoutAddressAdapter(dataCallback);
                adapter.update({});
                adapter.connect();

                jest.spyOn(adapter, 'load');

                expect(adapter.load).not.toHaveBeenCalled();
                await addressStore.dispatch(action, {
                    ...address,
                    addressId: '0x123',
                });
                expect(adapter.load).toHaveBeenCalledTimes(1);
            });
        });
    });

    it('calls the address adapter when logged in', async () => {
        const dataCallback = jest.fn();
        const adapter = new CheckoutAddressAdapter(dataCallback);
        (<jest.Mock>getSessionContext).mockResolvedValue({ isLoggedIn: true });
        adapter.update({ pageSize: 1 });
        adapter.connect();
        const adapterResult = await adapter.load();

        const pagedResponse = mockedCPAResponse();
        pagedResponse.items = pagedResponse.items.slice(0, 1);
        expect(adapterResult.data).toEqual(pagedResponse);

        expect(adapterResult.loaded).toBe(true);
        expect(adapterResult.error).toBeUndefined();
    });

    it('skips the address adapter when logged in', async () => {
        const dataCallback = jest.fn();
        const adapter = new CheckoutAddressAdapter(dataCallback);
        (<jest.Mock>getSessionContext).mockResolvedValue({ isLoggedIn: false });
        adapter.update({});
        adapter.connect();
        const adapterResult = await adapter.load();

        expect(adapterResult.data).toBeUndefined();
        expect(adapterResult.loaded).toBe(true);
        expect(adapterResult.error).toContain('not authenticated');
    });

    it('loads an error when start checkout failed after get checkout API returns 404', async () => {
        expect.assertions(1);
        (getContactPointAddresses as jest.Mock).mockRejectedValue(mockedCPA404Response());
        const dataCallback = jest.fn();
        const adapter = new CheckoutAddressAdapter(dataCallback);
        (<jest.Mock>getSessionContext).mockResolvedValue({ isLoggedIn: true });
        adapter.update({ pageSize: 1 });
        adapter.connect();
        await adapter.load();
        try {
            await getStoreAdapterValue<ContactPointAddressData>(CheckoutAddressAdapter);
        } catch (e) {
            expect(e).toHaveProperty('error', [{ errorCode: 'ITEM_NOT_FOUND' }]);
        }
    });
});
