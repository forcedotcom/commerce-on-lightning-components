import type { LightningElement } from 'lwc';
import type { AddToCartErrorType } from './errorMessageUtils';
import { getErrorMessage } from './errorMessageUtils';
import Toast from 'lightning/toast';
import { getAppContext, getSessionContext } from 'commerce/context';
import type { CommerceError } from 'commerce/cartApi';

function showErrorToast(message: string, target: LightningElement): void {
    Toast.show(
        {
            label: message,
            variant: 'error',
        },
        target
    );
}

/**
 * Handles an add to cart error using a Toast notification.
 *
 * @param error The store error of type CommerceError
 * @param target The target element to emit the toast notification from
 *
 */
export function handleAddToCartErrorWithToast(
    error: Partial<CommerceError> | undefined,
    target: LightningElement
): void {
    if (error) {
        showErrorToast(getErrorMessage(<AddToCartErrorType>error?.code || undefined), target);
    } else {
        // still show error toast in case error object doesn't match, like network is down
        showErrorToast(getErrorMessage(), target);
    }
}

/**
 * Determines if the add to cart functionality is enabled for a users session.
 * @returns Returns true if the user can add to cart.
 */
export async function isAddToCartEnabledForUser(): Promise<boolean> {
    const [appContext, sessionContext] = await Promise.all([getAppContext(), getSessionContext()]);
    const { isLoggedIn } = sessionContext;
    const { isGuestCartCheckoutEnabled } = appContext;

    return Boolean(isLoggedIn || isGuestCartCheckoutEnabled);
}
