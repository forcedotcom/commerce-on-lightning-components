import type { AppliedCoupons } from '../../types';

export const transformedApiData: {
    withDetails: AppliedCoupons[];
    withoutDetails: AppliedCoupons[];
    withMissingDetails: AppliedCoupons[];
    withMultipleDetails: AppliedCoupons[];
} = {
    withDetails: [
        {
            id: 'xxxxx0000000001',
            name: '10OFFCOFFEE',
            termsAndConditions: 'Terms and Conditions',
        },
    ],
    withoutDetails: [],
    withMissingDetails: [
        {
            id: 'xxxxx0000000001',
            name: '',
            termsAndConditions: '',
        },
    ],
    withMultipleDetails: [
        {
            id: 'xxxxx0000000001',
            name: '10OFFCOFFEE',
            termsAndConditions: 'Terms and Conditions',
        },
        {
            id: 'xxxxx0000000002',
            name: '20OFFCOFFEE',
            termsAndConditions: 'Terms and Conditions',
        },
        {
            id: 'xxxxx0000000003',
            name: '30OFFCOFFEE',
            termsAndConditions: 'Terms and Conditions',
        },
    ],
};
