import Labels from './labels';
import type { CardType, IndexableByCardType } from 'types/payment';

const VISA = 'visa';
const VISA_PATTERN = new RegExp('^4[0-9]');

const DISCOVER = 'discover';
const DISCOVER_PATTERN = new RegExp('^6(?:011|5)');

const MASTERCARD = 'mastercard';
const MASTERCARD_PATTERN = new RegExp('^(?:5[1-5]|222[1-9]|22[3-9][0-9]|2[3-6][0-9]|27[01][0-9]|2720)');

const AMEX = 'amex';
const AMEX_PATTERN = new RegExp('^3[47]');

function nonAmexFormatter(cardNumber: string): string {
    return cardNumber.replace(/\d{4}(?=.)/g, '$& ');
}

function amexFormatter(cardNumber: string): string {
    return cardNumber.replace(/(\d{4})?(?=.)(\d{6})?(?=.)(\d{5})?/, '$1 $2 $3');
}

export function CardIcons(basePath: string): IndexableByCardType {
    return {
        blank: basePath + '/assets/images/Cards.svg#blank',
        visa: basePath + '/assets/images/Cards.svg#visa',
        discover: basePath + '/assets/images/Cards.svg#discover',
        amex: basePath + '/assets/images/Cards.svg#amex',
        mastercard: basePath + '/assets/images/Cards.svg#mastercard',
    };
}

export const CardTypes: {
    pattern: RegExp;
    type: CardType;
    format: (cardNumber: string) => string;
    label: string;
}[] = [
    { pattern: VISA_PATTERN, type: VISA, format: nonAmexFormatter, label: Labels.Visa },
    { pattern: DISCOVER_PATTERN, type: DISCOVER, format: nonAmexFormatter, label: Labels.Discover },
    { pattern: MASTERCARD_PATTERN, type: MASTERCARD, format: nonAmexFormatter, label: Labels.MasterCard },
    { pattern: AMEX_PATTERN, type: AMEX, format: amexFormatter, label: Labels.AmericanExpress },
];
