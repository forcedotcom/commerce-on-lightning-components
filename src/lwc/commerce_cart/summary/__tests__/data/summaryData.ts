import type { Totals } from '../../types';

export const cartTotalsData: {
    pricesAreProvided: Totals;
    pricesNotProvided: Totals;
} = {
    pricesAreProvided: {
        discountAmount: '-1000',
        originalPrice: '5000',
        shippingPrice: '10',
        subtotal: '4000',
        tax: '250',
        total: '3260',
    },
    pricesNotProvided: {
        discountAmount: undefined,
        originalPrice: undefined,
        shippingPrice: undefined,
        subtotal: undefined,
        tax: undefined,
        total: undefined,
    },
};
