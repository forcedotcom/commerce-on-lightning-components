import { createElement } from 'lwc';
import OrderProductsDesignSubstitute from 'commerce_builder/orderProductsDesignSubstitute';
import type { OrderDeliveryGroup } from 'commerce_my_account/orderDeliveryGroupContainer';

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(),
    NavigationContext: jest.fn(),
    navigate: jest.fn(),
}));

const shippingFieldMapping = [
    {
        entity: 'OrderDeliveryMethod',
        name: 'Name',
        label: 'Name',
        type: 'Text(255)',
    },
    {
        entity: 'OrderDeliveryGroupSummary',
        name: 'TotalAmount',
        label: 'Pretax Total',
        type: 'Currency(16, 2)',
    },
    {
        entity: 'OrderDeliveryGroupSummary',
        name: 'SomeRandomField',
        label: 'Pretax Total',
        type: 'Currency(16, 2)',
    },
];

const productFieldMapping = [
    {
        entity: 'OrderItemSummary',
        name: 'AdjustedLineAmount',
        label: 'Adjusted Line Subtotal',
        type: 'Formula (Currency)',
    },
    {
        entity: 'OrderItemSummary',
        name: 'TotalLineAdjustmentAmount',
        label: 'Line Adjustments',
        type: 'Roll-Up Summary ( Order Product Adjustment Line Item Summary)',
    },
];

describe('commerce_builder/orderProductsDesignSubstitute', () => {
    let element: HTMLElement & OrderProductsDesignSubstitute;
    beforeEach(() => {
        jest.clearAllMocks();
        element = createElement('commerce_my_account-order-products-design-substitute', {
            is: OrderProductsDesignSubstitute,
        });

        document.body.appendChild(element);
    });
    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'orderSummaryId',
            defaultValue: undefined,
            changeValue: '123',
        },
        {
            property: 'prefixToShippingGroup',
            defaultValue: '',
            changeValue: 'Ship To',
        },
        {
            property: 'productUnavailableMessage',
            defaultValue: undefined,
            changeValue: 'Unavailable',
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
            property: 'textDisplayInfo',
            defaultValue: undefined,
            changeValue: { headingTag: 'h2', textStyle: 'heading-large' },
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof OrderProductsDesignSubstitute]).toStrictEqual(
                    propertyTest.defaultValue
                );
            });
            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof OrderProductsDesignSubstitute]).not.toBe(
                    propertyTest.changeValue
                );
                //@ts-ignore
                element[propertyTest.property as keyof OrderDeliveryGroup] = propertyTest.changeValue;
                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof OrderProductsDesignSubstitute]).toStrictEqual(
                    propertyTest.changeValue
                );
            });
        });
    });
    describe('accessibility', () => {
        it('is accessible', () => {
            element.orderSummaryId = '123';
            element.shippingGroupFieldMapping = JSON.stringify(shippingFieldMapping);
            element.productFieldMapping = JSON.stringify(productFieldMapping);
            element.showTotal = true;
            element.showProductImage = true;
            element.productUnavailableMessage = 'abc';
            element.totalPriceTextColor = '#FFFF';
            element.adjustmentsAmountTextColor = '#FFFF';
            return Promise.resolve().then(() => expect(element).toBeAccessible());
        });
    });
});
