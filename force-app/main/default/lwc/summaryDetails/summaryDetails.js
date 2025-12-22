/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api } from 'lwc';
import * as Labels from './labelUtils';

export default class SummaryDetails extends LightningElement {
    static renderMode = 'light';

    /**
     * Configuration object containing language and other settings
     * @type {object}
     */
    @api configuration = {};

    /**
     * Order/cart details object passed by the parent component.
     * Expected shape:
     * {
     * items: Array,
     * subtotal: Number,
     * promotionsDiscount: Number,
     * shippingCost: Number,
     * shippingDiscount: Number,
     * couponsDiscount: Number,
     * couponsApplied: Array<String>, // Array of coupon codes applied for an item or for the entire order (e.g., ['SAVE20', 'WELCOME10'])
     * taxes: Number,
     * total: Number,
     * currencyCode: String,
     * bodyMessage: String,
     * headerMessage: String,
     * id: String
     * }
     */
    _details = {};

    @api
    set details(value) {
        this._details = value;
    }

    get details() {
        return this._details;
    }

    /**
     * Flag indicating if the component is rendering in cart summary mode.
     */
    @api isCartSummary = false;

    /**
     * Tracks whether the expandable section is currently expanded.
     */
    isExpanded = false;

    /**
     * Getter for the current language/locale
     * @returns {string} The current language/locale (defaults to 'en_US')
     */
    @api
    get language() {
        return this.configuration?.language || 'en_US';
    }

    /**
     * Getter for internationalized labels
     * @returns {object} Object containing all translated labels for the current language
     */
    @api
    get i18n() {
        const language = this.language;
        const isMoreThanOneCouponApplied = this.couponsAppliedCount > 1;

        return {
            confirmationTitle: Labels.confirmationTitle(language),
            subtotalLabel: Labels.subtotalLabel(language),
            promotionsLabel: Labels.promotionsLabel(language),
            shippingLabel: Labels.shippingLabel(language),
            shippingDiscountLabel: Labels.shippingDiscountLabel(language),
            taxesLabel: Labels.taxesLabel(language),
            totalLabel: Labels.totalLabel(language),
            tbdLabel: Labels.tbdLabel(language),
            freeShippingLabel: Labels.freeShippingLabel(language),
            defaultDeliveryMessage: Labels.defaultDeliveryMessage(language),
            footerMessage: Labels.footerMessage(language),
            orderSummaryAssistiveText: Labels.orderSummaryAssistiveText(language),
            cartSummaryAssistiveText: Labels.cartSummaryAssistiveText(language),
            toggleExpandAssistiveText: Labels.toggleExpandAssistiveText(language),
            toggleCollapseAssistiveText: Labels.toggleCollapseAssistiveText(language),
            toggleExpandCartAssistiveText: Labels.toggleExpandCartAssistiveText(language),
            toggleCollapseCartAssistiveText: Labels.toggleCollapseCartAssistiveText(language),
            orderItemsAssistiveText: Labels.orderItemsAssistiveText(language),
            cartItemsAssistiveText: Labels.cartItemsAssistiveText(language),
            orderTotalsAssistiveText: Labels.orderTotalsAssistiveText(language),
            cartTotalsAssistiveText: Labels.cartTotalsAssistiveText(language),
            orderIdLabel: Labels.orderIdLabel(language),
            couponsDiscountLabel: isMoreThanOneCouponApplied
                ? Labels.couponsDiscountLabelPlural(language)
                : Labels.couponsDiscountLabel(language),
            couponsAppliedLabel: isMoreThanOneCouponApplied
                ? Labels.couponsAppliedLabelPlural(language)
                : Labels.couponsAppliedLabel(language),
        };
    }

    /**
     * Convenience getter for the currency code to avoid repetition.
     * @returns {string} The currency code or 'USD' as default
     */
    get currencyCode() {
        return this.details?.currencyCode || 'USD';
    }

    /**
     * Gets the list of order items with formatted prices.
     * @returns {Array} Array of items with added formattedPrice property
     */
    get items() {
        return (this.details?.items ?? []).map((item) => ({
            ...item,
            formattedPrice: this.formatPrice(item.itemSubtotal, this.currencyCode),
        }));
    }

    /**
     * Utility to format a numeric amount as a currency string.
     * @param {number} amount - The amount to format
     * @param {string} currencyCode - The currency code to use for formatting
     * @returns {string} Formatted currency string
     */
    formatPrice(amount, currencyCode) {
        try {
            return new Intl.NumberFormat(this.language, {
                style: 'currency',
                currency: currencyCode,
            }).format(amount);
        } catch (e) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyCode,
            }).format(amount);
        }
    }

    /**
     * Formats a discount amount as a negative currency value.
     * Handles null, undefined, NaN, and non-numeric values gracefully by treating them as 0.
     * @param {number} amount - The discount amount (may be positive or negative)
     * @returns {string} Formatted currency string with negative sign
     * TODO: W-18991018 Remove Math.abs and have consistent discounts from actions
     */
    formatDiscount(amount) {
        if (amount === null || amount === undefined || Number.isNaN(amount) || typeof amount !== 'number') {
            return `-${this.formatPrice(0, this.currencyCode)}`;
        }
        const absoluteValue = Math.abs(amount);
        return `-${this.formatPrice(absoluteValue, this.currencyCode)}`;
    }

    /**
     * Gets the formatted subtotal amount for the totals section.
     * @returns {string} Formatted currency string for the subtotal
     */
    get subtotal() {
        return this.formatPrice(this.details?.subtotal || 0, this.currencyCode);
    }

    /**
     * Gets the formatted promotions amount, displayed as a negative value if applicable.
     * @returns {string} Formatted currency string for promotions
     */
    get promotions() {
        return this.formatDiscount(this.details.promotionsDiscount);
    }

    /**
     * Gets the formatted shipping cost, or fallback to TBD / Free Shipping label.
     * @returns {string} Formatted shipping cost, "TBD", or "Free Shipping" label
     */
    get shipping() {
        const shipping = this.details?.shippingCost;
        if (shipping === null || shipping === undefined) {
            return this.i18n.tbdLabel;
        }
        return shipping === 0 ? this.i18n.freeShippingLabel : this.formatPrice(shipping, this.currencyCode);
    }

    /**
     * Gets the formatted shipping discount amount, displayed as a negative value if applicable.
     * @returns {string} Formatted currency string for shipping discount
     */
    get shippingDiscount() {
        return this.formatDiscount(this.details.shippingDiscount);
    }

    /**
     * Gets the formatted coupon discount amount, displayed as a negative value if applicable.
     * @returns {string} Formatted currency string for coupon discount
     */
    get couponsDiscount() {
        return this.formatDiscount(this.details.couponsDiscount);
    }

    /**
     * Gets the formatted tax amount, or fallback to TBD label.
     * @returns {string} Formatted currency string for taxes or "TBD"
     */
    get taxes() {
        const taxes = this.details?.taxes;
        if (taxes === null || taxes === undefined) {
            return this.i18n.tbdLabel;
        }
        return this.formatPrice(taxes, this.currencyCode);
    }

    /**
     * Indicates if there are any promotions to display.
     * @returns {boolean} True if promotions amount is not null or undefined
     */
    get hasPromotions() {
        return !!this.details?.promotionsDiscount;
    }

    /**
     * Indicates if there is a shipping discount to display.
     * @returns {boolean} True if shipping discount amount is not null or undefined
     */
    get hasShippingDiscount() {
        return !!this.details?.shippingDiscount;
    }

    /**
     * Indicates if there is a coupon discount to display.
     * @returns {boolean} True if coupon discount amount is not null or undefined
     */
    get hasCouponsDiscount() {
        const isCouponFeatureShown = this.details?.flags?.isCouponFeatureEnabled ?? false;
        return isCouponFeatureShown && !!this.details?.couponsDiscount;
    }

    /**
     * Gets the count of valid applied coupons.
     * @returns {number} Count of valid coupons
     */
    @api
    get couponsAppliedCount() {
        const coupons = this.details?.couponsApplied;
        if (!Array.isArray(coupons)) return 0;

        return coupons.filter((coupon) => coupon && typeof coupon === 'string' && coupon.trim().length > 0).length;
    }

    /**
     * Gets the comma-separated list of applied coupons.
     * @returns {string} Comma-separated coupon names
     */
    @api
    get couponsApplied() {
        const coupons = this.details?.couponsApplied;
        if (!Array.isArray(coupons)) return '';

        return coupons
            .filter((coupon) => coupon && typeof coupon === 'string' && coupon.trim().length > 0)
            .map((coupon) => coupon.trim())
            .join(', ');
    }

    /**
     * Indicates if there are any applied coupons to display.
     * @returns {boolean} True if couponsApplied array has at least one valid (non-empty, non-whitespace) item
     */
    get hasCouponsApplied() {
        const isCouponFeatureShown = this.details?.flags?.isCouponFeatureEnabled ?? false;
        return isCouponFeatureShown && this.couponsAppliedCount > 0;
    }

    /**
     * Gets the formatted total amount for the totals section.
     * @returns {string} Formatted currency string for the total
     */
    get total() {
        return this.formatPrice(this.details?.total || 0, this.currencyCode);
    }

    /**
     * Gets the order number for display in order confirmation mode.
     * @returns {string} Order number from details
     */
    get orderNumber() {
        return this.details?.id;
    }

    /**
     * Gets the summary message displayed in the header or a default fallback.
     * @returns {string} Summary information or default delivery message
     */
    get summaryMessage() {
        return this.details?.bodyMessage || this.i18n.defaultDeliveryMessage;
    }

    /**
     * Gets the body message for cart summary when in cart summary mode
     * @returns {string} Summary of cart sections
     */
    get cartSummaryBodyMessage() {
        const bodyMessage = this.details?.bodyMessage;
        // Replace <strong> tags that come from agent action response with custom font-weight styling of 500
        const formattedBodyMessage = bodyMessage?.replace(/<strong>/g, '<strong style="font-weight: 500;">');
        return formattedBodyMessage || bodyMessage;
    }

    /**
     * Gets the confirmation title for the header.
     * In cart summary mode, extracts text before the first <br> tag.
     * Intended to be rendered inside a <h2> for proper heading semantics.
     * @returns {string} Cart summary info or default confirmation title
     */
    get confirmationTitle() {
        if (this.isCartSummary) {
            const headerMessage = this.details?.headerMessage;
            return headerMessage?.split('<br>')[0] || '';
        }
        return this.i18n.confirmationTitle;
    }

    /**
     * Gets the appropriate icon name for the caret based on expanded state.
     * @returns {string} Icon name for chevron up or down
     */
    get caretIconName() {
        return this.isExpanded ? 'utility:chevronup' : 'utility:chevrondown';
    }

    /**
     * Gets the CSS classes for the header element based on expanded state.
     * @returns {string} Combined CSS classes for header styling
     */
    get headerClasses() {
        return 'confirmation-header' + (this.isExpanded ? ' expanded' : '');
    }

    /**
     * Gets the ARIA label for the summary region.
     * @returns {string} ARIA label for the summary
     */
    get summaryAriaLabel() {
        return this.isCartSummary ? this.i18n.cartSummaryAssistiveText : this.i18n.orderSummaryAssistiveText;
    }

    /**
     * Gets the ARIA label for the expand/collapse button.
     * @returns {string} ARIA label for the expand/collapse button
     */
    get toggleButtonAriaLabel() {
        if (this.isCartSummary) {
            return this.isExpanded
                ? this.i18n.toggleCollapseCartAssistiveText
                : this.i18n.toggleExpandCartAssistiveText;
        }
        return this.isExpanded ? this.i18n.toggleCollapseAssistiveText : this.i18n.toggleExpandAssistiveText;
    }

    /**
     * Gets the ARIA label for the items list region.
     * @returns {string} ARIA label for the items list
     */
    get itemsAriaLabel() {
        return this.isCartSummary ? this.i18n.cartItemsAssistiveText : this.i18n.orderItemsAssistiveText;
    }

    /**
     * Gets the ARIA label for the totals section.
     * @returns {string} ARIA label for the totals section
     */
    get totalsAriaLabel() {
        return this.isCartSummary ? this.i18n.cartTotalsAssistiveText : this.i18n.orderTotalsAssistiveText;
    }

    /**
     * Gets the CSS classes for the expandable content section.
     * @returns {string} CSS classes for expandable content styling
     */
    get expandableContentClasses() {
        return 'expandable-content' + (this.isExpanded ? ' expanded' : '');
    }

    /**
     * Gets the CSS classes for the clickable row button based on cart summary mode.
     * @returns {string} CSS classes for clickable row button styling
     */
    get clickableRowClasses() {
        const baseClasses = 'clickable-row slds-grid slds-grid_align-spread';
        return this.isCartSummary
            ? `${baseClasses} slds-p-horizontal_none slds-p-top_small slds-p-bottom_medium`
            : `${baseClasses} slds-p-around_none slds-m-bottom_medium`;
    }

    /**
     * Gets the CSS classes for the totals section based on cart summary mode.
     * @returns {string} CSS classes for totals section styling
     */
    get totalsClasses() {
        return this.isCartSummary ? 'totals slds-p-bottom_small' : 'totals slds-p-bottom_medium';
    }

    /**
     * Toggles the expanded/collapsed state of the details section.
     * The `handleKeyDown` function is no longer needed here as native buttons
     * handle Enter and Space key activation automatically.
     */
    handleToggleExpanded() {
        this.isExpanded = !this.isExpanded;
    }
}
