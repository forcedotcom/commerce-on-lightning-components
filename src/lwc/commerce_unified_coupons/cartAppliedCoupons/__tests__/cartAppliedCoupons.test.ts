import { createElement } from 'lwc';
import type { TestWireAdapter } from 'types/testing';
// @ts-ignore
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import MatchMediaMock from 'jest-matchmedia-mock';
import { CartCouponsAdapter, CartSummaryAdapter } from 'commerce/cartApi';
import CartAppliedCoupons from 'commerce_unified_coupons/cartAppliedCoupons';
import type Summary from 'commerce_unified_coupons/summary';
import { querySelector } from 'kagekiri';
import { apiData, transformedApiData, summaryApiData } from './data/cartAppliedCouponsData';
import { registerSa11yMatcher } from '@sa11y/jest';
import type InputForm from 'commerce_unified_coupons/inputForm';

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(() => Promise.resolve()),
    }),
    { virtual: true }
);

jest.mock('commerce/cartApi', () =>
    Object.assign({}, jest.requireActual('commerce/cartApi'), {
        CartCouponsAdapter: mockCreateTestWireAdapter(),
        CartSummaryAdapter: mockCreateTestWireAdapter(),
    })
);

const cartCouponsAdapter = <typeof CartCouponsAdapter & typeof TestWireAdapter>CartCouponsAdapter;
const cartSummaryAdapter = <typeof CartSummaryAdapter & typeof TestWireAdapter>CartSummaryAdapter;

describe('commerce_unified_coupons/CartAppliedCoupons: Cart Applied Coupons', () => {
    let element: CartAppliedCoupons & HTMLElement;
    let matchMedia: MatchMediaMock;

    type cartAppliedCoupons =
        | 'backgroundColor'
        | 'showRevealCouponFormButton'
        | 'revealCouponFormButtonText'
        | 'revealCouponFormButtonTextColor'
        | 'revealCouponFormButtonFontSize'
        | 'couponFormPlaceholderText'
        | 'couponInputBoxBorderRadius'
        | 'couponInputBoxBackgroundColor'
        | 'couponInputBoxTextColor'
        | 'applyCouponButtonText'
        | 'applyCouponButtonTextColor'
        | 'applyCouponButtonTextHoverColor'
        | 'applyCouponButtonBackgroundColor'
        | 'applyCouponButtonBackgroundHoverColor'
        | 'applyCouponButtonBorderColor'
        | 'applyCouponButtonBorderRadius'
        | 'appliedCouponsFontSize'
        | 'appliedCouponsTextColor'
        | 'showTermsAndConditions'
        | 'termsAndConditionsTitleText';

    beforeAll(() => {
        registerSa11yMatcher();
        matchMedia = new MatchMediaMock();
    });

    afterAll(() => {
        matchMedia.destroy();
    });

    beforeEach(() => {
        element = createElement('commerce_unified_coupons-cart-applied-coupons', {
            is: CartAppliedCoupons,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe.each`
        property                                   | defaultValue | changeValue
        ${'backgroundColor'}                       | ${undefined} | ${''}
        ${'showRevealCouponFormButton'}            | ${false}     | ${true}
        ${'revealCouponFormButtonText'}            | ${undefined} | ${'Show Coupon Form'}
        ${'revealCouponFormButtonTextColor'}       | ${undefined} | ${''}
        ${'revealCouponFormButtonFontSize'}        | ${undefined} | ${'small'}
        ${'couponFormPlaceholderText'}             | ${undefined} | ${'Enter coupon...'}
        ${'couponInputBoxBorderRadius'}            | ${undefined} | ${''}
        ${'couponInputBoxBackgroundColor'}         | ${undefined} | ${''}
        ${'couponInputBoxTextColor'}               | ${undefined} | ${''}
        ${'applyCouponButtonText'}                 | ${undefined} | ${'Apply'}
        ${'applyCouponButtonTextColor'}            | ${undefined} | ${''}
        ${'applyCouponButtonTextHoverColor'}       | ${undefined} | ${''}
        ${'applyCouponButtonBackgroundColor'}      | ${undefined} | ${''}
        ${'applyCouponButtonBackgroundHoverColor'} | ${undefined} | ${''}
        ${'applyCouponButtonBorderColor'}          | ${undefined} | ${''}
        ${'applyCouponButtonBorderRadius'}         | ${undefined} | ${''}
        ${'appliedCouponsFontSize'}                | ${undefined} | ${'small'}
        ${'appliedCouponsTextColor'}               | ${undefined} | ${''}
        ${'showTermsAndConditions'}                | ${false}     | ${true}
        ${'termsAndConditionsTitleText'}           | ${undefined} | ${'Terms and Conditions'}
    `('the $property property', ({ property, defaultValue, changeValue }) => {
        it(`defaults to ${defaultValue}`, () => {
            expect(element[<cartAppliedCoupons>property]).toBe(defaultValue);
        });

        it('reflects a changed value', () => {
            expect(element[<cartAppliedCoupons>property]).not.toBe(changeValue);
            // eslint-disable-next-line
            (element as any)[<cartAppliedCoupons>property] = changeValue;
            expect(element[<cartAppliedCoupons>property]).toBe(changeValue);
        });
    });

    describe('a11y', () => {
        it('should be accessible when the reveal coupon input button is shown', async () => {
            element.applyCouponButtonText = 'APPLY';
            element.revealCouponFormButtonText = 'Reveal Coupon';
            element.appliedCouponsFontSize = 'medium';
            element.revealCouponFormButtonFontSize = 'large';
            await Promise.resolve();
            return Promise.resolve().then(() => expect(element).toBeAccessible());
        });
    });

    describe('CartCouponsAdapter', () => {
        beforeEach(() => {
            element.showTermsAndConditions = true;
            element.applyCouponButtonText = 'APPLY';
            element.revealCouponFormButtonText = 'Reveal Coupon';
            element.appliedCouponsFontSize = 'small';
        });

        it('displays the cart applied coupons when coupons are available', async () => {
            element.showTermsAndConditions = true;

            cartSummaryAdapter.emit({
                data: summaryApiData.withItems,
                error: undefined,
                loaded: true,
                loading: false,
            });

            cartCouponsAdapter.emit({
                data: apiData.withCoupons,
                error: undefined,
                loaded: true,
                loading: false,
            });
            await Promise.resolve();

            return Promise.resolve().then(() => {
                const summary = <Summary & HTMLElement>querySelector('commerce_unified_coupons-summary');
                expect(summary.appliedCoupons).toStrictEqual(transformedApiData.withDetailsAndFocusable);
            });
        });

        it('displays no cart applied coupons when no coupons data is available', () => {
            cartCouponsAdapter.emit({
                data: apiData.withoutCoupons,
                error: undefined,
                loaded: true,
                loading: false,
            });
            return Promise.resolve().then(() => {
                const summary = <Summary & HTMLElement>querySelector('commerce_unified_coupons-summary');
                expect(summary).toBeNull();
            });
        });

        it('displays no cart applied coupons when no coupons data is available due to an error', () => {
            cartCouponsAdapter.emit({ error: 'Error' });
            return Promise.resolve().then(() => {
                const summary = <Summary & HTMLElement>querySelector('commerce_unified_coupons-summary');
                expect(summary).toBeNull();
            });
        });
    });

    describe('CartSummaryAdapter', () => {
        beforeEach(() => {
            element.showTermsAndConditions = true;
            element.applyCouponButtonText = 'APPLY';
            element.revealCouponFormButtonText = 'Reveal Coupon';
            element.appliedCouponsFontSize = 'medium';
            element.revealCouponFormButtonFontSize = 'large';
        });

        it('is not displayed when there are no items in the cart and not in previewMode', () => {
            cartSummaryAdapter.emit({
                data: summaryApiData.withoutItems,
                error: undefined,
                loaded: true,
                loading: false,
            });

            return Promise.resolve().then(() => {
                const input = <Summary & HTMLElement>querySelector('commerce_unified_coupons-input-form');
                expect(input).toBeNull();
                const summary = <Summary & HTMLElement>querySelector('commerce_unified_coupons-summary');
                expect(summary).toBeNull();
            });
        });

        it('is displayed when there are no items in the cart and it is in previewMode', () => {
            cartSummaryAdapter.emit({
                data: summaryApiData.withoutItems,
                error: undefined,
                loaded: true,
                loading: false,
            });
            element.cartAppliedCoupons = apiData.withoutCoupons;

            return Promise.resolve().then(() => {
                const input = <Summary & HTMLElement>querySelector('commerce_unified_coupons-input-form');
                expect(input).not.toBeNull();
                //this will still be null, because there are no applied coupons
                const summary = <Summary & HTMLElement>querySelector('commerce_unified_coupons-summary');
                expect(summary).toBeNull();
            });
        });

        it(`displays cart applied coupons when coupons exist`, async () => {
            cartSummaryAdapter.emit({
                data: summaryApiData.withItems,
                error: undefined,
                loaded: true,
                loading: false,
            });
            await Promise.resolve();

            element.cartAppliedCoupons = apiData.withCoupons;
            return Promise.resolve().then(() => {
                const summary = <Summary & HTMLElement>querySelector('commerce_unified_coupons-summary');
                expect(summary.appliedCoupons).toStrictEqual(transformedApiData.withDetails);
            });
        });

        it(`does not display cart applied coupons when no coupons exist`, async () => {
            element.cartAppliedCoupons = apiData.withoutCoupons;
            return Promise.resolve().then(() => {
                const summary = <Summary & HTMLElement>querySelector('commerce_unified_coupons-summary');
                expect(summary).toBeNull();
            });
        });

        it(`calls focus on coupon summary when the couponapplied event is fired`, async () => {
            element.cartAppliedCoupons = apiData.withCoupons;

            cartSummaryAdapter.emit({
                data: summaryApiData.withItems,
                error: undefined,
                loaded: true,
                loading: false,
            });
            await Promise.resolve();

            const inputForm = <HTMLElement & InputForm>element.querySelector('commerce_unified_coupons-input-form');

            return Promise.resolve()
                .then(() => {
                    const summary = <Summary & HTMLElement>querySelector('commerce_unified_coupons-summary');
                    const focusSpy = jest.spyOn(summary, 'focus');

                    inputForm.dispatchEvent(new CustomEvent('couponapplied'));
                    return focusSpy;
                })
                .then((focusSpy) => {
                    cartCouponsAdapter.emit({
                        data: apiData.withCoupons,
                        error: undefined,
                        loaded: true,
                        loading: false,
                    });
                    return focusSpy;
                })
                .then((focusSpy) => {
                    expect(focusSpy).toHaveBeenCalled();
                });
        });
    });
});
