import { formatAddress } from '../formatAddress';

const input = 'API address [415 Mission Street (Shipping), San Francisco, CA, 94105, US, null, null, null, null, null]';

const output = '415 Mission Street (Shipping), San Francisco,  CA  US, 94105';

describe('formatAddress', () => {
    it('returns the expected field value for the billing address field type', () => {
        const result = formatAddress(input);
        expect(result).toEqual(output);
    });
});
