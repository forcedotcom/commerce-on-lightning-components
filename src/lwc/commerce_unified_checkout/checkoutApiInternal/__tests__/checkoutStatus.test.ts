// @ts-ignore
import {
    CheckoutStatus,
    checkoutStatusIsReady,
    checkoutStatusIsOk,
    checkoutStatusNotStartable,
    checkoutStatusCanRestart,
} from '../checkoutStatus';

describe('checkoutStatusIsReady', () => {
    it('evaluate checkout state is async complete and not errored (except APEX errors)', () => {
        expect(checkoutStatusIsReady(undefined)).toBe(false);
        expect(checkoutStatusIsReady(CheckoutStatus.Unknown)).toBe(false);
        expect(checkoutStatusIsReady(CheckoutStatus.Ready)).toBe(true);
        expect(checkoutStatusIsReady(CheckoutStatus.ReadyWithError)).toBe(true);
    });
});

describe('checkoutStatusIsOk', () => {
    it('evaluate checkout state is reasonable for wire adapter (not including Error)', () => {
        expect(checkoutStatusIsOk(undefined)).toBe(false);
        expect(checkoutStatusIsOk(CheckoutStatus.Unknown)).toBe(false);
        expect(checkoutStatusIsOk(CheckoutStatus.Ready)).toBe(true);
        expect(checkoutStatusIsOk(CheckoutStatus.AsyncInProgress)).toBe(true);
        expect(checkoutStatusIsOk(CheckoutStatus.ReadyWithError)).toBe(true);
    });
});

describe('checkoutStatusNotStartable', () => {
    it('evaluate checkout state should not be restarted', () => {
        expect(checkoutStatusNotStartable(undefined)).toBe(false);
        expect(checkoutStatusNotStartable(CheckoutStatus.Unknown)).toBe(false);
        expect(checkoutStatusNotStartable(CheckoutStatus.Ready)).toBe(true);
        expect(checkoutStatusNotStartable(CheckoutStatus.AsyncInProgress)).toBe(true);
        expect(checkoutStatusNotStartable(CheckoutStatus.ReadyWithError)).toBe(false);
    });
});

describe('checkoutStatusCanRestart', () => {
    it('evaluate checkout state can be restarted by deleting and recreating it)', () => {
        expect(checkoutStatusCanRestart(undefined)).toBe(false);
        expect(checkoutStatusCanRestart(CheckoutStatus.Unknown)).toBe(false);
        expect(checkoutStatusCanRestart(CheckoutStatus.Ready)).toBe(false);
        expect(checkoutStatusCanRestart(CheckoutStatus.ErrorGone)).toBe(true);
        expect(checkoutStatusCanRestart(CheckoutStatus.ReadyWithError)).toBe(true);
    });
});
