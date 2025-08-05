/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */

/*
 * Exports carousel-related labels using Salesforce custom labels import pattern.
 * Add these labels to your org as needed (see Common.labels-meta.xml).
 */
import addToCartAssistiveText from '@salesforce/label/c.Common_Carousel_AddToCart';
import productImageAltText from '@salesforce/label/c.Common_Carousel_ProductImageAltText';
import carouselNavigationNext from '@salesforce/label/c.Common_Carousel_Next';
import carouselNavigationPrevious from '@salesforce/label/c.Common_Carousel_Previous';
import carouselIndicatorText from '@salesforce/label/c.Common_Carousel_Indicator';

export {
    addToCartAssistiveText,
    productImageAltText,
    carouselNavigationNext,
    carouselNavigationPrevious,
    carouselIndicatorText,
};
