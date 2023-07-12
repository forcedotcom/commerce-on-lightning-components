/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { resolve } from 'experience/resourceResolver';

/**
 * @typedef {import('./productAttachments').ProductDetailData} ProductDetailData
 */

/**
 * @typedef {import('./productAttachments').File} File
 */

/**
 * @param {ProductDetailData} product
 *  The product data to create the files/attachments list from.
 * @returns {Array<File>}
 *  The list of files/attachments extracted from the given
 *  _`product`_'s list of media items.
 */
export function transformMediaItems(product) {
    const mediaGroups = product && Array.isArray(product?.mediaGroups) ? product.mediaGroups : [];
    return mediaGroups.reduce((acc, group) => {
        if (group.usageType === 'Attachment') {
            const mediaItems = group?.mediaItems?.map?.((mediaItem) => ({
                name: mediaItem.title,
                url: resolve(mediaItem.url ?? ''),
            }));
            mediaItems && acc.push(...mediaItems);
        }
        return acc;
    }, []);
}
