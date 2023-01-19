import { createElement } from 'lwc';
import Summary from 'commerce_builder/cartSummaryDesignSubstitute';

describe('commerce_builder/cartSummaryDesignSubstitute: Cart Summary Design Substitute', () => {
    let element: Summary & HTMLElement;

    type summaryDesignSubstitute =
        | 'backgroundColor'
        | 'discountAmountTextColor'
        | 'discountAmountTextSize'
        | 'originalTextColor'
        | 'originalTextSize'
        | 'shippingTextColor'
        | 'shippingTextSize'
        | 'showDiscountAmount'
        | 'showOriginalPrice'
        | 'showShippingPrice'
        | 'showSubtotalPrice'
        | 'showTaxIncludedLabel'
        | 'showTaxPrice'
        | 'subtotalTextColor'
        | 'subtotalTextSize'
        | 'taxTextColor'
        | 'taxTextSize'
        | 'totalTextColor'
        | 'totalTextSize';

    beforeEach(() => {
        element = createElement('commerce_builder-cart-summary-design-substitute', {
            is: Summary,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe.each`
        property                     | defaultValue | changeValue
        ${'backgroundColor'}         | ${undefined} | ${''}
        ${'discountAmountTextColor'} | ${undefined} | ${'#111111'}
        ${'discountAmountTextSize'}  | ${undefined} | ${'small'}
        ${'originalTextColor'}       | ${undefined} | ${'#111111'}
        ${'originalTextSize'}        | ${undefined} | ${'small'}
        ${'shippingTextColor'}       | ${undefined} | ${''}
        ${'shippingTextSize'}        | ${undefined} | ${'small'}
        ${'showDiscountAmount'}      | ${false}     | ${true}
        ${'showOriginalPrice'}       | ${false}     | ${true}
        ${'showShippingPrice'}       | ${false}     | ${true}
        ${'showSubtotalPrice'}       | ${false}     | ${true}
        ${'showTaxIncludedLabel'}    | ${false}     | ${true}
        ${'showTaxPrice'}            | ${false}     | ${true}
        ${'subtotalTextColor'}       | ${undefined} | ${'#111111'}
        ${'subtotalTextSize'}        | ${undefined} | ${'small'}
        ${'taxTextColor'}            | ${undefined} | ${'#111111'}
        ${'taxTextSize'}             | ${undefined} | ${'medium'}
        ${'totalTextColor'}          | ${undefined} | ${'#111111'}
        ${'totalTextSize'}           | ${undefined} | ${'large'}
    `('the $property property', ({ property, defaultValue, changeValue }) => {
        it(`defaults to ${defaultValue}`, () => {
            expect(element[<summaryDesignSubstitute>property]).toBe(defaultValue);
        });

        it('reflects a changed value', () => {
            expect(element[<summaryDesignSubstitute>property]).not.toBe(changeValue);
            element[<summaryDesignSubstitute>property] = <never>changeValue;
            expect(element[<summaryDesignSubstitute>property]).toBe(changeValue);
        });
    });
});
