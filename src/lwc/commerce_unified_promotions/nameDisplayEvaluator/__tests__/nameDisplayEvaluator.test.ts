import { generateDisplayablePromotionName } from 'commerce_unified_promotions/nameDisplayEvaluator';

// Mock the labels with known values.
jest.mock(
    '@salesforce/label/Cart_Applied_Promotions.couponCodeValueWithPromotionNameSeparator',
    () => {
        return {
            default: '{code} - {name}',
        };
    },
    { virtual: true }
);

describe('commerce_unified_promotions/nameDisplayEvaluator: Promotion Name Display', () => {
    [
        {
            name: '10% All Cart Items',
            code: '10OFFCART',
            result: '10OFFCART - 10% All Cart Items',
        },
        {
            name: '10% All Cart Items',
            code: '',
            result: '10% All Cart Items',
        },
        {
            name: '',
            code: '10OFFCART',
            result: '10OFFCART',
        },
    ].forEach((p) => {
        it(`returns the string "${p.result}" when name is "${p.name}" & code is "${p.code}"`, () => {
            const labelStr = generateDisplayablePromotionName(p.name, p.code);
            expect(labelStr).toBe(p.result);
        });
    });

    [''].forEach((invalidInput) => {
        it(`generates no text for an invalid name & code (${invalidInput})`, () => {
            expect(generateDisplayablePromotionName(invalidInput, invalidInput)).toBe(invalidInput);
        });
    });
});
