// Contact Point Address Store and Adapter

import type { Action, Adapter, State, StoreAdapterCallbackHandler } from 'experience/store';
import { Store, StoreAdapter, StoreActionError } from 'experience/store';
import {
    createContactPointAddress as dsCreateContactPointAddress,
    updateContactPointAddress as dsUpdateContactPointAddress,
    getContactPointAddresses,
} from './checkoutApiDataSource';
import { getSessionContext } from 'commerce/contextApi';
import type { Address, ContactPointAddressData } from 'types/unified_checkout';

import { CREATECONTACTPOINTADDRESS, UPDATECONTACTPOINTADDRESS } from './action-types';

// ====================================
// AddressStore definition
// ====================================

interface AddressStore {
    // cached data for all CPA queries
    addressList?: ContactPointAddressData;
}

// ========================================
// Store action implementations (private)
// ========================================

async function _createContactPointAddress(address: Address): Promise<Address> {
    return dsCreateContactPointAddress(address);
}

async function _updateContactPointAddress(address: Address): Promise<Address> {
    // addressId is required but cannot be passed in the PATCH body
    // fields is strangely not allowed either
    if (!address.addressId) {
        throw new Error('addressId is required');
    }
    const { addressId, fields, ...updatedAddress } = address;
    return dsUpdateContactPointAddress(address.addressId, updatedAddress);
}

// ====================================
// AddressStore implementation (public)
// ====================================
// Here we define the actions we can perform on the store, and what they do
// update actions return a Promise so our callers can wait on them if needed

export const addressStore = new Store<AddressStore>('Address', {
    actions: {
        [CREATECONTACTPOINTADDRESS]: (_: State<AddressStore>, payload: Address): Promise<Address> =>
            _createContactPointAddress(payload),
        [UPDATECONTACTPOINTADDRESS]: (_: State<AddressStore>, payload: Address): Promise<Address> =>
            _updateContactPointAddress(payload),
    },
});

// ====================================
// Adapter helpers (private)
// ====================================

function checkoutAddressConnector(adapter: Adapter<AddressStore>): void {
    // forces delayed cache reload after adding or updating a new address
    [CREATECONTACTPOINTADDRESS, UPDATECONTACTPOINTADDRESS].forEach((action: string) =>
        adapter.subscribeAction(action, () => adapter.load())
    );
}

/**
 * helper to load ContactPointAddressData into CheckoutAddressAdapter
 * - default is first
 * - accepts params: pageSize, addressType, sortOrder
 * - bypasses API when !isLoggedIn
 */
async function checkoutAddressLoader(params: Action<Record<string, unknown>>): Promise<ContactPointAddressData> {
    const sessionContext = await getSessionContext();
    if (!sessionContext.isLoggedIn) {
        throw new Error('not authenticated'); // short circuit API for guest user
    }

    const addressType = params?.payload?.addressType as string | undefined; // e.g. 'Shipping', 'Shipping,Billing', etc.
    const pageSize = params?.payload?.pageSize as number | undefined;
    try {
        const [responseList, responseDefault] = await Promise.all([
            getContactPointAddresses({
                pageSize,
                addressType,
                excludeUnsupportedCountries: true,
                sortOrder: params?.payload?.sortOrder as string | undefined,
            }),
            getContactPointAddresses({
                addressType,
                excludeUnsupportedCountries: true,
                defaultOnly: true,
            }),
            // FUTURE: retrieve the selected address by ID here and fold it into the result
        ]);
        let items = responseList.items.filter((item) => !item.isDefault);
        if (responseDefault.items[0]?.isDefault) {
            items.unshift(responseDefault.items[0]);
        }
        if (pageSize && items.length > pageSize && responseList.nextPageUrl) {
            items = items.slice(0, pageSize);
        }
        return Object.assign({}, responseList, { items });
    } catch (e) {
        throw new StoreActionError(e);
    }
}

// ========================
// Adapter Definitions (public)
// ========================

/**
 * this is a deeper get address list API wrapper that uses multiple calls to aggregate the return result.
 * See checkoutAddressLoader for details
 */
export class CheckoutAddressAdapter extends StoreAdapter<AddressStore> {
    constructor(dataCallBack: StoreAdapterCallbackHandler<string>) {
        super(dataCallBack, addressStore, 'addressList', {
            loader: checkoutAddressLoader,
            connectors: [checkoutAddressConnector],
        });
    }
}

// ====================================
// Convenience functions (public)
// ====================================
// These can be used instead of directly manipulating the store via dispatch() methods

/**
 * create a new CPA record
 * does not affect the checkout session
 */
export function createContactPointAddress(shippingAddress: Address): Promise<Address> {
    return addressStore.dispatch(CREATECONTACTPOINTADDRESS, shippingAddress);
}

/**
 * update an existing CPA record
 * does not affect the checkout session
 */
export function updateContactPointAddress(address: Address): Promise<Address> {
    return addressStore.dispatch(UPDATECONTACTPOINTADDRESS, address);
}
