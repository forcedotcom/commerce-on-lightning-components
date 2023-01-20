/************************************
 * Actual API calls for Checkout
 ************************************/

import { composeUri } from 'experience/data';
import { currentRelease } from 'commerce/config';
import webstoreId from '@salesforce/webstore/Id';
import { fetchServiceData, fetchServiceResponseAndData } from './fetchServiceWrapper';
import type { FetchResponseAndData } from './fetchServiceWrapper';
export { FetchResponseAndData } from './fetchServiceWrapper';
import { effectiveAccount } from 'commerce/effectiveAccountApi';

import type {
    Address,
    AddressesRequest,
    CheckoutInformation,
    ContactInfo,
    DeliveryGroup,
    OrderConfirmation,
    ContactPointAddressData,
    PaymentAuthorizationResponse,
    PaymentRequestType,
    PaymentClientRequestResponse,
    PaymentsData,
} from 'types/unified_checkout';
import { end, start } from 'commerce_unified_checkout/ekg';

const API_VERSION = currentRelease.apiVersion;
const baseCheckoutEndPoint = `/services/data/${API_VERSION}/commerce/webstores/${webstoreId}/`;

/**
 * convert typed url query values to strings using typical use case rules
 * basically undefined is elided and everything else is processed by String()
 */
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function stringifyParams(params: Record<string, any>): Record<string, string> {
    const acc = {} as Record<string, string>;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) {
            acc[k] = String(v);
        }
    }
    return acc;
}

/**
 * generates the first part of the URL based on API_VERSION and webstoreId
 * async in case in the future we need to get the app context (which is generally immediately available anyways)
 */
export function prefixUrl(url: string, supportEffectiveAccount = true): string {
    const endPointUrl = `${baseCheckoutEndPoint}${url}`;
    const effectiveAccountId: string | null = effectiveAccount?.accountId;
    return effectiveAccountId && supportEffectiveAccount
        ? composeUri(endPointUrl, { effectiveAccountId })
        : endPointUrl;
}

// ========================================
// Public functions
// ========================================

export async function startCheckout(cartId: string): Promise<CheckoutInformation> {
    const url = prefixUrl(`checkouts`);
    return fetchServiceData<CheckoutInformation>(url, {
        method: 'POST',
        body: JSON.stringify({
            cartId,
            deliveryAddress: 'default', // auto select default delivery address if any
        }),
    });
}

export async function getCheckoutInformation(checkoutId: string): Promise<FetchResponseAndData> {
    const url = prefixUrl(`checkouts/${checkoutId}`);
    /*
     * Monitor cumulative XHR timing getting active checkout session. i.e. 'checkouts/active?' until you get 200
     * This could mean multiple XHRs if first GET receives 404
     *   GET /commerce/webstores/0ZExx0000000001GAA/checkouts/active?language=en-US&asGuest=false --> 404
     *   POST /commerce/webstores/0ZExx0000000001GAA/checkouts?language=en-US&asGuest=false --> 202 checkoutId
     *   GET /commerce/webstores/0ZExx0000000001GAA/checkouts/2z9xx00000002JZAAY?language=en-US&asGuest=false --> 200
     */
    end('t-checkout-1');
    start('t-checkout-2'); // EKG: XHR timer start when 'checkouts/active?' XHR starts
    const result: FetchResponseAndData = await fetchServiceResponseAndData(url, { method: 'GET' });
    if (result.response && result.response.status === 200) {
        end('t-checkout-2'); // EKG: XHR timer end when receive 200.
        start('t-checkout-3');
    }
    return result;
}

export async function deleteCheckoutInformation(checkoutId: string): Promise<void> {
    const url = prefixUrl(`checkouts/${checkoutId}`);
    return fetchServiceData<void>(url, { method: 'DELETE' });
}

export async function updateShippingAddress(
    inputParams: DeliveryGroup,
    checkoutId: string
): Promise<FetchResponseAndData> {
    const url = prefixUrl(`checkouts/${checkoutId}`);
    return fetchServiceResponseAndData(url, {
        method: 'PATCH',
        body: JSON.stringify(inputParams),
    });
}

export async function updateDeliveryMethod(
    deliveryMethodId: string,
    checkoutId: string
): Promise<FetchResponseAndData> {
    const url = prefixUrl(`checkouts/${checkoutId}`);
    return fetchServiceResponseAndData(url, {
        method: 'PATCH',
        body: JSON.stringify({ deliveryMethodId: deliveryMethodId }),
    });
}

export async function updateContactInformation(
    inputParams: ContactInfo,
    checkoutId: string
): Promise<FetchResponseAndData> {
    const url = prefixUrl(`checkouts/${checkoutId}`);
    return fetchServiceResponseAndData(url, {
        method: 'PATCH',
        body: JSON.stringify({ contactInfo: inputParams }),
    });
}

export async function placeOrder(checkoutId: string): Promise<OrderConfirmation> {
    const url = prefixUrl(`checkouts/${checkoutId}/orders`);
    return fetchServiceData<OrderConfirmation>(url, { method: 'POST' });
}

export async function createContactPointAddress(inputParams: Address): Promise<Address> {
    const accountId: string = effectiveAccount.accountId || 'current';
    const url = prefixUrl(`accounts/${accountId}/addresses`, false);
    return fetchServiceData<Address>(url, {
        method: 'POST',
        body: JSON.stringify(inputParams),
    });
}

export async function updateContactPointAddress(addressId: string, inputParams: Address): Promise<Address> {
    const accountId: string = effectiveAccount.accountId || 'current';
    const url = prefixUrl(`accounts/${accountId}/addresses/${addressId}`, false);
    return fetchServiceData<Address>(url, {
        method: 'PATCH',
        body: JSON.stringify(inputParams),
    });
}

export async function getContactPointAddresses(params: AddressesRequest): Promise<ContactPointAddressData> {
    const paramStr: Record<string, string> = stringifyParams(params);
    const accountId: string = effectiveAccount.accountId || 'current';
    const url = composeUri(prefixUrl(`accounts/${accountId}/addresses`, false), paramStr);
    /*
     * EKG: XHR timer start for getting list of addresses
     *   e.g /commerce/webstores/0ZExx0000000001GAA/accounts/current/addresses?pageSize=6
     */
    if ('pageSize' in paramStr) {
        // start marker for URL with pageSize
        end('t-address-1');
        start('t-address-2');
    }
    const result: ContactPointAddressData = await fetchServiceData<ContactPointAddressData>(url, { method: 'GET' });
    if ('pageSize' in paramStr) {
        // end marker for URL with pageSize
        end('t-address-2');
        start('t-address-3');
    }
    return result;
}

export async function authorizePayment(
    activeOrCheckoutId: string,
    token: string,
    requestType: PaymentRequestType,
    billingAddress?: Address
): Promise<PaymentAuthorizationResponse> {
    const url = prefixUrl(`checkouts/${activeOrCheckoutId}/payments`);

    const requestPayload = {
        paymentToken: token,
        requestType,
        billingAddress,
    };

    return fetchServiceData<PaymentAuthorizationResponse>(url, {
        method: 'POST',
        body: JSON.stringify(requestPayload),
    });
}

export async function clientRequest(
    activeOrCheckoutId: string,
    paymentsData: PaymentsData = {}
): Promise<PaymentClientRequestResponse> {
    const url = await prefixUrl(`checkouts/${activeOrCheckoutId}/payments`);

    const requestPayload = {
        requestType: 'ClientRequest',
        paymentsData: JSON.stringify(paymentsData),
    };

    return fetchServiceData<PaymentClientRequestResponse>(url, {
        method: 'POST',
        body: JSON.stringify(requestPayload),
    });
}
