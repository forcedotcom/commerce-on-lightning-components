/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { LightningElement, api } from 'lwc';
import { PILL_VARIANT } from './constants';

/**
 * Reusable pill component for item-level and order-level promotions and coupons.
 * Use variant="promotion" for promotions (e.g. "20% off"), variant="coupon" for coupon codes.
 * Set disabled=true for non-applicable coupons (e.g. COUPON_STATUS.NO_APPLICABLE_PROMOTION).
 * @class
 * @augments LightningElement
 */
export default class CustomPill extends LightningElement {
    static renderMode = 'light';

    /**
     * Text to display inside the pill.
     * @type {string}
     */
    @api label = '';

    /**
     * Visual variant: PILL_VARIANT.PROMOTION (gray background) or PILL_VARIANT.COUPON (white with border).
     * @type {string}
     */
    @api variant = PILL_VARIANT.PROMOTION;

    /**
     * When true, pill is visually disabled (muted, no interaction). Used for order-level coupons with COUPON_STATUS.NO_APPLICABLE_PROMOTION.
     * @type {boolean}
     */
    @api disabled = false;

    /**
     * Optional max-width for the pill (e.g. '180px' for item-level promotions). Applied as inline style when set.
     * @type {string}
     */
    @api maxWidth = '';

    /**
     * Computed CSS class string for the pill root.
     * @returns {string} Space-separated class names for the pill element
     */
    get pillClass() {
        const base = 'pill';
        const v = this.variant === PILL_VARIANT.COUPON ? 'pill-coupon' : 'pill-promotion';
        const disabled = this.disabled ? ' pill-disabled' : '';
        return `${base} ${v}${disabled}`;
    }

    /**
     * Inline style for max-width when provided. Uses min( maxWidth, 100% ) so the pill
     * never overflows its container while still truncating long text.
     * @returns {string} Inline style string or empty string
     */
    get pillStyle() {
        return this.maxWidth ? `max-width: min(${this.maxWidth}, 100%)` : '';
    }

    /**
     * Title attribute for the pill span. Returns the label for promotion pills (to surface
     * truncated text on hover) and an empty string for coupon pills.
     * @returns {string}
     */
    get pillTitle() {
        return this.variant === PILL_VARIANT.PROMOTION ? this.label : '';
    }
}
