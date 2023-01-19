import { createElement } from 'lwc';
import Summary from 'commerce_unified_promotions/summary';
import { querySelector, querySelectorAll } from 'kagekiri';
import MatchMediaMock from 'jest-matchmedia-mock';
import { registerSa11yMatcher } from '@sa11y/jest';
import { transformedApiData } from './data/summary';

describe('commerce_unified_promotions/summary: Applied Promotions Summary', () => {
    let element: Summary & HTMLElement;
    let matchMedia: MatchMediaMock;

    type appliedPromotionsSummary =
        | 'headerText'
        | 'currencyCode'
        | 'appliedPromotions'
        | 'termsAndConditionsHeaderText';

    beforeAll(() => {
        registerSa11yMatcher();
        matchMedia = new MatchMediaMock();
    });

    afterAll(() => {
        matchMedia.destroy();
    });

    beforeEach(() => {
        element = createElement('commerce_unified_promotions-summary', {
            is: Summary,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe.each`
        property                          | defaultValue | changeValue
        ${'headerText'}                   | ${undefined} | ${''}
        ${'currencyCode'}                 | ${undefined} | ${'USD'}
        ${'appliedPromotions'}            | ${undefined} | ${null}
        ${'termsAndConditionsHeaderText'} | ${undefined} | ${'Terms and Conditions'}
    `('the $property property', ({ property, defaultValue, changeValue }) => {
        it(`defaults to ${defaultValue}`, () => {
            expect(element[<appliedPromotionsSummary>property.property]).toBe(defaultValue);
        });

        it('reflects a changed value', () => {
            expect(element[<appliedPromotionsSummary>property.property]).not.toBe(changeValue);
            element[<appliedPromotionsSummary>property.property] = changeValue;
            expect(element[<appliedPromotionsSummary>property.property]).toBe(changeValue);
        });
    });

    it('displays no entries when no promotions are provided', () => {
        return Promise.resolve().then(() => {
            const appliedPromotionsComponent = <Summary & HTMLElement>(<unknown>querySelectorAll('dl'));
            expect(appliedPromotionsComponent).toHaveLength(0);
        });
    });

    describe('the applied promotions summary component', () => {
        beforeEach(() => {
            element.appliedPromotions = transformedApiData.withDetails;
            element.headerText = 'Promotions Applied';
            element.currencyCode = 'USD';
            element.termsAndConditionsHeaderText = 'Terms and Conditions';
        });

        it('should fulfill accessibility standards', async () => {
            await Promise.resolve();

            return Promise.resolve().then(() => expect(element).toBeAccessible());
        });

        it('displays an entry for each applied promotion', () => {
            return Promise.resolve().then(() => {
                const appliedPromotionsComponent = <Summary & HTMLElement>(<unknown>querySelectorAll('dl'));
                expect(appliedPromotionsComponent).toHaveLength(transformedApiData.withDetails.length);
            });
        });
    });

    describe('an applied promotion entry', () => {
        beforeEach(() => {
            element.headerText = 'Promotions Applied';
            element.currencyCode = 'USD';
            element.termsAndConditionsHeaderText = 'Terms and Conditions';
        });

        it('displays the terms and conditions info icon when the text content is provided', () => {
            element.appliedPromotions = transformedApiData.withDetails;
            return Promise.resolve().then(() => {
                const termsAndConditions = <Summary & HTMLElement>(
                    querySelector('b2b_buyer_promotions-terms-and-conditions-popover')
                );
                expect(termsAndConditions).toBeTruthy();
            });
        });

        it('display discount amount when the value is provided', () => {
            element.appliedPromotions = transformedApiData.withDetails;
            return Promise.resolve().then(() => {
                const appliedPromotionsComponent = <Summary & HTMLElement>(
                    querySelector('b2b_buyer_pricing-formatted-price')
                );
                expect(appliedPromotionsComponent).toBeTruthy();
            });
        });

        it(`should not display terms and conditions info icon when the text content is not provided`, () => {
            element.appliedPromotions = transformedApiData.withMissingDetails;
            return Promise.resolve().then(() => {
                const appliedPromotionsComponent = <Summary & HTMLElement>(
                    querySelector('b2b_buyer_promotions-terms-and-conditions-popover')
                );
                expect(appliedPromotionsComponent).toBeFalsy();
            });
        });

        it(`should not display discount amount when the value is not provided`, () => {
            element.appliedPromotions = transformedApiData.withMissingDetails;
            return Promise.resolve().then(() => {
                const appliedPromotionsComponent = <Summary & HTMLElement>(
                    querySelector('b2b_buyer_pricing-formatted-price')
                );
                expect(appliedPromotionsComponent).toBeFalsy();
            });
        });
    });
});
