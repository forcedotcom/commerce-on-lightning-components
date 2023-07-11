/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
/**
 * @typedef {object} ImageSizes
 * @property {number} mobile The image width on mobile phone devices
 * @property {number} tablet The image width on tablet devices
 * @property {number} desktop The image width on desktop-size devices
 */

/**
 * @param {(HTMLElement | null)} el A container that holds the image element to extract the sizes from
 * @returns {ImageSizes} An object holding the image sizes for various screen sizes
 */
export function getImageSizes(el) {
    const styles = el && getComputedStyle(el);
    const mobile = Number(styles?.getPropertyValue('--com-c-image-width-mobile'));
    const tablet = Number(styles?.getPropertyValue('--com-c-image-width-tablet'));
    const desktop = Number(styles?.getPropertyValue('--com-c-image-width-desktop'));
    return {
        mobile: mobile && !Number.isNaN(mobile) ? mobile : 0,
        tablet: tablet && !Number.isNaN(tablet) ? tablet : 0,
        desktop: desktop && !Number.isNaN(desktop) ? desktop : 0,
    };
}

/**
 * @param {ImageSizes} imageSizes An object holding the image sizes for various screen sizes
 * @returns {boolean} Whether all the different image sizes are defined inside the container object
 */
export function imageSizesDefined(imageSizes) {
    return imageSizes && Object.values(imageSizes).every((size) => size && size > 0);
}

/**
 * @param {(HTMLElement | null)} el A container that holds the image element to extract the sizes from
 * @param {ImageSizes} imageSizes An object holding the image sizes for various screen sizes
 */
export function calculateImageSizes(el, imageSizes) {
    if (!imageSizesDefined(imageSizes)) {
        const sizes = getImageSizes(el);
        Object.assign(imageSizes, sizes);
    }
}
