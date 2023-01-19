import { createElement } from 'lwc';
import PricingTiers from '../pricingTiers';

const adjustmentTiersSingleTierPercent = [
    {
        adjustmentValueFormat: 'percent-fixed',
        adjustmentValue: '5',
        id: '84Yxx0000004CFUEA2',
        tierUnitPrice: '100',
        lowerBound: '1',
        upperBound: '10',
    },
];

const adjustmentTiersSingleTierCurrency = [
    {
        adjustmentValueFormat: 'currency',
        adjustmentValue: '150',
        id: '84Yxx0000004CFUEA2',
        tierUnitPrice: '100',
        lowerBound: '1',
        upperBound: '10',
    },
];

const adjustmentTiersMultipleTiersCurrency = [
    {
        adjustmentValueFormat: 'currency',
        adjustmentValue: '150',
        id: '84Yxx0000004CFUEA2',
        tierUnitPrice: '100',
        lowerBound: '1',
        upperBound: '10',
    },
    {
        adjustmentValueFormat: 'currency',
        adjustmentValue: '175',
        id: '84Yxx0000004CFUEA3',
        tierUnitPrice: '90',
        lowerBound: '11',
        upperBound: '20',
    },
    {
        adjustmentValueFormat: 'currency',
        adjustmentValue: '200',
        id: '84Yxx0000004CFUEA4',
        tierUnitPrice: '80',
        lowerBound: '21',
        upperBound: '30',
    },
    {
        adjustmentValueFormat: 'currency',
        adjustmentValue: '225',
        id: '84Yxx0000004CFUEA5',
        tierUnitPrice: '75',
        lowerBound: '31',
        upperBound: '40',
    },
    {
        adjustmentValueFormat: 'currency',
        adjustmentValue: '250',
        id: '84Yxx0000004CFUEA6',
        tierUnitPrice: '70',
        lowerBound: '41',
        upperBound: '50',
    },
];

describe('commerce_product_details/pricing-tiers: Price Adjustment Information', () => {
    let element: HTMLElement & PricingTiers;
    beforeEach(() => {
        element = createElement('commerce_product_details-pricing-tiers', {
            is: PricingTiers,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'adjustmentTiers',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'currencyCode',
            defaultValue: undefined,
            changeValue: 'USD',
        },
        {
            property: 'customStyles',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'titleText',
            defaultValue: undefined,
            changeValue: 'Tiers of Joy!',
        },
        {
            property: 'quantityRowLabel',
            defaultValue: undefined,
            changeValue: 'Quantity Amount',
        },
        {
            property: 'discountRowLabel',
            defaultValue: undefined,
            changeValue: 'Per Unit Discount',
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof PricingTiers]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof PricingTiers]).not.toBe(propertyTest.changeValue);

                // Change the value.
                // @ts-ignore: "No index signature with a parameter of type 'string' was found on type 'HTMLElement & PricingTiers'"
                element[propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                // @ts-ignore: "No index signature with a parameter of type 'string' was found on type 'HTMLElement & PricingTiers'"
                expect(element[propertyTest.property]).toBe(propertyTest.changeValue);
            });
        });

        it('is accessible', async () => {
            element.adjustmentTiers = adjustmentTiersSingleTierCurrency;
            element.currencyCode = 'USD';

            await Promise.resolve();
            await expect(element).toBeAccessible();
        });
    });

    [null, undefined, []].forEach((notShownState) => {
        it(`displays no tiers when no tiers are specified (${JSON.stringify(notShownState)})`, () => {
            element.adjustmentTiers = notShownState;
            element.currencyCode = 'USD';
            return Promise.resolve().then(() => {
                const priceAdjustmentTiers = element.querySelectorAll('.tier');
                expect(priceAdjustmentTiers).toHaveLength(0);
            });
        });
    });

    describe('displays an entry for', () => {
        it('a single tier', () => {
            element.adjustmentTiers = adjustmentTiersSingleTierCurrency;
            element.currencyCode = 'USD';
            return Promise.resolve().then(() => {
                const priceAdjustmentTiers = element.querySelectorAll('.tier');
                expect(priceAdjustmentTiers).toHaveLength(1);
            });
        });

        it('multiple tiers', () => {
            element.adjustmentTiers = adjustmentTiersMultipleTiersCurrency;
            element.currencyCode = 'USD';
            return Promise.resolve().then(() => {
                const priceAdjustmentTiers = element.querySelectorAll('.tier');
                expect(priceAdjustmentTiers).toHaveLength(5);
            });
        });
    });

    it('displays percentage discounts as a properly-formatted value', () => {
        element.adjustmentTiers = adjustmentTiersSingleTierPercent;
        return Promise.resolve().then(() => {
            const priceAdjustmentTiers = element.querySelectorAll('lightning-formatted-number');
            expect(priceAdjustmentTiers).toHaveLength(1);
        });
    });

    it('displays price discounts as a properly-formatted value', () => {
        element.adjustmentTiers = adjustmentTiersSingleTierCurrency;
        element.currencyCode = 'USD';
        return Promise.resolve().then(() => {
            const priceAdjustmentTiers = element.querySelectorAll('commerce-formatted-price');
            expect(priceAdjustmentTiers).toHaveLength(1);
        });
    });
});
