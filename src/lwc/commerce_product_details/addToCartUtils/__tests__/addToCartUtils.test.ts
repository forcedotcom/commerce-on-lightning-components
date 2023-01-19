import { handleAddToCartErrorWithToast, isAddToCartEnabledForUser } from 'commerce_product_details/addToCartUtils';
import Toast from 'lightning/toast';
import { LightningElement, createElement } from 'lwc';
import { AddToCartErrorType } from '../errorMessageUtils';
import { getAppContext, getSessionContext } from 'commerce/context';
import type { AppContext, SessionContext } from 'commerce/context';
import type { DeepPartial } from 'types/util';
import type { CommerceError } from 'commerce/cartApi';

jest.mock('lightning/toast', () => ({
    show: jest.fn(),
}))
    .mock('../addToCartErrorLabels', () => ({
        defaultErrorMessage: 'default message',
        insufficientAccess: 'unique message',
    }))
    .mock('commerce/context', () => ({
        getAppContext: jest.fn(),
        getSessionContext: jest.fn(),
    }));

class MockComponent extends LightningElement {}

describe('commerce_product_details/addToCartUtils', () => {
    let target: MockComponent;
    let appContext: DeepPartial<AppContext>;
    let sessionContext: DeepPartial<SessionContext>;

    beforeEach(() => {
        target = createElement('mock-component', {
            is: MockComponent,
        });

        (getAppContext as jest.Mock).mockImplementation(() => Promise.resolve(appContext));
        (getSessionContext as jest.Mock).mockImplementation(() => Promise.resolve(sessionContext));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('handleAddToCartErrorWithToast', () => {
        describe('when there is a store action error with a response', () => {
            describe('when there is an error code', () => {
                it('should emit a toast with a unique error code message', () => {
                    handleAddToCartErrorWithToast(
                        <CommerceError>{ code: AddToCartErrorType.INSUFFICIENT_ACCESS },
                        target
                    );
                    expect(Toast.show).toHaveBeenCalledWith(
                        {
                            label: 'unique message',
                            variant: 'error',
                        },
                        target
                    );
                });
            });

            describe('when there is not an error code', () => {
                it('should emit a toast with the a default error message', () => {
                    handleAddToCartErrorWithToast(<CommerceError>{}, target);

                    expect(Toast.show).toHaveBeenCalledWith(
                        {
                            label: 'default message',
                            variant: 'error',
                        },
                        target
                    );
                });
            });
        });

        describe('when there is not a store action error with a response', () => {
            it('should emit a toast with the a default error message', () => {
                handleAddToCartErrorWithToast(undefined, target);

                expect(Toast.show).toHaveBeenCalledWith(
                    {
                        label: 'default message',
                        variant: 'error',
                    },
                    target
                );
            });
        });
    });

    describe('isAddToCartEnabledForUser', () => {
        beforeEach(() => {
            sessionContext = { isLoggedIn: false };
            appContext = { isGuestCartCheckoutEnabled: false };
        });

        describe('when logged in', () => {
            beforeEach(() => {
                sessionContext.isLoggedIn = true;
            });

            it('should return true', async () => {
                await expect(isAddToCartEnabledForUser()).resolves.toBe(true);
            });
        });

        describe('when not logged in', () => {
            describe('when guest checkout is enabled', () => {
                beforeEach(() => {
                    appContext.isGuestCartCheckoutEnabled = true;
                });

                it('should return true', async () => {
                    await expect(isAddToCartEnabledForUser()).resolves.toBe(true);
                });
            });

            describe('when guest checkout is not enabled', () => {
                it('should return false', async () => {
                    await expect(isAddToCartEnabledForUser()).resolves.toBe(false);
                });
            });
        });
    });
});
