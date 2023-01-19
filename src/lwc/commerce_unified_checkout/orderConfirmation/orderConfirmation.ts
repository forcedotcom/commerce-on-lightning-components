import { LightningElement, api, wire, track } from 'lwc';
import type {
    LwcCustomEventTargetOf,
    NamedPageReference,
    LightningNavigationContext,
    CommerceOrderPageReference,
} from 'types/common';
import { NavigationContext, CurrentPageReference, generateUrl, navigate } from 'lightning/navigation';

/**
 * Page Reference for Continue Shopping button
 */
const homePageRef: NamedPageReference = {
    type: 'comm__namedPage',
    attributes: {
        name: 'Home',
    },
};

/**
 * A component to display order confirmation message
 */
export default class OrderConfirmation extends LightningElement {
    public static renderMode = 'light';
    /**
     * NavigationContext
     * @type {LightningNavigationContext}
     */
    @track
    private navContext?: LightningNavigationContext;

    /**
     * The URL to navigate to home page for Continue Shopping button
     * @type {String}
     */
    private homePageUrl?: string;

    /**
     * The header text e.g., Thank you for your order!
     *
     * @type {string}
     */
    @api
    public headerText: string | undefined;

    /**
     * The text for the "Confirmation Number" label.
     *
     * @type {string}
     */
    @api
    public confirmationNumberText: string | undefined;

    /**
     * The body text e.g., We're processing your order now.
     *
     * @type {string}
     */
    @api
    public bodyText: string | undefined;
    /**
     * The text for the "Continue Shopping" button.
     *
     * @type {string}
     */
    @api
    public buttonText: string | undefined;

    /**
     * The order number captured from URL parameter "orderNumber."
     *
     * @type {string}
     */
    private get orderNumber(): string | undefined {
        return this.pageRef?.state?.orderNumber;
    }

    /**
     * Get the current page reference to extract query parameter "orderNumber"
     */
    @wire(CurrentPageReference)
    private pageRef?: CommerceOrderPageReference;

    /**
     * Get the navigation context
     */
    @wire(NavigationContext)
    private getNavContext(navContext: LightningNavigationContext): void {
        this.navContext = navContext;
        this.homePageUrl = generateUrl(navContext, homePageRef);
    }

    /**
     * Handles a "click" event on the Continue Shopping link button.
     *
     * @param {Event} event the click event
     * @private
     */
    private handleClick(e: LwcCustomEventTargetOf<HTMLInputElement>): void {
        e.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        navigate(this.navContext!, homePageRef);
    }
}
