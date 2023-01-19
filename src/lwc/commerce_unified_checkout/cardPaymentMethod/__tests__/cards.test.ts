import { CardIcons, CardTypes } from '../cards';

describe('Cards', () => {
    describe('CardIcons', () => {
        const basePath = '/base';
        it('should return correct path for card icons', () => {
            expect(CardIcons(basePath)).toEqual({
                blank: '/base/assets/images/Cards.svg#blank',
                visa: '/base/assets/images/Cards.svg#visa',
                discover: '/base/assets/images/Cards.svg#discover',
                amex: '/base/assets/images/Cards.svg#amex',
                mastercard: '/base/assets/images/Cards.svg#mastercard',
            });
        });
    });

    describe('CardTypes', () => {
        describe('format', () => {
            it('should format a VISA card correctly', () => {
                const visaCard = CardTypes.find((card) => card.type === 'visa');
                expect(visaCard?.format('4242424242424242')).toBe('4242 4242 4242 4242');
            });

            it('should format a DISCOVER card correctly', () => {
                const discoverCard = CardTypes.find((card) => card.type === 'discover');
                expect(discoverCard?.format('4242424242424242')).toBe('4242 4242 4242 4242');
            });

            it('should format a MASTERCARD card correctly', () => {
                const masterCard = CardTypes.find((card) => card.type === 'mastercard');
                expect(masterCard?.format('5555555555554444')).toBe('5555 5555 5555 4444');
            });

            it('should format a AMEX card correctly', () => {
                const amexCard = CardTypes.find((card) => card.type === 'amex');
                expect(amexCard?.format('378282246310005')).toBe('3782 822463 10005');
            });
        });
    });
});
