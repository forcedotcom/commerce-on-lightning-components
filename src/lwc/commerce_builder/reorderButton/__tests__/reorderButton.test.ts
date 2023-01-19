import type { TestWireAdapter } from 'types/testing';
import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import ReorderButton, { MODAL_SIZE } from '../reorderButton';
import { generateUrl, NavigationContext } from 'lightning/navigation';
import { navigate } from 'lightning/navigation';
import ReorderModal from 'commerce_my_account/reorderModal';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => 'current_cart'),
    NavigationContext: mockCreateTestWireAdapter(),
    navigate: jest.fn(),
    CurrentPageReference: mockCreateTestWireAdapter(),
}));

let reorderMockOpenViewCart: () => void;
jest.mock('commerce_my_account/reorderModal', () => ({
    open: jest.fn(({ onviewcart }) => {
        reorderMockOpenViewCart = onviewcart;
    }),
    onviewcart: jest.fn(),
}));

describe('commerce_builder/reorderButton', () => {
    let element: HTMLElement & ReorderButton;

    beforeEach(async () => {
        element = createElement('commerce_builder-reorder-button', {
            is: ReorderButton,
        });

        (<typeof NavigationContext & typeof TestWireAdapter>NavigationContext).emit({
            test: 'test',
        });

        document.body.appendChild(element);
        await Promise.resolve();
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    [
        {
            property: 'orderSummaryId',
            defaultValue: undefined,
            changeValue: '123',
        },
        {
            property: 'cartUrl',
            defaultValue: undefined,
            changeValue: 'testUrl',
        },
        {
            property: 'variant',
            defaultValue: undefined,
            changeValue: 'primary',
        },
        {
            property: 'size',
            defaultValue: undefined,
            changeValue: 'large',
        },
        {
            property: 'width',
            defaultValue: undefined,
            changeValue: 'stretch',
        },
        {
            property: 'alignment',
            defaultValue: undefined,
            changeValue: 'left',
        },
        {
            property: 'buttonText',
            defaultValue: undefined,
            changeValue: 'Reorder',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof ReorderButton]).toStrictEqual(propertyTest.defaultValue);
            });
            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof ReorderButton]).not.toBe(propertyTest.changeValue);
                //@ts-ignore
                element[propertyTest.property as keyof ReorderButton] = propertyTest.changeValue;
                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof ReorderButton]).toStrictEqual(propertyTest.changeValue);
            });
        });
    });

    it('should generate cart url', () => {
        expect(generateUrl).toHaveBeenCalledWith(
            {
                test: 'test',
            },
            {
                type: 'comm__namedPage',
                attributes: {
                    name: 'Current_Cart',
                },
            }
        );
    });

    it('navigates to the cart page if the buyer triggers the `viewcart` event from the reorder modal', () => {
        const reorderButton = element.querySelector('commerce_my_account-reorder-button');
        reorderButton?.dispatchEvent(new CustomEvent('reorder'));

        expect(ReorderModal.open).toHaveBeenCalledTimes(1);
        expect(ReorderModal.open).toHaveBeenCalledWith(
            expect.objectContaining({
                size: MODAL_SIZE,
                cartUrl: 'current_cart',
                orderSummaryId: element.orderSummaryId,
                onviewcart: reorderMockOpenViewCart,
            })
        );

        expect(reorderMockOpenViewCart).toBeDefined();
        reorderMockOpenViewCart();
        expect(navigate).toHaveBeenCalled();
    });
});
