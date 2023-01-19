import { createElement } from 'lwc';
import CartAppliedPromotionsDesignSubstitute from 'commerce_unified_promotions/cartAppliedPromotionsDesignSubstitute';

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(() => Promise.resolve()),
    }),
    { virtual: true }
);

describe('commerce_unified_promotions/CartAppliedPromotionsDesignSubstitute: Cart Applied Promotions Design Substitute', () => {
    let element: CartAppliedPromotionsDesignSubstitute & HTMLElement;

    type cartAppliedPromotionsDesignSubstitute =
        | 'appliedPromotionsTitleText'
        | 'termsAndConditionsTitleText'
        | 'showDiscountAmount'
        | 'showTermsAndConditions'
        | 'backgroundColor'
        | 'appliedPromotionsTitleTextColor'
        | 'appliedPromotionsTitleFontSize'
        | 'appliedPromotionsTextColor'
        | 'discountAmountTextColor'
        | 'appliedPromotionsFontSize';

    beforeEach(() => {
        element = createElement('commerce_unified_promotions-cart-applied-promotions-design-substitute', {
            is: CartAppliedPromotionsDesignSubstitute,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe.each`
        property                             | defaultValue | changeValue
        ${'appliedPromotionsTitleText'}      | ${undefined} | ${'Applied Promotions'}
        ${'termsAndConditionsTitleText'}     | ${undefined} | ${'Terms and Conditions'}
        ${'showDiscountAmount'}              | ${false}     | ${true}
        ${'showTermsAndConditions'}          | ${false}     | ${true}
        ${'backgroundColor'}                 | ${undefined} | ${''}
        ${'appliedPromotionsTitleTextColor'} | ${undefined} | ${''}
        ${'appliedPromotionsTitleFontSize'}  | ${undefined} | ${'small'}
        ${'appliedPromotionsTextColor'}      | ${undefined} | ${''}
        ${'discountAmountTextColor'}         | ${undefined} | ${''}
        ${'appliedPromotionsFontSize'}       | ${undefined} | ${'small'}
    `('the $property property', ({ property, defaultValue, changeValue }) => {
        it(`defaults to ${defaultValue}`, () => {
            expect(element[<cartAppliedPromotionsDesignSubstitute>property]).toBe(defaultValue);
        });

        it('reflects a changed value', () => {
            expect(element[<cartAppliedPromotionsDesignSubstitute>property]).not.toBe(changeValue);
            element[<cartAppliedPromotionsDesignSubstitute>property] = <never>changeValue;
            expect(element[<cartAppliedPromotionsDesignSubstitute>property]).toBe(changeValue);
        });
    });
});
