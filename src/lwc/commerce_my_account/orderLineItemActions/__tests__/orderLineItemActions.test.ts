import { createElement } from 'lwc';
import OrderLineItemActions from 'commerce_my_account/orderLineItemActions';
import { mockActions } from './data/actions';
import { querySelector } from 'kagekiri';

jest.mock('lightning/uiRecordApi', () => ({
    getFieldValue: jest.fn(),
    getRecord: jest.fn(),
}));

jest.mock(
    'lightning/navigation',
    () => ({
        generateUrl: jest.fn(() => ''),
        NavigationContext: jest.fn(),
    }),
    { virtual: true }
);

describe('commerce_my_account/orderLineItemActions : Order Line Item Actions', () => {
    let element: HTMLElement & OrderLineItemActions;
    type orderLineActionProperty = 'actions';

    beforeEach(() => {
        element = createElement('commerce_my_account-order-line-item-actions', {
            is: OrderLineItemActions,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'actions',
            defaultValue: undefined,
            changeValue: mockActions,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<orderLineActionProperty>propertyTest.property]).toStrictEqual(
                    propertyTest.defaultValue
                );
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<orderLineActionProperty>propertyTest.property]).not.toStrictEqual(
                    propertyTest.changeValue
                );

                // Change the value.
                element[<orderLineActionProperty>propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[<orderLineActionProperty>propertyTest.property]).toStrictEqual(propertyTest.changeValue);
            });
        });
    });

    it('is accessible', async () => {
        element.actions = mockActions;
        await Promise.resolve();
        await expect(element).toBeAccessible();
    });

    it('triggers the event containing recordId when button is clicked', async () => {
        element.actions = mockActions;
        const actionListener = jest.fn();
        element.addEventListener('actionselected', actionListener);
        await Promise.resolve();
        (<HTMLButtonElement | null>querySelector('button'))?.click();
        expect(actionListener).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: {
                    name: mockActions[0].eventName,
                },
            })
        );
    });
});
