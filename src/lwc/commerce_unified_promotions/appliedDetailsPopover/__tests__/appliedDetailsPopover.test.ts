import { createElement } from 'lwc';
import AppliedDetailsPopover from 'commerce_unified_promotions/appliedDetailsPopover';
import type { AppliedPromotion } from 'commerce_unified_promotions/appliedDetailsPopover';
const selectors = {
    savingsInfoIcon: 'lightning-button-icon[slot="source"]',
    popover: 'lightning-popup-source',
    popoverCloseBtn: '.slds-p-slds-popover__close',
    promotionsDetails: '.promotion-details',
    termsAndConditionsSection: 'lightning-accordion',
    discountAmount: 'commerce-formatted-price',
};

const appliedPromotions: AppliedPromotion[] = [
    {
        id: 1,
        name: '5% off Coffee Machines',
        discountAmount: '50.00',
        termsAndConditions: 'Terms and Conditions associated with the promotion',
    },
    {
        id: 2,
        name: '15% off Coffee Accessories',
        discountAmount: '20.00',
        termsAndConditions: 'Terms and Conditions associated with the promotion',
    },
];

describe('commerce_unified_promotions/appliedDetailsPopover: Applied Details Popover', () => {
    let element: HTMLElement & AppliedDetailsPopover;
    beforeEach(() => {
        element = createElement('commerce_unified_promotions-applied-details-popover', {
            is: AppliedDetailsPopover,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });

    [
        {
            property: 'headerLabel',
            defaultValue: undefined,
            changeValue: "I'm a applied details popover header",
        },
        {
            property: 'termsAndConditionsTitleText',
            defaultValue: undefined,
            changeValue: "I'm a terms and conditions title text",
        },
        {
            property: 'currencyCode',
            defaultValue: undefined,
            changeValue: 'USD',
        },
        {
            property: 'appliedPromotions',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'closeButtonAssistiveText',
            defaultValue: undefined,
            changeValue: 'Close Applied Promotions Alt Text',
        },
        {
            property: 'savingsInfoBubbleAssistiveText',
            defaultValue: undefined,
            changeValue: 'Saving Promotions Alt Text',
        },
    ].forEach((propertyTest) => {
        describe(`the "${propertyTest.property}" property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[propertyTest.property as keyof AppliedDetailsPopover]).toBe(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[propertyTest.property as keyof AppliedDetailsPopover]).not.toBe(
                    propertyTest.changeValue
                );

                // Change the value.
                //@ts-ignore
                element[propertyTest.property as keyof AppliedDetailsPopover] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[propertyTest.property as keyof AppliedDetailsPopover]).toBe(propertyTest.changeValue);
            });
        });
    });

    it('should be accessible', () => {
        element.termsAndConditionsTitleText = 'Terms and Conditions';
        element.headerLabel = 'Promotions Applied';
        element.appliedPromotions = appliedPromotions;
        element.savingsInfoBubbleAssistiveText = 'info';
        return Promise.resolve().then(async () => {
            await expect(element).toBeAccessible();
        });
    });

    describe('savings info icon', () => {
        it('should display savings info icon when applied promotions are set', async () => {
            element.appliedPromotions = appliedPromotions;
            await Promise.resolve();
            expect(element.querySelector(selectors.savingsInfoIcon)).toBeDefined();
        });

        [undefined, []].forEach((falsyValue) => {
            it(`should not be displayed when the appliedPromotions value is ${JSON.stringify(
                falsyValue
            )}`, async () => {
                element.appliedPromotions = falsyValue;
                await Promise.resolve();
                const savingsInfoIcon = element.querySelectorAll(selectors.savingsInfoIcon);
                expect(savingsInfoIcon).toHaveLength(0);
            });
        });

        it('on click should open the popover when appliedPromotions are provided', async () => {
            element.appliedPromotions = appliedPromotions;
            const popupSource: HTMLElement | null = element.querySelector(selectors.popover);
            //@ts-ignore
            const spyOpen = jest.spyOn(popupSource, 'open');
            await Promise.resolve();
            (<HTMLButtonElement>element.querySelector(selectors.savingsInfoIcon)).click();
            await Promise.resolve();
            expect(spyOpen).toHaveBeenCalled();
        });
    });

    describe('closes', () => {
        let spyClose: jest.SpyInstance, popupSource: HTMLElement | null;
        beforeEach(() => {
            element.appliedPromotions = appliedPromotions;
            popupSource = element.querySelector(selectors.popover);
            //@ts-ignore
            spyClose = jest.spyOn(popupSource, 'close');
        });

        it('when clicked on `close` button', async () => {
            (<HTMLButtonElement>element.querySelector(selectors.savingsInfoIcon)).click();
            await Promise.resolve();
            (<HTMLButtonElement>element.querySelector(selectors.popoverCloseBtn)).click();
            await Promise.resolve();
            expect(spyClose).toHaveBeenCalled();
        });

        it('when clicked out of the popover', async () => {
            await Promise.resolve();
            (<HTMLButtonElement>element.querySelector(selectors.savingsInfoIcon)).click();
            await Promise.resolve();
            popupSource?.dispatchEvent(new CustomEvent('clickout', {}));
            await Promise.resolve();
            expect(spyClose).toHaveBeenCalled();
        });
    });

    describe('popover contents', () => {
        beforeEach(() => {
            element.currencyCode = 'USD';
            element.termsAndConditionsTitleText = 'Terms and Conditions';
            element.appliedPromotions = appliedPromotions;
        });

        [undefined].forEach((falsyValue) => {
            it(`should not display terms and conditions text section when the text content is (${falsyValue})`, async () => {
                element.appliedPromotions = [
                    {
                        id: 1234,
                        name: '5% off Coffee Machines',
                        discountAmount: '$30',
                        termsAndConditions: falsyValue,
                    },
                ];
                await Promise.resolve();
                (<HTMLButtonElement>element.querySelector(selectors.savingsInfoIcon)).click();
                await Promise.resolve();
                expect(element.querySelectorAll(selectors.termsAndConditionsSection)).toHaveLength(0);
            });

            it(`should not display discount amount when the value is (${falsyValue})`, async () => {
                element.appliedPromotions = [
                    {
                        id: 1,
                        name: '5% off Coffee Machines',
                        //@ts-ignore (needed for the test as undefined can't be assigned)
                        discountAmount: falsyValue,
                        termsAndConditions: 'Terms and Conditions',
                    },
                ];
                await Promise.resolve();
                (<HTMLButtonElement>element.querySelector(selectors.savingsInfoIcon)).click();
                await Promise.resolve();
                expect(element.querySelectorAll(selectors.discountAmount)).toHaveLength(0);
            });

            it(`should not display the savings info icon and thereby the promotion details when appliedPromotions is (${falsyValue})`, async () => {
                element.appliedPromotions = falsyValue;
                await Promise.resolve();
                expect(<HTMLButtonElement>element.querySelector(selectors.savingsInfoIcon)).toBeNull();
            });
        });
    });

    it('should display the promotion details for each applied promotion', async () => {
        element.appliedPromotions = appliedPromotions;
        await Promise.resolve();
        (<HTMLButtonElement>element.querySelector(selectors.savingsInfoIcon)).click();
        await Promise.resolve();
        expect(element.querySelectorAll(selectors.promotionsDetails)).toHaveLength(2);
        expect(element.querySelectorAll(selectors.discountAmount)).toHaveLength(2);
    });

    it('should display the terms and conditions text section for each applied promotion', async () => {
        element.appliedPromotions = appliedPromotions;
        await Promise.resolve();
        (<HTMLButtonElement>element.querySelector(selectors.savingsInfoIcon)).click();
        await Promise.resolve();
        expect(element.querySelectorAll(selectors.termsAndConditionsSection)).toHaveLength(2);
    });
});
