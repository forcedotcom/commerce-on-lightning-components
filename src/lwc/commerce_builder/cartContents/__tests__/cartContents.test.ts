import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import type { LightningElement } from 'lwc';
import CartContents from 'commerce_builder/cartContents';
import { sampleCartItemData } from './data/cartItemData';

import * as isPreviewMode from '@app/isPreviewMode';

import type { DataProviderActionEvent } from 'experience/dataProvider';

import { CHANGE_SORT_ORDER_EVENT } from 'commerce_cart/header';
import { CLEAR_CART_EVENT } from 'commerce_cart/footer';

import type { SortOrders } from 'commerce/cartApiInternal';
import type ManagedContents from 'commerce_cart/managedContents';

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(),
    }),
    { virtual: true }
);

jest.mock(
    '@app/isPreviewMode',
    () => ({
        __esModule: true,
        default: false,
    }),
    { virtual: true }
);

const mockIsPreviewMode = isPreviewMode as { default: boolean };

const NavigationMixin = (Base: LightningElement): LightningElement => {
    const GenerateUrl = Symbol('GenerateUrl');
    // @ts-ignore
    return class extends Base {
        [GenerateUrl](_cartId: string): string {
            throw new Error('Imperative use is not supported. Use @wire(adapterId)');
        }
    };
};

jest.mock(
    'lightning/navigation',
    () => ({
        generateUrl: jest.fn(),
        NavigationContext: jest.fn(),
        navigate: jest.fn(),
        CurrentPageReference: mockCreateTestWireAdapter(),
        NavigationMixin: NavigationMixin,
    }),
    { virtual: true }
);

describe('commerce_builder/cartContents', () => {
    let element: HTMLElement & CartContents;

    beforeEach(() => {
        jest.clearAllMocks();

        element = createElement('commerce_builder-cart', {
            is: CartContents,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [undefined, [], sampleCartItemData].forEach((items) => {
        it(`Always shows all sections in preview mode, items length: ${items?.length}`, () => {
            mockIsPreviewMode.default = true;

            // create element in this test so that it gets the correct value of `isPreviewMode`
            element = createElement('commerce_builder-cart', {
                is: CartContents,
            });

            element.items = items;

            document.body.appendChild(element);

            const emptySection = element.querySelector('.empty');
            const itemsSection = element.querySelector('.items');
            const intermediateSection = element.querySelector('.intermediate');

            expect(emptySection).not.toBeNull();
            expect(itemsSection).not.toBeNull();
            expect(intermediateSection).not.toBeNull();
        });
    });

    it(`Only show the empty state if the items length is 0, and not in preview mode.`, () => {
        mockIsPreviewMode.default = false;

        // create element in this test so that it gets the correct value of `isPreviewMode`
        element = createElement('commerce_builder-cart', {
            is: CartContents,
        });
        element.items = [];

        document.body.appendChild(element);

        const emptySection = element.querySelector('.empty');
        const itemsSection = element.querySelector('.items');
        const intermediateSection = element.querySelector('.intermediate');

        expect(emptySection).not.toBeNull();
        expect(itemsSection).toBeNull();
        expect(intermediateSection).toBeNull();
    });

    it(`Only show the intermediate state if the items is undefined, and not in preview mode.`, () => {
        mockIsPreviewMode.default = false;

        // create element in this test so that it gets the correct value of `isPreviewMode`
        element = createElement('commerce_builder-cart', {
            is: CartContents,
        });
        element.items = undefined;

        document.body.appendChild(element);

        const emptySection = element.querySelector('.empty');
        const itemsSection = element.querySelector('.items');
        const intermediateSection = element.querySelector('.intermediate');

        expect(intermediateSection).not.toBeNull();
        expect(emptySection).toBeNull();
        expect(itemsSection).toBeNull();
    });

    it('Only show the items state if the count is greater than zero, and not in preview mode.', () => {
        mockIsPreviewMode.default = false;

        // create element in this test so that it gets the correct value of `isPreviewMode`
        element = createElement('commerce_builder-cart', {
            is: CartContents,
        });
        element.items = sampleCartItemData;

        document.body.appendChild(element);

        const emptySection = element.querySelector('.empty');
        const itemsSection = element.querySelector('.items');
        const intermediateSection = element.querySelector('.intermediate');

        expect(itemsSection).not.toBeNull();
        expect(emptySection).toBeNull();
        expect(intermediateSection).toBeNull();
    });

    it('dispatches DataProviderActionEvent "cart:changeSortOrder" when "cartchangesortorder" is received', async () => {
        const dispatchSpy = jest.spyOn(element, 'dispatchEvent');
        element.items = sampleCartItemData;

        await Promise.resolve();

        let managedContentsElement: (HTMLElement & ManagedContents) | null = element.querySelector(
            'commerce_cart-managed-contents'
        );
        managedContentsElement?.dispatchEvent(
            new CustomEvent(CHANGE_SORT_ORDER_EVENT, {
                detail: 'CreatedDateDesc',
            })
        );

        // Validate DataProviderActionEvent dispatched with appropriate payload
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        const eventDetail = (<DataProviderActionEvent<SortOrders>>dispatchSpy.mock.calls[0][0]).detail;
        expect(eventDetail.payload).toBe('CreatedDateDesc');

        await Promise.resolve();
        managedContentsElement = element.querySelector('commerce_cart-managed-contents');
        expect(managedContentsElement?.sortOrder).toBe('CreatedDateDesc');
    });

    it('shows the spinner when the component loads', () => {
        const spinner = element.querySelector('lightning-spinner');
        expect(spinner).not.toBeNull();
    });

    it('hides and show the spinner when the items are loaded and reloaded', async () => {
        element.items = sampleCartItemData;
        await Promise.resolve();

        let spinner = element.querySelector('lightning-spinner');
        expect(spinner).toBeNull(); //when there are items, the spinner is hidden

        const managedContentsElement: (HTMLElement & ManagedContents) | null = element.querySelector(
            'commerce_cart-managed-contents'
        );
        //this is to set the this.actionProcessing property
        managedContentsElement?.dispatchEvent(
            new CustomEvent('cartactionprocessing', {
                detail: {
                    processing: true,
                },
            })
        );

        element.items = undefined;
        await Promise.resolve();

        spinner = element.querySelector('lightning-spinner');
        expect(spinner).not.toBeNull(); //when items is replaced with undefined, the spinner is hidden again

        element.items = sampleCartItemData; //set the items again, but now the this.actionProcessing is true
        await Promise.resolve();

        spinner = element.querySelector('lightning-spinner');
        expect(spinner).not.toBeNull(); //we should still have the spinner
    });

    describe('"cartactionprocessing" event handler', () => {
        beforeEach(() => {
            element.items = sampleCartItemData;
        });

        [
            {
                processing: true,
                loadingData: undefined,
            },
            {
                processing: true,
                loadingData: true,
            },
            {
                processing: false,
                loadingData: true,
            },
        ].forEach((condition) => {
            it(`shows the spinner when processing: ${condition?.processing} and loadingData: ${condition?.loadingData}`, async () => {
                const managedContentsElement: (HTMLElement & ManagedContents) | null = element.querySelector(
                    'commerce_cart-managed-contents'
                );
                managedContentsElement?.dispatchEvent(
                    new CustomEvent('cartactionprocessing', {
                        detail: condition,
                    })
                );

                await Promise.resolve();

                const spinner = element.querySelector('lightning-spinner');
                expect(spinner).not.toBeNull();
            });
        });

        [
            {
                processing: false,
                loadingData: undefined,
            },
            {
                processing: true,
                loadingData: false,
            },
            {
                processing: false,
                loadingData: false,
            },
        ].forEach((condition) => {
            it(`does NOT show the spinner when processing: ${condition?.processing} and loadingData: ${condition?.loadingData}`, async () => {
                const managedContentsElement: (HTMLElement & ManagedContents) | null = element.querySelector(
                    'commerce_cart-managed-contents'
                );
                managedContentsElement?.dispatchEvent(
                    new CustomEvent('cartactionprocessing', {
                        detail: condition,
                    })
                );

                await Promise.resolve();

                const spinner = element.querySelector('lightning-spinner');
                expect(spinner).toBeNull();
            });
        });
    });

    describe('"cartclear" event handler', () => {
        beforeEach(() => {
            element.items = sampleCartItemData;
        });

        it('dispatches DataProviderActionEvent "cart:clear" when "cartclear" is received', () => {
            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');

            const managedContentsElement: (HTMLElement & ManagedContents) | null = element.querySelector(
                'commerce_cart-managed-contents'
            );
            managedContentsElement?.dispatchEvent(new CustomEvent(CLEAR_CART_EVENT));

            expect(dispatchSpy).toHaveBeenCalledTimes(1);

            const eventDetail = (<DataProviderActionEvent<undefined>>dispatchSpy.mock.calls[0][0]).detail;
            expect(eventDetail.type).toBe('cart:clear');
        });

        it('hides the spinner, when "cartclear" action is resolved', async () => {
            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');

            const managedContentsElement: (HTMLElement & ManagedContents) | null = element.querySelector(
                'commerce_cart-managed-contents'
            );
            managedContentsElement?.dispatchEvent(new CustomEvent(CLEAR_CART_EVENT));
            element.items = undefined;
            await Promise.resolve();

            let spinner = element.querySelector('lightning-spinner');
            expect(spinner).not.toBeNull();
            (<DataProviderActionEvent<undefined>>dispatchSpy.mock.calls[0][0]).detail.options.onSuccess?.(null, true);

            await Promise.resolve();
            spinner = element.querySelector('lightning-spinner');
            expect(spinner).toBeNull();
        });

        it('hides the spinner, when "cartclear" action has error', async () => {
            const dispatchSpy = jest.spyOn(element, 'dispatchEvent');

            const managedContentsElement: (HTMLElement & ManagedContents) | null = element.querySelector(
                'commerce_cart-managed-contents'
            );
            managedContentsElement?.dispatchEvent(new CustomEvent(CLEAR_CART_EVENT));
            element.items = undefined;
            await Promise.resolve();

            let spinner = element.querySelector('lightning-spinner');
            expect(spinner).not.toBeNull();
            (<DataProviderActionEvent<undefined>>dispatchSpy.mock.calls[0][0]).detail.options.onError?.(null, true);

            await Promise.resolve();
            spinner = element.querySelector('lightning-spinner');
            expect(spinner).toBeNull();
        });
    });
});
