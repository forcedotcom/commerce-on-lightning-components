import { createElement } from 'lwc';
import OrderLineItemActionContainer from 'commerce_my_account/orderLineItemActionContainer';
import { mockActions } from './data/actions';
import { querySelector } from 'kagekiri';

jest.mock(
    'lightning/navigation',
    () => ({
        generateUrl: jest.fn(() => '/commerce/s/detail/01txx0000006i45AAA'),
        NavigationContext: jest.fn(),
    }),
    { virtual: true }
);

jest.mock('lightning/uiRecordApi', () => ({
    getFieldValue: jest.fn(),
    getRecord: jest.fn(),
}));

describe('commerce_my_account/orderLineItemActionContainer : Order Line Item Action Container', () => {
    let element: HTMLElement & OrderLineItemActionContainer;
    type orderLineActionContainerProperty = 'orderId' | 'actions' | 'detailsLabel';

    beforeEach(() => {
        element = createElement('commerce_my_account-order-line-item-action-container', {
            is: OrderLineItemActionContainer,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'orderId',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'actions',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'detailsLabel',
            defaultValue: undefined,
            changeValue: null,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<orderLineActionContainerProperty>propertyTest.property]).toBe(
                    propertyTest.defaultValue
                );
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<orderLineActionContainerProperty>propertyTest.property]).not.toBe(
                    propertyTest.changeValue
                );

                // Change the value.
                element[<orderLineActionContainerProperty>propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[<orderLineActionContainerProperty>propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('displays view details, if text for view more detail is avilable along with order id', async () => {
        element.orderId = '1Osxx0000006i45AAA';
        element.detailsLabel = 'view details';
        await Promise.resolve();
        const viewDetailLink = querySelector('commerce_my_account-record-link');
        expect(viewDetailLink).toBeTruthy();
    });

    [null, undefined, ''].forEach((detailsLabel) => {
        it(`doesn't display view details, if text for view more detail is ${detailsLabel}`, async () => {
            element.detailsLabel = detailsLabel;
            element.orderId = '1Osxx0000006i45AAA';
            await Promise.resolve();
            const recordLink = querySelector('commerce_my_account-record-link');
            expect(recordLink).toBeNull();
        });
    });

    [null, undefined, ''].forEach((orderId) => {
        it(`doesn't displays view details, if text for view more detail is present but order id is ${orderId}`, async () => {
            element.orderId = orderId;
            element.detailsLabel = 'view details';
            await Promise.resolve();
            const viewDetailLink = querySelector('commerce_my_account-record-link');
            expect(viewDetailLink).toBeNull();
        });
    });

    it('triggers the event containing orderId when event actionselected is received', async () => {
        element.actions = mockActions;
        element.orderId = '1Osxx0000006i45AAA';
        const actionListener = jest.fn();
        element.addEventListener(mockActions[0].eventName, actionListener);
        await Promise.resolve();
        querySelector('commerce_my_account-order-line-item-actions')?.dispatchEvent(
            new CustomEvent('actionselected', {
                detail: {
                    name: mockActions[0].eventName,
                },
            })
        );
        expect(actionListener).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: {
                    orderId: '1Osxx0000006i45AAA',
                },
            })
        );
    });
});
