import { createElement } from 'lwc';
import OrderDeliveryGroupDisplay from 'commerce_my_account/orderDeliveryGroupDisplay';
import {
    formattedGroup,
    formattedGroupWithError,
    formattedGroupWithNextPage,
    formattedGroupWithoutItems,
    formattedGroupWithoutShippingFields,
    formattedGroupWithShippingFieldsWithoutDataName,
} from './orderDeliveryGroupDisplayData';

const mockGeneratedUrl = '/b2c/s/detail/0a9000000000001AAA';
jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => mockGeneratedUrl),
    NavigationContext: jest.fn(),
    navigate: jest.fn(),
}));

describe('commerce_my_account/orderDeliveryGroupDisplay', () => {
    let element: HTMLElement & OrderDeliveryGroupDisplay;
    beforeEach(() => {
        element = createElement('commerce_my_account-order-delivery-group-display', {
            is: OrderDeliveryGroupDisplay,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'currencyCode',
            defaultValue: undefined,
            changeValue: 'USD',
        },
        {
            property: 'initialFocusedItemId',
            defaultValue: undefined,
            changeValue: '1234',
        },
        {
            property: 'orderDeliveryGroup',
            defaultValue: undefined,
            changeValue: formattedGroup,
        },
        {
            property: 'productUnavailableMessage',
            defaultValue: undefined,
            changeValue: 'sorry unavailable',
        },
        {
            property: 'showProductImage',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'showTotal',
            defaultValue: false,
            changeValue: true,
        },
        {
            property: 'showMoreProductLabel',
            defaultValue: undefined,
            changeValue: 'Show More',
        },
        {
            property: 'textDisplayInfo',
            defaultValue: undefined,
            changeValue: { headingTag: 'h2', textStyle: 'heading-large' },
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof OrderDeliveryGroupDisplay]).toBe(
                    propertyTest.defaultValue
                );
            });
            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof OrderDeliveryGroupDisplay]).not.toBe(
                    propertyTest.changeValue
                );
                //@ts-ignore
                element[propertyTest.property as keyof OrderDeliveryGroupDisplay] = propertyTest.changeValue;
                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof OrderDeliveryGroupDisplay]).toStrictEqual(
                    propertyTest.changeValue
                );
            });
        });
    });

    describe('accessibility', () => {
        it('is accessible when the component is in a valid state', () => {
            expect.assertions(1);
            element.orderDeliveryGroup = formattedGroup;
            element.isMultipleOrderDeliveryGroups = true;
            element.showProductImage = true;
            element.productUnavailableMessage = 'abc';
            return Promise.resolve().then(async () => {
                await expect(element).toBeAccessible();
            });
        });
        it('is accessible when the component is in an indeterminate state', () => {
            expect.assertions(1);
            element.orderDeliveryGroup = formattedGroupWithoutItems;
            return Promise.resolve().then(async () => {
                await expect(element).toBeAccessible();
            });
        });
    });

    describe('error', () => {
        it('is not displayed when orderDelivery has no error', () => {
            element.orderDeliveryGroup = formattedGroup;
            return Promise.resolve().then(() => {
                const errorElement = element.querySelector('commerce-error');
                expect(errorElement).toBeNull();
            });
        });
        it('is displayed when orderDeliveryGroup has error', () => {
            element.orderDeliveryGroup = formattedGroupWithError;
            return Promise.resolve().then(() => {
                const errorElement = element.querySelector('commerce-error');
                expect(errorElement).not.toBeNull();
            });
        });
    });

    describe('the shipping fields', () => {
        it(`does not show the shipping fields when shippingFields is undefined`, () => {
            element.orderDeliveryGroup = formattedGroupWithoutShippingFields;
            return Promise.resolve().then(() => {
                const shippingFieldsDiv = element.querySelector('.field-properties ');
                expect(shippingFieldsDiv).toBeNull();
            });
        });

        it('shows shipping fields when shipping fields are defined', () => {
            element.orderDeliveryGroup = formattedGroup;
            return Promise.resolve().then(() => {
                const shippingFieldsDiv = element.querySelector('.field-properties ');
                expect(shippingFieldsDiv).not.toBeNull();
                const shippingFieldItems = element.querySelectorAll('.shipping-field-item');
                expect(shippingFieldItems).toHaveLength(<number>formattedGroup.shippingFields?.length);
            });
        });

        it('still shows the shippingFields (but without the label) when the field label is empty', () => {
            element.orderDeliveryGroup = formattedGroupWithShippingFieldsWithoutDataName;
            return Promise.resolve().then(() => {
                const shippingFieldItems = element.querySelectorAll('.shipping-field-item');
                expect(shippingFieldItems).toHaveLength(
                    <number>formattedGroupWithShippingFieldsWithoutDataName.shippingFields?.length
                );
            });
        });
    });

    describe('the Order items list', () => {
        it(`does not show any order item when orderItems is undefined`, () => {
            element.orderDeliveryGroup = formattedGroupWithoutItems;
            return Promise.resolve().then(() => {
                const orderItem = element.querySelector('commerce_my_account-order-item-info');
                expect(orderItem).toBeNull();
            });
        });

        it('shows an order item for each provided orderItem in the array', () => {
            element.orderDeliveryGroup = formattedGroup;
            return Promise.resolve().then(() => {
                const orderItems = element.querySelectorAll('commerce_my_account-order-item-info');
                expect(orderItems).toHaveLength(<number>formattedGroup.orderItems?.length);
            });
        });
    });
    describe('the loading indicator', () => {
        it('is not displayed when there are orderItems', () => {
            element.orderDeliveryGroup = formattedGroup;
            return Promise.resolve().then(() => {
                const loadingSpinner = element.querySelector('lightning-spinner');
                expect(loadingSpinner).toBeNull();
            });
        });

        it('is not displayed when orderDeliveryGroup has error', () => {
            element.orderDeliveryGroup = formattedGroupWithError;
            return Promise.resolve().then(() => {
                const loadingSpinner = element.querySelector('lightning-spinner');
                expect(loadingSpinner).toBeNull();
            });
        });

        it(`is displayed when the orderItems are undefined and orderDeliveryGroup does not have error)`, () => {
            element.orderDeliveryGroup = formattedGroupWithoutItems;
            return Promise.resolve().then(() => {
                const loadingSpinner = element.querySelector('lightning-spinner');
                expect(loadingSpinner).not.toBeNull();
            });
        });
    });

    describe('the show More button', () => {
        it('does not display the "Show More" button when another page of orderItems is not available', () => {
            element.orderDeliveryGroup = formattedGroup;
            return Promise.resolve().then(() => {
                const showMoreButton = element.querySelector('.show-more');
                expect(showMoreButton).toBeNull();
            });
        });
        it('displays the "Show More" button when another page of orderItems is available', () => {
            element.orderDeliveryGroup = formattedGroupWithNextPage;
            return Promise.resolve().then(() => {
                const showMoreButton = element.querySelector('.show-more');
                expect(showMoreButton).not.toBeNull();
            });
        });

        it('emits the "orderdeliverygroupdisplayshowmoreitems" event when the "Show More" button is clicked', () => {
            const showMoreListener = jest.fn();
            element.addEventListener('orderdeliverygroupdisplayshowmoreitems', showMoreListener);
            element.orderDeliveryGroup = formattedGroupWithNextPage;
            return Promise.resolve()
                .then(() => {
                    const showMoreButton: HTMLButtonElement | null = element.querySelector('.show-more');
                    showMoreButton?.click();
                })
                .then(() => {
                    expect(showMoreListener).toHaveBeenCalled();
                });
        });
    });
    describe('focus', () => {
        it('focuses on the order item when focusItemId is populated', () => {
            const focusId = '01txx0000006i7NAAQ';
            element.initialFocusedItemId = focusId;
            element.orderDeliveryGroup = formattedGroup;
            return Promise.resolve().then(() => {
                const focusEle = element.querySelector(`[item-id="${focusId}"]`);
                expect(element.initialFocusedItemId).toBe(focusId);
                expect(focusEle).not.toBeNull();
                expect(document.activeElement).toBe(focusEle);
            });
        });

        it('do not focus on the order item if it is not found', () => {
            //the orderItem associated with this focusId does not exist
            const focusId = '10uxx0000006ia56AAA';
            element.orderDeliveryGroup = formattedGroup;
            element.initialFocusedItemId = focusId;
            return Promise.resolve().then(() => {
                const focusEle = element.querySelector(`[item-id="${focusId}"]`);
                expect(focusEle).toBeNull();
                expect(document.activeElement).not.toBe(focusEle);
            });
        });
    });
});
