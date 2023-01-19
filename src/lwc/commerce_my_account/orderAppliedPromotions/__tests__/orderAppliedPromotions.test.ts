import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import type { TestWireAdapter } from 'types/testing';
import OrderAppliedPromotions from 'commerce_my_account/orderAppliedPromotions';
import type Summary from 'commerce_unified_promotions/summary';

import { OrderAdjustmentsAdapter } from 'commerce/orderApi';

import { adjustments } from './data/adjustments';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });
jest.mock('commerce/orderApi', () =>
    Object.assign({}, jest.requireActual('commerce/orderApi'), {
        OrderAdjustmentsAdapter: mockCreateTestWireAdapter(),
    })
);

describe('commerce_my_account-order-applied-promotions', () => {
    let element: Element & OrderAppliedPromotions;
    beforeEach(() => {
        element = createElement('commerce_my_account-order-applied-promotions', {
            is: OrderAppliedPromotions,
        });

        element.orderSummaryId = '1Osxx0000004CLwCAM';
        document.body.appendChild(element);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.restoreAllMocks();
    });

    it('Test commerce_unified_promotions-summary visibility', async () => {
        (<typeof OrderAdjustmentsAdapter & typeof TestWireAdapter>OrderAdjustmentsAdapter).emit({
            data: adjustments,
        });

        await Promise.resolve();

        let buyerPromoSummaryEle: (HTMLElement & Summary) | null = element.querySelector(
            'commerce_unified_promotions-summary'
        );
        expect(buyerPromoSummaryEle).not.toBeNull();

        (<typeof OrderAdjustmentsAdapter & typeof TestWireAdapter>OrderAdjustmentsAdapter).emit({
            data: {
                adjustments: [],
            },
        });

        await Promise.resolve();

        buyerPromoSummaryEle = (<HTMLElement & OrderAppliedPromotions>element).querySelector(
            'commerce_unified_promotions-summary'
        );
        expect(buyerPromoSummaryEle).toBeNull();
    });

    it('Test default-styles', async () => {
        (<typeof OrderAdjustmentsAdapter & typeof TestWireAdapter>OrderAdjustmentsAdapter).emit({
            data: adjustments,
        });

        await Promise.resolve();

        const buyerPromoSummaryEle: (HTMLElement & Summary) | null = element.querySelector(
            'commerce_unified_promotions-summary'
        );
        expect(buyerPromoSummaryEle).not.toBeNull();

        expect(buyerPromoSummaryEle?.style.cssText).toBe('--com-c-cart-applied-promotions-border-radius: 0px;');
    });

    it('Test custom-styles', async () => {
        (<typeof OrderAdjustmentsAdapter & typeof TestWireAdapter>OrderAdjustmentsAdapter).emit({
            data: adjustments,
        });

        await Promise.resolve();

        const buyerPromoSummaryEle: (HTMLElement & Summary) | null = element.querySelector(
            'commerce_unified_promotions-summary'
        );
        expect(buyerPromoSummaryEle).not.toBeNull();

        element.backgroundColor = '#000000';
        element.borderColor = '#0000FF';
        element.borderRadius = 10;
        element.textColor = '#00FF00';
        element.amountTextColor = '#FF0000';

        await Promise.resolve();

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
        (<typeof OrderAdjustmentsAdapter & typeof TestWireAdapter>OrderAdjustmentsAdapter).emit({
            data: adjustments,
        });

        await Promise.resolve();

        const buyerPromoSummaryEle: (HTMLElement & Summary) | null = element.querySelector(
            'commerce_unified_promotions-summary'
        );
        expect(buyerPromoSummaryEle).not.toBeNull();

        expect(buyerPromoSummaryEle?.appliedPromotions?.length).toBe(2);
    });

    it('Test applied-promotions - error', async () => {
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

        (<typeof OrderAdjustmentsAdapter & typeof TestWireAdapter>OrderAdjustmentsAdapter).emit({
            error: 'TEST ERROR',
        });

        await Promise.resolve();

        const buyerPromoSummaryEle: (HTMLElement & Summary) | null = element.querySelector(
            'commerce_unified_promotions-summary'
        );
        expect(buyerPromoSummaryEle).toBeNull();

        expect((<jest.Mock>consoleErrorMock).mock.calls[0][0]).toEqual({
            code: 'TEST ERROR',
            message: 'B2B_Buyer_Orders.genericErrorMessage',
        });
        consoleErrorMock.mockRestore();
        expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('Test header-text', async () => {
        (<typeof OrderAdjustmentsAdapter & typeof TestWireAdapter>OrderAdjustmentsAdapter).emit({
            data: adjustments,
        });

        await Promise.resolve();

        const buyerPromoSummaryEle: (HTMLElement & Summary) | null = element.querySelector(
            'commerce_unified_promotions-summary'
        );
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
        (<typeof OrderAdjustmentsAdapter & typeof TestWireAdapter>OrderAdjustmentsAdapter).emit({
            data: adjustments,
        });

        await Promise.resolve();

        let buyerPromoSummaryEle: (HTMLElement & Summary) | null = element.querySelector(
            'commerce_unified_promotions-summary'
        );
        expect(buyerPromoSummaryEle).not.toBeNull();

        expect(buyerPromoSummaryEle?.currencyCode).toBe('USD');
        const diffCurrencyAdj = {
            adjustments: [
                {
                    type: 'Promotion',
                    displayName: '55% off on coffee equipments',
                    amount: '-95',
                    currencyIsoCode: 'CAD',
                },
                ...adjustments.adjustments,
            ],
        };
        (<typeof OrderAdjustmentsAdapter & typeof TestWireAdapter>OrderAdjustmentsAdapter).emit({
            data: diffCurrencyAdj,
        });

        await Promise.resolve();

        buyerPromoSummaryEle = (<HTMLElement & OrderAppliedPromotions>element).querySelector(
            'commerce_unified_promotions-summary'
        );
        expect(buyerPromoSummaryEle?.currencyCode).toBe('CAD');
    });
});
