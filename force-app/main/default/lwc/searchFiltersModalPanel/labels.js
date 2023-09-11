/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import oneResultSearchHeaderShort from '@salesforce/label/c.Search_Results_oneResultSearchHeaderShort';
import multipleResultSearchHeaderShort from '@salesforce/label/c.Search_Results_multipleResultSearchHeaderShort';
import oneCategoryHeader from '@salesforce/label/c.Search_Results_oneCategoryHeader';
import multipleCategoryHeader from '@salesforce/label/c.Search_Results_multipleCategoryHeader';
import clearButton from '@salesforce/label/c.Search_Facets_clearButton';
import cancelButton from '@salesforce/label/c.Search_Facets_cancelButton';
import allCategoriesNameLabel from '@salesforce/label/c.Search_Results_allCategoriesName';
import backActionAssistiveText from '@salesforce/label/c.Search_Facets_backActionAssistiveText';
export default {
    /**
     * A label of the form '{count} Result'
     * @type {string}
     */
    oneResultSearchHeaderShort,
    /**
     * A label of the form '{count} Results'
     * @type {string}
     */
    multipleResultSearchHeaderShort,
    /**
     * A label of the form '{count} Item'
     * @type {string}
     */
    oneCategoryHeader,
    /**
     * A label of the form '{count} Items'
     * @type {string}
     */
    multipleCategoryHeader,
    /**
     * A label for clear all button
     * @type {string}
     */
    clearButton,
    /**
     * A label for cancel dialog button
     * @type {string}
     */
    cancelButton,
    /**
     * The 'All Categories' label for the categoryTree
     * @type {string}
     */
    allCategoriesNameLabel,
    /**
     * The assistive text for the ancestor categories
     * @type {string}
     */
    backActionAssistiveText,
};
