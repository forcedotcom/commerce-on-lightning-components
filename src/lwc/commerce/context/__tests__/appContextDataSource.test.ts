import { readAppContext } from '../appContextDataSource';
import { fetchService } from 'experience/data';

// eslint-disable-next-line jest/no-mocks-import
import { mockData } from '../__mocks__/mockData';

// These mocks cover aspects of interaction with the server that we don't want to be testing
jest.mock('experience/data', () => {
    return {
        fetchService: jest.fn(),
    };
});

describe('commerce/appContextDataSource tests', () => {
    it('readAppContext should return appContext when fetchService returns a Response', async () => {
        (fetchService as jest.Mock).mockResolvedValue({ ...mockData.appData });
        expect(await readAppContext()).toEqual({ ...mockData.appData });
    });

    it('readAppContext should rethrow when fetchService throws a Response', async () => {
        (fetchService as jest.Mock).mockRejectedValue({ statusText: 'some error' });
        await expect(readAppContext()).rejects.toThrow('some error');
    });
});
