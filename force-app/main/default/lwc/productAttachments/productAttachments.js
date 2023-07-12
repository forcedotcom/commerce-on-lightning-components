/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { api, LightningElement } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
import { transformMediaItems } from './utils';
/**
 * @typedef {object} File
 * @property {string} url
 *  The URL pointing to the file attachment.
 * @property {?string} name
 *  The name of the attached file.
 */

/**
 * @typedef {object} ProductDetailData
 * @property {string} id
 *  The product's unique identifier.
 * @property {?Array<ProductMediaGroupData>} mediaGroups
 *  The product's media groups.
 */

/**
 * @typedef {object} ProductMediaGroupData
 * @property {?string} id
 *  The media group's unique identifier.
 * @property {?string} usageType
 *  The media group's categorization.
 * @property {Array<ProductMediaData>} mediaItems
 *  The media items assigned to that media group.
 */

/**
 * @typedef {object} ProductMediaData
 * @property {?string} id
 *  The media item's unique identifier.
 * @property {?string} title
 *  A title for the media item.
 * @property {?string} url
 *  The media item's URL.
 */

export default class ProductAttachments extends LightningElement {
    static renderMode = 'light';

    /**
     * The list of files for the product.
     * @type {?ProductDetailData}
     */
    @api
    product;

    /**
     * The icon color for each file.
     * @type {?string}
     */
    @api
    fileIconColor;

    /**
     * Whether a file should open in a new tab.
     * @type {boolean}
     */
    @api
    openFilesInNewTab = false;

    /**
     * Guarantees to return a list of {@link File}s, or an empty list if
     * no _`files`_ are given.
     * @type {Array<File>}
     * @readonly
     * @private
     */
    get files() {
        return transformMediaItems(this.product);
    }

    /**
     * Returns custom CSS properties for the `lightning-icon` component.
     * @type {string}
     * @readonly
     * @private
     */
    get cssProperties() {
        return generateStyleProperties({
            ...(this.fileIconColor
                ? {
                      '--ref-c-product-attachments-icon-color-foreground-default': this.fileIconColor,
                  }
                : {}),
            '--slds-c-icon-color-foreground-default': `var(--ref-c-product-attachments-icon-color-foreground-default, var(--sds-c-icon-color-foreground-default, #747474))`,
        });
    }

    /**
     * Returns in which browsing context to open the linked file;
     * `_blank` if _`openFilesInNewTab`_ is `true` (which usually will
     * open the link in a new tab), `_self` otherwise.
     * @type {('_blank' | '_self')}
     * @readonly
     * @private
     */
    get target() {
        return this.openFilesInNewTab ? '_blank' : '_self';
    }

    /**
     * Returns the desired relationship of the current page with the newly opened
     * attachment based on whether files are being opened in new tab or not.
     * @type {string}
     * @readonly
     * @private
     */
    get rel() {
        return this.openFilesInNewTab ? 'nofollow noopener noreferrer' : '';
    }

    renderedCallback() {
        this.classList.toggle('slds-hide', this.files.length === 0);
    }
}
