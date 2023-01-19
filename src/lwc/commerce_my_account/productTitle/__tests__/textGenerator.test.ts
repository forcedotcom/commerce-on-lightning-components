import generateText from '../textGenerator';
//Mock the labels with known values.
jest.mock('../labels', () => ({
    productNameWithUnavailableMessage: '{productName} {productUnavailableMessage}',
}));

describe('commerce_my_account-product-title: Text Generator', () => {
    it('returns the string with product name to the format template( {productName} {productUnavailableMessage} )', () => {
        const labelStr = generateText('Kitten Two', '(No More Available)');
        expect(labelStr).toBe('Kitten Two (No More Available)');
    });
});
