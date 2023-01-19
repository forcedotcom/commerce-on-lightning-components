import paymentSrc from '../paymentSrc';

describe('paymentSrc', () => {
    it('returns the path to the static payment asset, including the provided base path', () => {
        expect(paymentSrc('/base')).toBe('/base/assets/cardpayment/payment.js');
    });
});
