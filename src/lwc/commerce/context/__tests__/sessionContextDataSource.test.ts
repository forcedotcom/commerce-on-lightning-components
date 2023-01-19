import { readSessionContext } from '../sessionContextDataSource';
import { fetchService } from 'experience/data';
import { sessionContextResponse } from './mockDataHelpers';

jest.mock('experience/data', () => ({ fetchService: jest.fn() }));

describe('sessionContextDataSource', () => {
    describe('readSessionContext', () => {
        it('should fetch data', async () => {
            (<jest.Mock>fetchService).mockResolvedValue(sessionContextResponse());

            await readSessionContext();

            expect(fetchService).toHaveBeenCalledTimes(1);
        });

        it('should read a product with an error', async () => {
            (<jest.Mock>fetchService).mockRejectedValue({ statusText: 'FooError' });

            await expect(readSessionContext).rejects.toThrow('FooError');
        });
    });
});
