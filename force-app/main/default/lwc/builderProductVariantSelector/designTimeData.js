/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
/**
 * @typedef {{[key: string]: *}} JsonData
 */

/**
 * @returns {JsonData} Example variation information
 */
export function variationInfo() {
    return {
        variationAttributeInfo: {
            Size__c: {
                allowableValues: ['XL', 'L', 'M', 'S', 'XS'],
                apiName: 'Size__c',
                availableValues: ['L', 'S'],
                fieldEnumOrId: '00NR0000001qPsS',
                label: 'Example Size',
                objectName: 'ProductAttribute',
                sequence: 1,
            },
            Color__c: {
                allowableValues: [],
                apiName: 'Color__c',
                availableValues: null,
                fieldEnumOrId: '00NR0000001qPsY',
                label: 'Example Color',
                objectName: 'ProductAttribute',
                sequence: 2,
            },
        },
    };
}
