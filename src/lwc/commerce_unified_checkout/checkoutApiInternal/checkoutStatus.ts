/**
 * CheckoutStatus type value:
 *   undefined (falsey) status unknown
 *                      typically during initial load
 *
 *   Unknown (falsey)   status unknown
 *                      typically during update and reload
 *
 *   Ready              checkout state is complete for the supplied data
 *                      will accept additional imperative updates
 *
 *   AsyncInProgress    checkout state is only partially complete as
 *                      async operations are in progress
 *
 *   ErrorNotFound      with GET implies checkout not found and can be created
 *                      with POST implies cart not found not reccoverable
 *
 *   ErrorConflict      checkout already exists
 *                      recoverable but not obviously so
 *
 *   ErrorGone          checkout expired or invalidated (Gone)
 *                      should be deleted and recreated
 *
 *   ReadyWithError     checkout state is complete but cannot proceed until an
 *                      imperative API is used to correct some aspect of the data
 *                      will accept additional imperative updates
 */
export enum CheckoutStatus {
    Unknown = 0,
    Ready = 200,
    AsyncInProgress = 202,
    ErrorNotFound = 404,
    ErrorConflict = 409,
    ErrorDbLock = 423,
    ErrorGone = 410,
    ReadyWithError = 422,
}

/**
 * Returns true if the supplied checkout status is complete and will accept additional parameters
 */
export function checkoutStatusIsReady(checkoutStatus: CheckoutStatus | undefined): boolean {
    return !!checkoutStatus && [CheckoutStatus.Ready, CheckoutStatus.ReadyWithError].includes(checkoutStatus);
}

/**
 * Returns true if the supplied checkout status is ok to notify to components
 * note: status 422 async error which contains checkoutInfo and integration error detail
 */
export function checkoutStatusIsOk(checkoutStatus: CheckoutStatus | undefined): boolean {
    return (
        !!checkoutStatus &&
        [CheckoutStatus.Ready, CheckoutStatus.AsyncInProgress, CheckoutStatus.ReadyWithError].includes(checkoutStatus)
    );
}

/**
 * Returns true if the supplied checkout status is ok to create (not good, not in progress)
 */
export function checkoutStatusNotStartable(checkoutStatus: CheckoutStatus | undefined): boolean {
    return !!checkoutStatus && [CheckoutStatus.Ready, CheckoutStatus.AsyncInProgress].includes(checkoutStatus);
}

/**
 * Returns true if the supplied checkout status can be recovered by deleting and recreating it
 */
export function checkoutStatusCanRestart(checkoutStatus: CheckoutStatus | undefined): boolean {
    return !!checkoutStatus && [CheckoutStatus.ErrorGone, CheckoutStatus.ReadyWithError].includes(checkoutStatus);
}
