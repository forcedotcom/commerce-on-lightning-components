import generateTextForTotalResults from '../textGenerator';

//Mock the labels with known values.
jest.mock('../labels', () => ({
    totalResults: '{count} Results',
    oneResult: 'One Result',
}));

describe('commerce_my_account-orders-refinements: Text Generator', () => {
    it('returns the string with total number of records to the format template( {count} Results ) when numbe of records are more than 1', () => {
        const labelStr = generateTextForTotalResults(2);
        expect(labelStr).toBe('2 Results');
    });

    it("returns the string 'One Result' when there is only one record on the page", () => {
        const labelStr = generateTextForTotalResults(1);
        expect(labelStr).toBe('One Result');
    });
});
