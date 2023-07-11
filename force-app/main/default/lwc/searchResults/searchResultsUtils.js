/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import variationAttributeLabel from '@salesforce/label/c.Search_ProductCard_variationAttribute';

/**
 * @typedef {import('../searchResults').ProductSearchResultSummary} ProductSearchResultSummary
 */

/**
 * @typedef {import('../searchResults').ProductCardDetail} ProductCardDetail
 */

/**
 * @typedef {import('../searchResults').ResultsConfiguration} ResultsConfiguration
 */

/**
 * @typedef {import('../searchResults').BuilderLayoutConfiguration} BuilderLayoutConfiguration
 */

/**
 * @typedef {import('../searchResults').CardContentMappingItem} CardContentMappingItem
 */

/**
 * @typedef {import('../searchProductGrid/searchProductGrid').BuilderFieldItem} BuilderFieldItem
 */

/**
 * @typedef {import('../searchProductCard/searchProductCard').FieldValueData} FieldValueData
 */

/**
 * @typedef {import('../searchProductCard/searchProductCard').FieldValueDetailData} FieldValueDetailData
 */

/**
 * @typedef {import('../searchProductCard/searchProductCard').ProductAttributeSetSummary} ProductAttributeSetSummary
 */

/**
 * @typedef {{[key: string]: *}} BuilderCardConfiguration
 */

/**
 * Computes a list of attributes from the given attribute set.
 * @param {ProductAttributeSetSummary} attributeSet - A product variation attribute set
 * @returns {string} A comma separated ordered list of attributes.
 */
export function computeVariationAttributesField(attributeSet) {
    const { attributes = [] } = attributeSet || {};
    return [...attributes]
        .sort((value1, value2) => {
            const { sequence: sequence1 } = value1;
            const { sequence: sequence2 } = value2;
            return sequence1 - sequence2;
        })
        .map((item) => {
            const { label, value } = item;
            return variationAttributeLabel.replace('{name}', label).replace('{value}', value);
        })
        .join(', ');
}

/**
 * Consolidate Experience Builder's content mapping fields with runtime product fields.
 *  In order to merge these fields, {@link ProductCardDetail}'s field should
 *  match to @type {@link BuilderFieldItem}'s 'name'.
 *
 * Note: We have to make all fields of a particular card to be navigable to PDP,
 *  but only 1 field to have tab stop per card to make the accessibility smooth.
 *  So this function does the following logic to make one field tabStoppable in
 *  a list of FieldValueDetailData.
 *  - make the first field with the name = 'Name' as the tabStoppable field.
 *  - if there is no field called 'Name' in the list, make the first item in
 *      the list as tabStoppable.
 * @param {{[key: string]: FieldValueData}} productFieldMap Key-value pairs of field names and their value objects. This is from runtime.
 * @param {string} productClass The class the product belongs to
 * @param {Array<CardContentMappingItem>} contentMapping An array of content map field configuration. This is from builder.
 * @param {boolean} tabStoppable Whether to make a field in the map as tab-stoppable.
 * @returns {Array<FieldValueDetailData>} A list of {@link FieldValueDetailData}
 */
export function generateContentMappedFields(
    productFieldMap = {},
    productClass = '',
    contentMapping = [],
    tabStoppable = false
) {
    const PRODUCT_FIELD_NAME = 'Name';
    const fieldMap = productFieldMap;
    const fields = (contentMapping || [])
        .map(({ name, label, type }) => ({
            name,

            label: productClass === 'Variation' && type === 'VARIATION' ? '' : label,
            type,
            // eslint-disable-next-line
            value: (fieldMap[name] || {})['value'] || '',
            tabStoppable: false,
        }))
        .filter(({ value, type }) => (productClass === 'VariationParent' && type === 'VARIATION') || value !== '');
    if (tabStoppable && fields.length > 0) {
        const nameField = fields.find((item) => item.name === PRODUCT_FIELD_NAME);
        const fieldValueItem = nameField || fields[0];
        fieldValueItem.tabStoppable = true;
    }
    return fields;
}

/**
 * @param {({[key: string]: FieldValueData} | FieldValueDetailData[])} fields
 *  The fields belonging to the card item.
 * @param {?string} productClass
 *  The product class
 * @param {?ProductAttributeSetSummary} variationAttributeSet
 *  The variation attribute set
 * @param {BuilderCardConfiguration} cardConfig
 *  The product card configuration for Experience Builder
 * @returns {Array<FieldValueDetailData>}
 *  A list of {@link FieldValueDetailData}
 */
function consolidateFieldDisplayData(fields, productClass, variationAttributeSet, cardConfig) {
    const transformedFields = new Map();
    for (const [key, value] of Object.entries(fields)) {
        transformedFields.set(key, value);
    }

    if (productClass === 'Variation' && variationAttributeSet) {
        transformedFields.set('VariationAttributes', {
            value: computeVariationAttributesField(variationAttributeSet),
        });
    }
    return generateContentMappedFields(
        Object.fromEntries(transformedFields),
        productClass,
        cardConfig.cardContentMapping,
        cardConfig.showCallToActionButton === false
    );
}

/**
 * Transform the product search query results into to a UI friendly display-data format.
 * @param {ProductSearchResultSummary} results
 *  The search results data as it's passed from the search data provider.
 * @param {BuilderCardConfiguration} cardConfiguration
 *  The product card configuration object for Experience Builder.
 * @returns {ProductSearchResultSummary}
 *  The normalized/transformed search results data for the UI consumption.
 */
export function transformDataWithConfiguration(results, cardConfiguration = {}) {
    const cardCollection = ((results || {}).cardCollection || []).map((cardDetail) => {
        const { fields, productClass, variationAttributeSet } = cardDetail;
        return {
            ...cardDetail,
            fields: consolidateFieldDisplayData(fields, productClass, variationAttributeSet, cardConfiguration),
        };
    });
    return {
        ...results,
        cardCollection,
    };
}

/**
 * Compute the layout configuration from the given set of UI properties.
 * @param {BuilderLayoutConfiguration} configParameters The builder layout configuration from builder properties.
 * @returns {ResultsConfiguration} The complete configuration for the search results.
 */
export function computeConfiguration(configParameters) {
    const {
        layout = '',
        gridMaxColumnsDisplayed = 4,
        addToCartDisabled = false,
        builderCardConfiguration,
    } = configParameters || {};
    const {
        addToCartButtonText = '',
        addToCartButtonProcessingText = '',
        cardContentMapping = [],
        showCallToActionButton = false,
        showNegotiatedPrice = false,
        showOriginalPrice: showListingPrice = false,
        showProductImage = false,
        viewOptionsButtonText = '',
        showQuantitySelector = false,
        minimumQuantityGuideText = '',
        maximumQuantityGuideText = '',
        incrementQuantityGuideText = '',
        showQuantityRulesText = true,
        quantitySelectorLabelText = '',
    } = builderCardConfiguration || {};
    const fieldConfiguration = cardContentMapping.reduce((acc, { name, fontSize, fontColor, showLabel = false }) => {
        acc[name] = {
            fontSize,
            fontColor,
            showLabel,
        };
        return acc;
    }, {});
    return {
        layoutConfiguration: {
            layout,
            gridMaxColumnsDisplayed,
            cardConfiguration: {
                addToCartButtonText,
                addToCartButtonProcessingText,
                showCallToActionButton,
                viewOptionsButtonText,
                showQuantitySelector,
                minimumQuantityGuideText,
                maximumQuantityGuideText,
                incrementQuantityGuideText,
                showQuantityRulesText,
                quantitySelectorLabelText,
                showProductImage,
                addToCartDisabled,
                layout,
                fieldConfiguration,
                priceConfiguration: {
                    showNegotiatedPrice,
                    showListingPrice,
                },
            },
        },
    };
}
