/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { LightningElement, api } from 'lwc';

export default class ProductVariants extends LightningElement {
    static renderMode = 'light';

    _productVariants;

    @api
    get productVariants() {
        return this._productVariants;
    }

    set productVariants(value) {
        this._productVariants = Array.isArray(value) ? value : [];
    }

    _selectedVariantValue = null;

    get selectedVariant() {
        return this._selectedVariantValue;
    }

    get variantOptions() {
        return this.productVariants.map((variant) => ({
            ...variant,
            Option: Array.isArray(variant.Option)
                ? variant.Option.map((option) => ({
                      value: option,
                      class: `variant-button ${this._selectedVariantValue === option ? 'selected' : ''}`,
                  }))
                : [],
        }));
    }

    handleVariantClick(event) {
        const variantValue = event.currentTarget.dataset.value;
        const variantName = event.currentTarget.dataset.variantName;
        this._selectedVariantValue = variantValue;
        // Dispatch event to notify parent component of selection
        this.dispatchEvent(
            new CustomEvent('variantselect', {
                detail: {
                    name: variantName,
                    option: variantValue,
                },
            })
        );
    }
}
