import { createElement } from 'lwc';
import OrderAppliedPromotionsDesignSubstitute from 'commerce_builder/orderAppliedPromotionsDesignSubstitute';
import type Summary from 'commerce_unified_promotions/summary';

jest.mock(
    'transport',
    () => {
        return {
            fetch: jest.fn(() => {
                return Promise.resolve();
            }),
        };
    },
    { virtual: true }
);

describe('commerce_my_account-order-applied-promotions-design-substitute', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('Test commerce_unified_promotions-summary visibility', async () => {
        const element: Element = createElement('commerce_my_account-order-applied-promotions-design-substitute', {
            is: OrderAppliedPromotionsDesignSubstitute,
        });

        document.body.appendChild(element);

        await Promise.resolve();

        const buyerPromoSummaryEle = (<HTMLElement & Summary>element).querySelector(
            'commerce_unified_promotions-summary'
        );
        expect(buyerPromoSummaryEle).not.toBeNull();

        await Promise.resolve();
    });

    it('Test default-styles', async () => {
        const element: HTMLElement & OrderAppliedPromotionsDesignSubstitute = createElement(
            'commerce_my_account-order-applied-promotions-design-substitute',
            {
                is: OrderAppliedPromotionsDesignSubstitute,
            }
        );
        document.body.appendChild(element);

        await Promise.resolve();

        const buyerPromoSummaryEle: (HTMLElement & Summary) | null = (<HTMLElement & Summary>(
            (<unknown>element)
        )).querySelector('commerce_unified_promotions-summary');
        expect(buyerPromoSummaryEle).not.toBeNull();

        expect(buyerPromoSummaryEle?.style.cssText).toBe('--com-c-cart-applied-promotions-border-radius: 0px;');
    });

    it('Test custom-styles', async () => {
        const element: HTMLElement & OrderAppliedPromotionsDesignSubstitute = createElement(
            'commerce_my_account-order-applied-promotions-design-substitute',
            {
                is: OrderAppliedPromotionsDesignSubstitute,
            }
        );
        document.body.appendChild(element);

        await Promise.resolve();

        let buyerPromoSummaryEle: (HTMLElement & Summary) | null = (<HTMLElement & Summary>(
            (<unknown>element)
        )).querySelector('commerce_unified_promotions-summary');
        expect(buyerPromoSummaryEle).not.toBeNull();

        element.backgroundColor = '#000000';
        element.borderColor = '#0000FF';
        element.borderRadius = 10;
        element.textColor = '#00FF00';
        element.amountTextColor = '#FF0000';

        await Promise.resolve();

        buyerPromoSummaryEle = (<HTMLElement & Summary>(<unknown>element)).querySelector(
            'commerce_unified_promotions-summary'
        );

        expect(buyerPromoSummaryEle?.style.cssText).toBe(
            '--com-c-cart-applied-promotions-background-color: #000000; ' +
                '--com-c-cart-applied-promotions-font-color: #00FF00; ' +
                '--com-c-cart-applied-promotions-heading-font-color: #00FF00; ' +
                '--com-c-cart-discount-amount-font-color: #FF0000; ' +
                '--com-c-cart-applied-promotions-border-color: #0000FF; ' +
                '--com-c-cart-applied-promotions-border-radius: 10px;'
        );
    });

    it('Test applied-promotions', async () => {
        const element: HTMLElement & OrderAppliedPromotionsDesignSubstitute = createElement(
            'commerce_my_account-order-applied-promotions-design-substitute',
            {
                is: OrderAppliedPromotionsDesignSubstitute,
            }
        );
        document.body.appendChild(element);

        await Promise.resolve();

        const buyerPromoSummaryEle: (HTMLElement & Summary) | null = (<HTMLElement & Summary>(
            (<unknown>element)
        )).querySelector('commerce_unified_promotions-summary');
        expect(buyerPromoSummaryEle).not.toBeNull();

        expect(buyerPromoSummaryEle?.appliedPromotions?.length).toBe(3);
    });

    it('Test header-text', async () => {
        const element: HTMLElement & OrderAppliedPromotionsDesignSubstitute = createElement(
            'commerce_my_account-order-applied-promotions-design-substitute',
            {
                is: OrderAppliedPromotionsDesignSubstitute,
            }
        );
        document.body.appendChild(element);

        await Promise.resolve();

        const buyerPromoSummaryEle: (HTMLElement & Summary) | null = (<HTMLElement & Summary>(
            (<unknown>element)
        )).querySelector('commerce_unified_promotions-summary');
        expect(buyerPromoSummaryEle).not.toBeNull();

        expect(buyerPromoSummaryEle?.headerText).toBeUndefined();

        element.promotionTitle = 'Applied Promotions';

        await Promise.resolve();
        expect(buyerPromoSummaryEle?.headerText).toBe('Applied Promotions');

        element.promotionTitle = '';

        await Promise.resolve();
        expect(buyerPromoSummaryEle?.headerText).toBe('');
    });

    it('Test currency-code', async () => {
        const element: HTMLElement & OrderAppliedPromotionsDesignSubstitute = createElement(
            'commerce_my_account-order-applied-promotions-design-substitute',
            {
                is: OrderAppliedPromotionsDesignSubstitute,
            }
        );
        document.body.appendChild(element);

        await Promise.resolve();

        let buyerPromoSummaryEle: (HTMLElement & Summary) | null = (<HTMLElement & Summary>(
            (<unknown>element)
        )).querySelector('commerce_unified_promotions-summary');
        expect(buyerPromoSummaryEle).not.toBeNull();
        expect(buyerPromoSummaryEle?.currencyCode).toBe('USD');

        await Promise.resolve();

        buyerPromoSummaryEle = (<HTMLElement>element).querySelector('commerce_unified_promotions-summary');
        expect(buyerPromoSummaryEle?.currencyCode).toBe('USD');
    });
});
