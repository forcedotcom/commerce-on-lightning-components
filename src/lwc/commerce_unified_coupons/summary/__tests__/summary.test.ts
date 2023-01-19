import { createElement } from 'lwc';
import Summary from 'commerce_unified_coupons/summary';
import { transformedApiData } from './data/appliedCouponsData';
import { deleteCouponFromCart } from 'commerce/cartApi';

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(() => Promise.resolve()),
    }),
    { virtual: true }
);

jest.mock(
    'commerce/cartApiInternal',
    () => ({
        cartSummaryChanged: jest.fn().mockResolvedValue({}),
        deleteCouponFromCart: jest.fn().mockResolvedValue({}),
    }),
    { virtual: true }
);

describe('commerce_unified_coupons/summary: Applied Coupons Summary', () => {
    let element: Summary & HTMLElement;

    type appliedCouponsSummary = 'appliedCoupons' | 'termsAndConditionsHeaderText';

    beforeEach(() => {
        element = createElement('commerce_unified_coupons-summary', {
            is: Summary,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.body.removeChild(element);
    });

    describe.each`
        property                          | defaultValue | changeValue
        ${'appliedCoupons'}               | ${undefined} | ${null}
        ${'termsAndConditionsHeaderText'} | ${undefined} | ${''}
    `('the $property property', ({ property, defaultValue, changeValue }) => {
        it(`defaults to ${defaultValue}`, () => {
            expect(element[<appliedCouponsSummary>property]).toBe(defaultValue);
        });

        it('reflects a changed value', () => {
            expect(element[<appliedCouponsSummary>property]).not.toBe(changeValue);
            // eslint-disable-next-line
            (element as any)[<appliedCouponsSummary>property] = changeValue;
            expect(element[<appliedCouponsSummary>property]).toBe(changeValue);
        });
    });

    // Tests for the applied coupon component
    describe('the applied coupons summary component', () => {
        beforeEach(() => {
            // Set up DOM to be tested
            element.termsAndConditionsHeaderText = 'Terms and Conditions';
        });

        it('is accessible when showing applied coupons', () => {
            // Assert that the element is accessible
            return Promise.resolve().then(async () => {
                await expect(element).toBeAccessible();
            });
        });

        it('displays an entry for each applied coupon item', () => {
            element.appliedCoupons = transformedApiData.withDetails;
            return Promise.resolve().then(() => {
                const appliedCouponItemElements = <HTMLElement>(<unknown>element.querySelectorAll('dl'));
                expect(appliedCouponItemElements).toHaveLength(transformedApiData.withDetails.length);
            });
        });

        it('displays no entries when no coupons are provided', () => {
            element.appliedCoupons = transformedApiData.withoutDetails;
            element.termsAndConditionsHeaderText = 'Terms and Conditions';
            return Promise.resolve().then(() => {
                const appliedCouponItemElements = <HTMLElement>(<unknown>element.querySelectorAll('dl'));
                expect(appliedCouponItemElements).toHaveLength(0);
            });
        });

        it('displays the terms and conditions info icon when the text content is provided', () => {
            element.appliedCoupons = transformedApiData.withDetails;
            return Promise.resolve().then(() => {
                const termsAndConditions = <HTMLElement>(
                    element.querySelector('b2b_buyer_promotions-terms-and-conditions-popover')
                );
                expect(termsAndConditions).toBeTruthy();
            });
        });
    });

    describe('handleDeleteCoupon()', () => {
        it('calls deleteCouponFromCart with the couponId when the remove coupon button clicked', () => {
            element.appliedCoupons = transformedApiData.withDetails;
            return Promise.resolve()
                .then(() => {
                    const button = <HTMLButtonElement>element.querySelector('dd lightning-button-icon');
                    button.click();
                })
                .then(() => {
                    expect(deleteCouponFromCart).toHaveBeenCalledWith('xxxxx0000000001');
                });
        });
    });

    it('focuses on the remove button of the last coupon when the remove coupon button clicked', () => {
        element.appliedCoupons = transformedApiData.withMultipleDetails;
        let buttons: HTMLButtonElement[];
        return Promise.resolve()
            .then(() => {
                // @ts-ignore
                buttons = <NodeListOf<HTMLButtonElement>>element.querySelectorAll('dd lightning-button-icon');
                jest.spyOn(buttons[buttons.length - 1], 'focus');
                buttons[0].click();
            })
            .then(() => {
                element.appliedCoupons = transformedApiData.withMultipleDetails.slice(1);
            })
            .then(() => {
                expect(buttons[buttons.length - 1].focus).toHaveBeenCalled();
            });
    });

    it('focuses on the remove button of the first coupon when focus() is called', () => {
        element.appliedCoupons = transformedApiData.withMultipleDetails;
        let button: HTMLButtonElement;
        return Promise.resolve()
            .then(() => {
                button = <HTMLButtonElement>element.querySelector('lightning-button-icon');
                jest.spyOn(button, 'focus');
                element.focus();
            })
            .then(() => {
                expect(button.focus).toHaveBeenCalled();
            });
    });

    it('throws no errors when focus() is called with no coupons available', () => {
        element.appliedCoupons = transformedApiData.withoutDetails;
        return Promise.resolve().then(() => {
            expect(() => {
                element.focus();
            }).not.toThrow();
        });
    });
});
