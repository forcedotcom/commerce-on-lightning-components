import { transformPromotions } from '../transformPromotions';
import type { AppliedPromotion, InternalAppliedPromotion } from '../types';

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

const internalAppliedPromotion: InternalAppliedPromotion[] = [
    {
        discountAmount: '50.00',
        formattedDiscountAmount: '$50.00',
        id: 1,
        name: '5% off Coffee Machines',
        termsAndConditions: 'Terms and Conditions associated with the promotion',
    },
    {
        discountAmount: '20.00',
        formattedDiscountAmount: '$20.00',
        id: 2,
        name: '15% off Coffee Accessories',
        termsAndConditions: 'Terms and Conditions associated with the promotion',
    },
];

describe('transformPromotion', () => {
    it('should transform the applied promotions', () => {
        const result = transformPromotions(appliedPromotions, 'usd');
        expect(result).toStrictEqual(internalAppliedPromotion);
    });
});
