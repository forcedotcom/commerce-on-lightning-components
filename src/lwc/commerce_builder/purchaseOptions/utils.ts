import type { PurchaseQuantityRule } from 'commerce/productApi';
import type { QuantityGuides, Rule, RuleSet } from './types';

const defaultEmptyObject = Object.create(null);

/**
 * Computes purchase rule set.
 *
 * @param {PurchaseQuantityRule} quantityRule - Quantity constraints.
 * @param {QuantityGuides} quantityGuides - Quantity attribute text gudes.
 * @returns {Rule} - A purchase rule set that include min, max and increment rules.
 */
export const computePurchaseRuleSet = (
    quantityRule: PurchaseQuantityRule | null | undefined,
    quantityGuides: QuantityGuides
): { incrementText: string; minimumText: string; maximumText: string; combinedText: string } => {
    quantityRule = quantityRule || defaultEmptyObject;
    quantityGuides = quantityGuides || defaultEmptyObject;
    const { minimumValueGuideText = '', maximumValueGuideText = '', incrementValueGuideText = '' } = quantityGuides;

    const ruleSet: RuleSet = {
        incrementText: '',
        minimumText: '',
        maximumText: '',
        combinedText: '',
    };

    const ruleArr: Rule[] = [];
    [
        {
            text: 'minimumText',
            valueText: minimumValueGuideText,
            value: quantityRule?.minimum,
        },
        {
            text: 'maximumText',
            valueText: maximumValueGuideText,
            value: quantityRule?.maximum,
        },
        {
            text: 'incrementText',
            valueText: incrementValueGuideText,
            value: quantityRule?.increment,
        },
    ]
        .filter((entry) => entry.valueText && entry.value)
        .forEach((entry) => {
            const valueText: string = entry.valueText.replace('{0}', Number(entry.value) as unknown as string);
            ruleSet[entry.text as keyof typeof ruleSet] = valueText;
            ruleArr.push(valueText as unknown as Rule);
        });
    ruleSet.combinedText = ruleArr.join(' • ');
    return ruleSet;
};
