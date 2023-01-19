/**
 * CheckoutMode type values:
 *  FUTURE:     Component in a future step.
 *              Component is not visible.
 *              Component can render and probably will be hidden because the container hides it.
 *
 *  EDIT:       Component in the current step.
 *              Edit UX visible and interactive, including errors from current validations and previous API error responses.
 *
 *  DISABLED:   Component in the current step and step is actively proceeding (saving and calling API).
 *              Edit UX visible but not interactive. a progress cursor may be rendered by the container.
 *
 *  SUMMARY:   Component is in a past step (or a future step if the consumer has back-tracked).
 *              Component can show a read-only summary.
 *
 *  STENCIL:    Component is in a stencil mode.
 *              Stencils are placeholders that visually communicate that content is in the process of loading.
 */
export enum CheckoutMode {
    FUTURE,
    EDIT,
    DISABLED,
    SUMMARY,
    STENCIL,
}
