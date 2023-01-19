import { generateAssistiveText } from '../assistiveTextGenerator';

//Mock the labels with known values.
jest.mock('../labels.ts', () => ({
    removeCouponAssistiveText: 'Remove {code}',
}));

describe('commerce_unified_coupons/summary: Assistive Text Generator', () => {
    it('returns the string with coupon name to the format template( Remove {code})', () => {
        const labelStr = generateAssistiveText('10OFFCART');
        expect(labelStr).toBe('Remove 10OFFCART');
    });

    [undefined, null, ''].forEach((invalidCouponName) => {
        it(`returns the string 'Remove ' with a coupon name of ${JSON.stringify(invalidCouponName)}`, () => {
            const labelStr = generateAssistiveText(invalidCouponName);
            expect(labelStr).toBe('Remove ');
        });
    });
});
