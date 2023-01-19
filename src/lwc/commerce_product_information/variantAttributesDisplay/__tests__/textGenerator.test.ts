import generateText from '../textGenerator';

// Mock the labels with known values.
jest.mock('../labels', () => ({
    nameValueWithSeparator: '{name}: {value}',
}));

describe('commerce_product_information/variantAttributesDisplay: Text Generator', () => {
    it(`returns the string with the attribute name and value to the format template( {name}:{value} )"`, () => {
        const labelStr = generateText('Size', 'XL');
        expect(labelStr).toBe('Size: XL');
    });
});
