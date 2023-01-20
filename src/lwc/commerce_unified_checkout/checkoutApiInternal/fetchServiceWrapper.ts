/**
 * See experience-components/src/lwc/experience/data/fetchService.ts
 * This file contains temporary work-arounds for fetchService
 * The expectation is the work-arounds will not be necessary in the future
 */

import { fetchService } from 'experience/data';
import type { FetchRequestInit, ResponseInterceptor } from 'experience/data';

// the purpose of this section is to retrieve BOTH the fetch Response
// AND the parsed JSON response body from an API call so we can take different
// action based on the HTTP status, and so we can see parsed JSON for
// non-OK statuses.

/**
 * response with parsed body
 *
 * Note: purposely not a generic type so callers can easily detect
 * thrown typed errors as: if (err instanceof ParsedResponse) { }
 * and so thrown errors can have differently typed response bodies
 * than success conditions.
 */
export class FetchResponseAndData {
    constructor(public readonly response: Response, public readonly data: Record<string, unknown> | null) {}

    /**
     * helper to cast json to preferred type
     */
    typedData<T = Record<string, unknown>>(): T {
        return <T>this.data;
    }
}

/**
 * extract json parser from defaultResponseInterceptor
 * add ability to parse non-ok status responses
 * don't stream the response if the content-type isn't JSON
 * return null if response body is empty (we ignore content-length and us actual body)
 * throw an Error if response body is not empty but not parsable
 */
export async function responseJsonParser(response: Response): Promise<Record<string, unknown> | null> {
    const contentType = response.headers?.get('content-type');
    if (typeof contentType === 'string' && contentType.includes('application/json')) {
        // warning! content-length header not available for some cross site calls
        // warning! content-length header not available for some SF error responses
        // rather than use content-length we explicitly stream and parse
        const body = await response.text();
        if (body.trim().length) {
            return JSON.parse(body);
        }
    }
    return null;
}

/**
 * the defaultResponseInterceptor swallows all the http status and response header data.
 * this one just passes back the full response.
 */
export const noopResponseInterceptor: ResponseInterceptor<Response> = (
    response: Response,
    _url: string,
    _requestInit: FetchRequestInit
): Response => response;

/**
 * calls fetchService but returns response and parsed JSON body
 * on error throws object with response and generic parsed JSON body
 */
export async function fetchServiceResponseAndData(
    executorOrRequestInfo: RequestInfo,
    requestInit?: FetchRequestInit
): Promise<FetchResponseAndData> {
    const response = await fetchService<Response>(executorOrRequestInfo, {
        ...requestInit,
        interceptResponse: noopResponseInterceptor,
    }).catch((e) => {
        // fetchService throws after the response interceptor for non 2xx status
        // here we catch those and return them instead of throwing
        if (e instanceof Response) {
            return e;
        }
        // rethrow all unrecognized errors
        //
        // this also includes unit tests mocking FetchService failures
        // Example: (<jest.Mock>fetchService).mockRejectedValue({ errorKey: 'value' });
        throw e;
    });

    // this branch always taken except during some unit tests
    if (response instanceof Response) {
        const data = await responseJsonParser(response);
        return new FetchResponseAndData(response, data);
    }

    // we only reach this code when a unit test mocks FetchService to simulate a success
    // response by returning something that isn't a Response object.
    // in those cases we just pass the farce through so we maintain forwards and
    // backwards compatibility with the unwrapped fetchService.
    // Example: (<jest.Mock>fetchService).mockResolvedValue({ key: 'value' });
    return response;
}

/**
 * like fetchService returns parsed JSON body
 * except on error throws parsed JSON body of error if available
 * mimics expected behavior of feb 2 commit 70f0123a
 */
export async function fetchServiceData<T>(
    executorOrRequestInfo: RequestInfo,
    requestInit?: FetchRequestInit
): Promise<T> {
    const fetchResponse = await fetchServiceResponseAndData(executorOrRequestInfo, requestInit);

    // this branch always taken except during some unit tests
    if (fetchResponse instanceof FetchResponseAndData) {
        if (!fetchResponse.response.ok) {
            // when error body available as JSON then throw error body without response
            // note: this is the apparent behavior as of feb 2 commit 70f0123a
            if (fetchResponse.data) {
                throw fetchResponse.data;
            }
            // when error body can't be parsed throw the response object
            // warning caller might not be able to tell if body when body is no longer available
            // because we already tried to stream it and failed to parse it.
            throw fetchResponse.response;
        }
        return fetchResponse.typedData<T>();
    }

    // we only reach this code when a unit test mocks FetchService
    // see related comments in this file for more information
    return fetchResponse;
}
