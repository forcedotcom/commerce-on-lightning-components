import { FetchResponseAndData, noopResponseInterceptor } from '../fetchServiceWrapper';

/**
 * helper to make mocking these easier
 */
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function mockFetchResponseAndData(status = 200, data: any = {}): FetchResponseAndData {
    return new FetchResponseAndData(<Response>{ status, ok: 200 <= status && status < 300 }, data);
}

/**
 * Sadly some unit tests cannot be transparently wrapped because we are injecting
 * into requestInit. At least make it easy to erite these cases.
 */
export const fetchServiceWrapperRequestInit = { interceptResponse: noopResponseInterceptor };
