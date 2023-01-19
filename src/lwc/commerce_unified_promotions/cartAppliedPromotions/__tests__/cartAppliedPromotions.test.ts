import { createElement } from 'lwc';
import type { TestWireAdapter } from 'types/testing';
// @ts-ignore
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import MatchMediaMock from 'jest-matchmedia-mock';
import type { CommerceError } from 'commerce/cartApi';
import { CartPromotionsAdapter } from 'commerce/cartApi';
import CartAppliedPromotions from 'commerce_unified_promotions/cartAppliedPromotions';
import type Summary from 'commerce_unified_promotions/summary';
import { querySelector } from 'kagekiri';
import { apiData, transformedApiData } from './data/cartAppliedPromotions';
import { registerSa11yMatcher } from '@sa11y/jest';

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(() => Promise.resolve()),
    }),
    { virtual: true }
);

jest.mock('commerce/cartApi', () =>
    Object.assign({}, jest.requireActual('commerce/cartApi'), {
        CartPromotionsAdapter: mockCreateTestWireAdapter(),
    })
);

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

jest.mock(
    '@salesforce/label/Commerce_Cart_Error_Messages.getCartItemPromotionInsufficientAccessErrorMessage',
    () => {
        return {
            default: 'Insufficient Access.',
        };
    },
    { virtual: true }
);
// The mockFn is needed to test whether Toast.show was called, simply spying on Toast.show does not work
const mockTestFn = jest.fn();
jest.mock('lightning/toast', () => ({
    show: jest.fn((param) => mockTestFn(param)),
}));
const cartPromotionAdapter = <typeof CartPromotionsAdapter & typeof TestWireAdapter>CartPromotionsAdapter;

/**
 * Error code returned for an empty cart.
 */
const MISSING_RECORD = 'MISSING_RECORD';

describe('commerce_unified_promotions/CartAppliedPromotions: Cart Applied Promotions', () => {
    let element: CartAppliedPromotions & HTMLElement;
    let matchMedia: MatchMediaMock;

    type appliedPromotions =
        | 'appliedPromotionsTitleText'
        | 'termsAndConditionsTitleText'
        | 'showDiscountAmount'
        | 'showTermsAndConditions'
        | 'cartAppliedPromotions'
        | 'backgroundColor'
        | 'appliedPromotionsTitleTextColor'
        | 'appliedPromotionsTitleFontSize'
        | 'appliedPromotionsTextColor'
        | 'discountAmountTextColor'
        | 'appliedPromotionsFontSize';

    beforeAll(() => {
        registerSa11yMatcher();
        matchMedia = new MatchMediaMock();
    });

    afterAll(() => {
        matchMedia.destroy();
    });

    beforeEach(() => {
        element = createElement('commerce_unified_promotions-cart-applied-promotions', {
            is: CartAppliedPromotions,
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
        ${'cartAppliedPromotions'}           | ${undefined} | ${null}
        ${'backgroundColor'}                 | ${undefined} | ${''}
        ${'appliedPromotionsTitleTextColor'} | ${undefined} | ${''}
        ${'appliedPromotionsTitleFontSize'}  | ${undefined} | ${'small'}
        ${'appliedPromotionsTextColor'}      | ${undefined} | ${''}
        ${'discountAmountTextColor'}         | ${undefined} | ${''}
        ${'appliedPromotionsFontSize'}       | ${undefined} | ${'small'}
    `('the $property property', ({ property, defaultValue, changeValue }) => {
        it(`defaults to ${defaultValue}`, () => {
            expect(element[<appliedPromotions>property]).toBe(defaultValue);
        });

        it('reflects a changed value', () => {
            expect(element[<appliedPromotions>property]).not.toBe(changeValue);
            // eslint-disable-next-line
            (element as any)[<appliedPromotions>property] = changeValue;
            expect(element[<appliedPromotions>property]).toBe(changeValue);
        });
    });

    describe('a11y', () => {
        it('should fulfill accessibility standards', async () => {
            element.appliedPromotionsTitleText = 'Applied Promotions';
            element.termsAndConditionsTitleText = 'Terms & Condtions';
            element.appliedPromotionsFontSize = 'large';
            element.appliedPromotionsTitleFontSize = 'medium';
            cartPromotionAdapter.emit({ data: apiData.withPromotions });
            await Promise.resolve();
            return Promise.resolve().then(() => expect(element).toBeAccessible());
        });
    });

    describe(`'cartAppliedPromotions'`, () => {
        it(`displays the cart applied promotions when promotions exist`, async () => {
            element.appliedPromotionsTitleText = 'Applied Promotions';
            element.termsAndConditionsTitleText = 'Terms & Condtions';
            element.showDiscountAmount = true;
            element.showTermsAndConditions = true;
            element.cartAppliedPromotions = apiData.withPromotions;
            return Promise.resolve().then(() => {
                const summary = <Summary & HTMLElement>querySelector('commerce_unified_promotions-summary');
                expect(summary.appliedPromotions).toStrictEqual(transformedApiData.withDetails);
            });
        });

        it(`does not displays the cart applied promotions when no promotions exist`, async () => {
            element.appliedPromotionsTitleText = 'Applied Promotions';
            element.termsAndConditionsTitleText = 'Terms & Condtions';
            element.showDiscountAmount = true;
            element.showTermsAndConditions = true;
            element.cartAppliedPromotions = apiData.withOutPromotions;
            return Promise.resolve().then(() => {
                const summary = <Summary & HTMLElement>querySelector('commerce_unified_promotions-summary');
                expect(summary).toBeNull();
            });
        });
    });

    describe('CartPromotionsAdapter', () => {
        beforeEach(() => {
            element.showDiscountAmount = true;
            element.showTermsAndConditions = true;
        });

        it('displays the cart applied promotions when promotions are available', () => {
            cartPromotionAdapter.emit({
                data: apiData.withPromotions,
                error: undefined,
                loaded: true,
                loading: false,
            });
            return Promise.resolve().then(() => {
                const summary = <Summary & HTMLElement>querySelector('commerce_unified_promotions-summary');
                expect(summary.appliedPromotions).toStrictEqual(transformedApiData.withDetails);
            });
        });

        it('displays no cart applied promotions when no promotions data is available', () => {
            cartPromotionAdapter.emit({
                data: apiData.withOutPromotions,
                error: undefined,
                loaded: true,
                loading: false,
            });
            return Promise.resolve().then(() => {
                const summary = <Summary & HTMLElement>querySelector('commerce_unified_promotions-summary');
                expect(summary).toBeNull();
            });
        });

        it('displays no cart applied promotions when no promotions data is available due to an error and displays error in a toast notification', () => {
            cartPromotionAdapter.emit({
                error: <CommerceError>{ code: 'INSUFFICIENT_ACCESS' },
            });

            return Promise.resolve().then(() => {
                const summary = <Summary & HTMLElement>querySelector('commerce_unified_promotions-summary');
                expect(summary).toBeNull();
                expect(mockTestFn).toHaveBeenCalledWith({ label: 'Insufficient Access.', variant: 'error' });
            });
        });

        it('toast notification should not be displayed on error if the user is in builder with cartAppliedPromotions having mock data', () => {
            element.cartAppliedPromotions = apiData.withOutPromotions;
            cartPromotionAdapter.emit({
                error: <CommerceError>{ code: 'INSUFFICIENT_ACCESS' },
            });

            return Promise.resolve().then(() => {
                const summary = <Summary & HTMLElement>querySelector('commerce_unified_promotions-summary');
                expect(summary).toBeNull();
                expect(mockTestFn).not.toHaveBeenCalled();
            });
        });

        it(`toast notification of type error is not display when cart is empty`, async () => {
            cartPromotionAdapter.emit({
                data: undefined,
                error: <CommerceError>{ code: MISSING_RECORD },
                loaded: true,
                loading: false,
            });

            await Promise.resolve();
            expect(mockTestFn).not.toHaveBeenCalled();
        });
    });
});
