import {
    fetchServiceResponseAndData,
    fetchServiceData,
    noopResponseInterceptor,
    responseJsonParser,
} from '../fetchServiceWrapper';
import { fetchService } from 'experience/data';

// These mocks cover aspects of interaction with the server that we don't want to be testing
jest.mock('experience/data', () => {
    return {
        fetchService: jest.fn(),
    };
});

function mockResponse(status = 200, body: string | null = '{"key":"value"}'): Response {
    return new Response(body, {
        status,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

describe('fetchServiceResponseAndData tests', () => {
    it('responseJsonParser should return null when JSON not present', async () => {
        expect(await responseJsonParser({} as Response)).toBeNull();
    });

    it('responseJsonParser should return JSON when present', async () => {
        expect(await responseJsonParser(mockResponse())).toEqual({ key: 'value' });
    });

    it('noopResponseInterceptor should return the response', () => {
        expect((noopResponseInterceptor(mockResponse(), 'url', {}) as Response).status).toBe(200);
    });

    it('fetchServiceResponseAndData should return FetchResponseAndData when fetchService returns a Response', async () => {
        (fetchService as jest.Mock).mockResolvedValue(mockResponse());
        const result = await fetchServiceResponseAndData('url');
        expect(result.response.status).toBe(200);
        expect(result.data).toEqual({ key: 'value' });
    });

    it('fetchServiceResponseAndData should return FetchResponseAndData when fetchService throws a Response', async () => {
        (fetchService as jest.Mock).mockRejectedValue(mockResponse(400));
        const result = await fetchServiceResponseAndData('url');
        expect(result.response.status).toBe(400);
        expect(result.data).toEqual({ key: 'value' });
    });

    it('fetchServiceResponseAndData should rethrow when fetchService throws a non-Response', async () => {
        (fetchService as jest.Mock).mockRejectedValue(new Error('some error'));
        await expect(fetchServiceResponseAndData('url')).rejects.toThrow('some error');
    });

    it('fetchServiceData should return json when fetchService returns a Response', async () => {
        (fetchService as jest.Mock).mockResolvedValue(mockResponse());
        const result = await fetchServiceData('url');
        expect(result).toEqual({ key: 'value' });
    });

    it('fetchServiceData should throw error JSON when fetchService throws a Response with body', async () => {
        (fetchService as jest.Mock).mockRejectedValue(mockResponse(400));
        await expect(fetchServiceData('url')).rejects.toEqual({ key: 'value' });
    });

    it('fetchServiceData should throw Response when fetchService throws a Response with no body', async () => {
        (fetchService as jest.Mock).mockRejectedValue(mockResponse(400, null));
        await expect(fetchServiceData('url')).rejects.toBeInstanceOf(Response);
    });

    it('fetchServiceData should rethrow when fetchService throws a non-Response', async () => {
        (fetchService as jest.Mock).mockRejectedValue(new Error('some error'));
        await expect(fetchServiceData('url')).rejects.toThrow('some error');
    });
});
