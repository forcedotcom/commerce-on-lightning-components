import getErrorMessage from '../errorCodeEvaluator';

const localizedLabels = {
    default: 'An unexpected error occurred. Try again later.',
    effectiveAccountNotFound: 'You dont have permission to get wishlists.',
    gateDisabled: 'The store admin can help with that.',
    insufficientAccess: 'You need permission to access lists.',
    invalidBatchSize: 'Always purchase this product in set of increments.',
    invalidInput: 'Check the parameters and try again.',
    itemNotFound: "The item you selected wasn't found.",
    maximumLimitExceeded: 'You reached your limit (or) This product has a maximum purchase limit.',
    limitExceeded: 'Your cart is full.',
    missingRecord: 'This product has a minimum purchase limit.',
    tooManyRecords: 'You reached your limit of items.',
    webstoreNotFound: 'You dont have access to this store.',
};

const localizedCouponLabels = {
    alreadyApplied: 'Coupon {code} is already applied.',
    blockedExclusive: "This coupon can't be applied to your cart.",
    effectiveAccountNotFound: "You don't have permission to apply this coupon {code}.",
    insufficientAccess: 'You need permission to apply the coupon {code}. The store admin can help with that.',
    invalidInput: 'Coupon {code} is invalid.',
    maximumLimitExceeded: 'You can apply up to 2 coupons per cart.',
    unqualifiedCart: "Your cart isn't eligible for coupon {code}.",
    webstoreNotFound: 'You dont have access to this store.',
};

describe('commerce_unified_coupons/errorCodeEvaluator: Error Code Evaluator', () => {
    describe.each`
        code                             | labels             | message
        ${'API_DISABLED_FOR_ORG'}        | ${localizedLabels} | ${localizedLabels.gateDisabled}
        ${'EFFECTIVE_ACCOUNT_NOT_FOUND'} | ${localizedLabels} | ${localizedLabels.effectiveAccountNotFound}
        ${'INSUFFICIENT_ACCESS'}         | ${localizedLabels} | ${localizedLabels.insufficientAccess}
        ${'INVALID_API_INPUT'}           | ${localizedLabels} | ${localizedLabels.invalidInput}
        ${'INVALID_BATCH_SIZE'}          | ${localizedLabels} | ${localizedLabels.invalidBatchSize}
        ${'ITEM_NOT_FOUND'}              | ${localizedLabels} | ${localizedLabels.itemNotFound}
        ${'MAX_LIMIT_EXCEEDED'}          | ${localizedLabels} | ${localizedLabels.maximumLimitExceeded}
        ${'LIMIT_EXCEEDED'}              | ${localizedLabels} | ${localizedLabels.limitExceeded}
        ${'MISSING_RECORD'}              | ${localizedLabels} | ${localizedLabels.missingRecord}
        ${'TOO_MANY_RECORDS'}            | ${localizedLabels} | ${localizedLabels.tooManyRecords}
        ${'WEBSTORE_NOT_FOUND'}          | ${localizedLabels} | ${localizedLabels.webstoreNotFound}
    `('the $property property', ({ code, labels, message }) => {
        it(`returns the string "${message}" when errorCode is "${code}"`, () => {
            const labelStr = getErrorMessage(code, labels);
            expect(labelStr).toBe(message);
        });
    });

    describe.each`
        code                             | labels                   | message
        ${'ALREADY_APPLIED'}             | ${localizedCouponLabels} | ${localizedCouponLabels.alreadyApplied}
        ${'BLOCKED_EXCLUSIVE'}           | ${localizedCouponLabels} | ${localizedCouponLabels.blockedExclusive}
        ${'EFFECTIVE_ACCOUNT_NOT_FOUND'} | ${localizedCouponLabels} | ${localizedCouponLabels.effectiveAccountNotFound}
        ${'INSUFFICIENT_ACCESS'}         | ${localizedCouponLabels} | ${localizedCouponLabels.insufficientAccess}
        ${'INVALID_API_INPUT'}           | ${localizedCouponLabels} | ${localizedCouponLabels.invalidInput}
        ${'MAX_LIMIT_EXCEEDED'}          | ${localizedCouponLabels} | ${localizedCouponLabels.maximumLimitExceeded}
        ${'UNQUALIFIED_CART'}            | ${localizedCouponLabels} | ${localizedCouponLabels.unqualifiedCart}
    `('the $property property', ({ code, labels, message }) => {
        it(`returns the string "${message}" when errorCode is "${code}" for coupon operations`, () => {
            const labelStr = getErrorMessage(code, labels);
            expect(labelStr).toBe(message);
        });
    });

    ['', undefined, null].forEach((invalidInput) => {
        it(`returns no text when invalid errorCode ("${invalidInput}")`, () => {
            //@ts-ignore
            expect(getErrorMessage(invalidInput, localizedLabels)).toBeUndefined();
        });

        it(`returns no text when invalid labels "${invalidInput}"`, () => {
            //@ts-ignore
            expect(getErrorMessage('ITEM_NOT_FOUND', invalidInput)).toBeUndefined();
        });
    });
});
