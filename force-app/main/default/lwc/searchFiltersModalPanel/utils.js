/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import labels from './labels';
/**
 * @typedef {{[key: string]: *}} PageReference
 */

/**
 * @typedef {{[key: string]: *}} ProductSearchCategoryData
 */

/**
 * @typedef {{[key: string]: *}} ProductCategoryPathItemData
 */

/**
 * @typedef {import('../searchResults/searchResults').CategoryInfoTree} CategoryInfoTree
 */

/**
 * @typedef {import('../searchResults/searchResults').SearchFacet} SearchFacet
 */

/**
 * @typedef {import('../searchResults/searchResults').SearchFacetData} SearchFacetData
 */

/**
 * @typedef {import('../searchResults/searchResults').NormalizedFacetSummary} NormalizedFacetSummary
 */

/**
 * @typedef {import('../searchResults/searchResults').DistinctFacetValue} DistinctFacetValue
 */

/**
 * @typedef {import('../searchResults/searchResults').DistinctFacetValueData} DistinctFacetValueData
 */

/**
 * @typedef {import('../searchResults/searchResults').FiltersPanelDetail} FiltersPanelDetail
 */

/**
 * @typedef {import('../searchFilters/searchFilters').ProductSearchRefinement} ProductSearchRefinement
 */

/**
 * @typedef {import('../searchFilters/searchFilters').Refinement} Refinement
 */
const FacetDisplayTypeEnum = {
    SINGLESELECT: 'SingleSelect',
    MULTISELECT: 'MultiSelect',
};
const ROOT_CATEGORY_ID = 'ROOT_CATEGORY_ID';
const FacetUiTypeEnum = {
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
};

/**
 * The mapping of facet types between UI and API response
 * @type {Map<string, string>}
 */
const FacetTypeMap = new Map();
FacetTypeMap.set(FacetDisplayTypeEnum.MULTISELECT, FacetUiTypeEnum.CHECKBOX);
FacetTypeMap.set(FacetDisplayTypeEnum.SINGLESELECT, FacetUiTypeEnum.RADIO);

/**
 * Normalize all facet data with client generated ids.
 * @param {SearchFacetData[]} input
 *  A list of search facets.
 * @returns {NormalizedFacetSummary[]}
 *  A list of normalized search facets.
 */
export function normalizeFacets(input) {
    return input.map((facet) => {
        const { nameOrId, attributeType } = facet;
        const id = [nameOrId, attributeType].filter((val) => !!val).join(':');
        return {
            ...facet,
            id,
        };
    });
}

/**
 * Normalize all refinement data with client generated ids.
 * @param {?ProductSearchRefinement[]} input
 *  The list of product search refinements.
 * @returns {Refinement[]}
 *  The list of normalized search refinements.
 */
export function normalizeRefinements(input) {
    return (input ?? []).map((refinement) => {
        const { nameOrId, attributeType } = refinement;
        const id = [nameOrId, attributeType].filter((val) => Boolean(val)).join(':');
        return {
            ...refinement,
            id,
        };
    });
}

/**
 * Creates the category tree, given a search category response
 * @param {?ProductSearchCategoryData} searchCategoryData
 *  The category given in the search output response
 * @param {?PageReference} currentPageReference
 *  The current page reference.
 * @param {?ProductCategoryPathItemData} categoryPath
 *  The current category path.
 * @returns {CategoryInfoTree}
 *  The category tree.
 */
export function createTreeFromCategory(searchCategoryData, currentPageReference, categoryPath) {
    const tree = {
        ancestorCategories: [],
        selectedCategory: {},
    };
    const searchCategoryRep = Object.assign({}, searchCategoryData);
    if (Object.keys(searchCategoryRep).length > 0) {
        searchCategoryRep.category = Object.assign({}, searchCategoryRep.category);
        if (!searchCategoryRep.category.id) {
            searchCategoryRep.category.id = ROOT_CATEGORY_ID;
        } else if (currentPageReference?.type === 'standard__search') {
            tree.ancestorCategories?.push({
                id: ROOT_CATEGORY_ID,
                label: labels.allCategoriesNameLabel,
                categoryName: labels.allCategoriesNameLabel,
                backActionAssistiveText: labels.allCategoriesNameLabel,
            });
        }
        tree.selectedCategory = {
            id: searchCategoryRep.category.id,
            label: searchCategoryRep.category.name,
            categoryName: searchCategoryRep.category.name,
            items: [],
        };
        tree.selectedCategory.items = searchCategoryRep.children?.map((child) => {
            const label = `${child.category?.name} (${child.productCount?.toString()})`;
            return {
                id: child.category?.id,
                label: label,
                categoryName: child.category?.name,
            };
        });
        if (categoryPath && categoryPath.length > 1) {
            const parentCategories = categoryPath
                ?.filter((category) => {
                    return category.id !== tree.selectedCategory?.id;
                })
                .map((category) => {
                    return {
                        id: category.id,
                        label: category.name,
                        categoryName: category.name,
                        backActionAssistiveText: labels.backActionAssistiveText.replace(
                            '{categoryName}',
                            category.name
                        ),
                    };
                });
            tree.ancestorCategories = tree.ancestorCategories?.concat(parentCategories);
        }
    }
    return tree;
}

/**
 * @param {ProductCategoryPathItemData} categoryPath
 *  The current category path.
 * @param {?FiltersPanelDetail} displayData
 *  The search filter panel's unaugmented display data.
 * @param {?string} categoryId
 *  The current category ID.
 * @returns {FiltersPanelDetail}
 *  The search filter panel's normalized/augmented display data.
 */
export function normalizeResultsWithAncestorCategoryTree(categoryPath, displayData, categoryId) {
    const dataClone = {
        ...displayData,
    };
    const categoriesTree = Object.assign({}, displayData?.categories);
    let parentCategories = [];
    if (Object.keys(categoriesTree).length > 0) {
        if (categoryPath.length > 1) {
            parentCategories = categoryPath
                ?.filter((category) => {
                    return category.id !== categoryId;
                })
                .map((category) => {
                    return {
                        id: category.id,
                        label: category.name,
                        categoryName: category.name,
                        backActionAssistiveText: labels.backActionAssistiveText.replace(
                            '{categoryName}',
                            category.name
                        ),
                    };
                });
            dataClone.categories = {
                ...categoriesTree,
                ancestorCategories: categoriesTree.ancestorCategories?.concat(parentCategories),
            };
        }
    }
    return dataClone;
}

/**
 * Creates the facet label by combining the facet value name and product count.
 * Only applies to input facet values (radio button, checkbox).
 *
 * We also determine whether the facet's values are selected by checking if the facet is cached or not.
 * If a facet has been cached, its values should all be selected since we will not return any of its
 * non-selected values.
 * @param {DistinctFacetValueData} value
 *  Distinct facet value data.
 * @param {boolean} [checked]
 *  Whether the facet value is checked.
 * @returns {DistinctFacetValue}
 *  Normalized distinct facet value.
 */
export function createFacetValueLabel(value, checked = false) {
    const valueAndProductCount = `${value.displayName} (${value?.productCount?.toString()})`;
    return {
        id: value.nameOrId,
        name: valueAndProductCount,
        checked,
        focusOnInit: false,
        productCount: value?.productCount,
    };
}

/**
 * Merge arrays of {facet.values} and {mruFacet.values}
 * Override {mruFacet.values} to {facet.values}
 * @param {DistinctFacetValue[]} mruFacetValues
 *  The MRU facet values.
 * @param {DistinctFacetValue[]} facetValues
 *  The facet values
 * @returns {DistinctFacetValue[]}
 *  List of merged facet values.
 */
function mergeFacetValues(mruFacetValues, facetValues) {
    return mruFacetValues.concat(
        facetValues.filter(
            (facetValue) => mruFacetValues.findIndex((mruFacetValue) => mruFacetValue.id === facetValue.id) < 0
        )
    );
}

/**
 * Replace the facet values with an UI representation that includes a facet value label.
 * Only applies if the facets are an input type (checkbox, radio button). Other facet types can retain their original API representation.
 * @param {NormalizedFacetSummary[]} facetData
 *  A list of normalized search facets.
 * @param {Refinement[]} refinements
 *  A list of normalized search refinements.
 * @param {SearchFacet} mruFacet
 *  The MRU facet.
 * @returns {SearchFacet[]}
 *  A list of fully normalized search facets.
 */
export function transformInputFacetLabels(facetData, refinements, mruFacet) {
    const facets = facetData.map((facetDataItem) => {
        const facet = Object.assign({}, facetDataItem);
        let refinementsList = [];
        if (refinements && refinements.length > 0) {
            refinementsList = refinements.filter((refinement) => refinement.id === facet.id);
        }
        let values;
        if (
            facet.displayType === FacetDisplayTypeEnum.SINGLESELECT ||
            facet.displayType === FacetDisplayTypeEnum.MULTISELECT
        ) {
            values = facet.values.map((val) => {
                let checked = false;
                if (refinementsList?.[0] && val.nameOrId) {
                    checked = refinementsList[0].values?.includes(val.nameOrId);
                }
                return createFacetValueLabel(val, checked);
            });
        } else {
            values = facet.values.map((facetValue) => {
                return createFacetValueLabel(facetValue);
            });
        }
        facet.displayType = facet.displayType ? FacetTypeMap.get(facet.displayType) : undefined;
        return {
            ...facet,
            values,
        };
    });
    if (mruFacet && Object.keys(mruFacet).length > 0) {
        return facets.map((facet) => {
            if (facet.id === mruFacet.id) {
                facet = {
                    ...facet,
                    ...mruFacet,
                    values: mergeFacetValues(mruFacet.values, facet.values),
                };
            }
            return facet;
        });
    }
    return facets;
}
/**
 * @param {string} input
 *  Serialized input data.
 * @returns {DeserializeResponse}
 *  Deserialized data.
 */
function deserialize(input) {
    try {
        return {
            value: JSON.parse(decodeURIComponent(input)),
        };
    } catch {
        return {
            error: new TypeError('Deserialization error'),
        };
    }
}

/**
 * @param {*} input
 *  The input data to verify.
 * @returns {boolean}
 *  Whether the input data is a valid search refinement.
 */
function isValidProductSearchRefinementType(input) {
    if (!Array.isArray(input) || input.length === 0) {
        return false;
    }
    for (const curRefinement of input) {
        if (
            typeof curRefinement?.attributeType !== 'string' ||
            typeof curRefinement?.nameOrId !== 'string' ||
            typeof curRefinement?.type !== 'string' ||
            !Array.isArray(curRefinement?.values)
        ) {
            return false;
        }
        for (const curValue of curRefinement.values) {
            if (typeof curValue !== 'string') {
                return false;
            }
        }
    }
    return true;
}

/**
 * Extract the refinements field from the url.
 * @param {?(SearchPageReference | CategoryPageReference)} pageReference
 * @returns {ProductSearchRefinement[]}
 *  A list of product search refinements.
 */
export function getRefinementsFromPageRef(pageReference) {
    const refinementsFromUrl = deserialize(pageReference?.state?.refinements ?? '').value ?? undefined;
    if (!isValidProductSearchRefinementType(refinementsFromUrl)) {
        return undefined;
    }
    return refinementsFromUrl;
}
