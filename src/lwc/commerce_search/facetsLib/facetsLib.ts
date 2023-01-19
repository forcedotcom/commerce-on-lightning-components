import { FacetDisplayTypeEnum, FacetUiTypeEnum, ROOT_CATEGORY_ID } from './constants';
import type {
    SearchFacetData,
    DistinctFacetValueData,
    RefinementInputData,
    CategoryInfoTree,
    CategoryInfoTreeNode,
    DistinctFacetValue,
    SearchFacet,
    NormalizedFacetSummary,
    Refinement,
} from 'commerce/searchApiInternal';

import type { ProductSearchCategoryData } from 'commerce/productApiInternal';

/**
 * UI Representation for the category tree
 *
 * @typedef {Object} CategoryInfoTree
 *
 * @property {CategoryInfoTreeNode[]} ancestorCategories
 *  The list of categories that are ancestors to the current selected category
 *
 * @property {CategoryInfoTreeNode} selectedCategory
 *   The category that is currently selected
 */

/**
 * Tree node representation for a single category and its sub-categories.
 *
 * @typedef {Object} CategoryInfoTreeNode
 *
 * @property {string} id
 *  The id of the tree node
 *
 * @property {string} label
 *   The label of the tree node.
 *
 * @property {string} categoryName
 *  The display name of the category, without product count included.
 *
 * @property {List<CategoryInfoTreeNode>} items
 *   The child nodes of the tree node
 */

/**
 * Search Category representation in product search results.
 *
 * @typedef {Object} ConnectApi.SearchCategory
 *
 * @property {ConnectApi.ProductCategoryData} category
 *  Information about the category.
 *
 * @property {Number} productCount
 *  Number of products in search result that belong to the category.
 *
 * @property {ConnectApi.SearchCategory[]} children
 *  The first-level child categories with non-empty search results.
 *  Note: Only populated for the current category being searched (i.e. its
 *  first-level child categories will not have children populated).
 */

/**
 * Representation for basic category data.
 *
 * @typedef {Object} ConnectApi.ProductCategoryData
 *
 * @property {string} id
 *  ID of the category.
 *
 * @property {string} name
 *  Name of the category.
 *
 * @property {string} description
 *  Description of the category.
 * /

/**
 * Abstract superclass of all Search Facet representations.
 * Currently we use it's only derived represention 
 * ConnectApi.DistinctValueSearchFacet.
 *
 * @typedef {Object} ConnectApi.SearchFacet
 *
 * @property {string} facetType
 *  Type of the facet (so far we have DISTINCT_VALUE).
 *
 * @property {string} nameOrId
 *  ID or internal name of the facet.
 *
 * @property {string} attributeType
 *  Type of the search attribute underlying the facet
 *  (STANDARD, CUSTOM, PRODUCT_ATTRIBUTE or PRODUCT_CATEGORY).
 *
 * @property {string} displayName
 *  Display name of the facet.
 * 
 * @property {string} displayType
 *  Display name of the facet. (SINGLE_SELECT, MULTI_SELECT, CATEGORY_TREE or
 *  DATE_PICKER)
 *
 * @property {Number} displayRank
 *  Display rank for the facet.
 *
 * @property {ConnectApi.DistinctFacetValue[]} values
 *  Values of the facet found in the search result. Sorted by displayName in alphabetical order.
 */

/**
 * The UI representation for a facet. The difference between
 * {@see ConnectApi.SearchFacet} and this type is it's "values" property
 *
 * @typedef {Object} SearchFacet
 *
 * @property {string} id
 *  The client-side generated unique identifier
 *
 * @property {string} facetType
 *  Type of the facet (so far we have DISTINCT_VALUE).
 *
 * @property {string} nameOrId
 *  ID or internal name of the facet.
 *
 * @property {string} attributeType
 *  Type of the search attribute underlying the facet
 *  (STANDARD, CUSTOM, PRODUCT_ATTRIBUTE or PRODUCT_CATEGORY).
 *
 * @property {string} displayName
 *  Display name of the facet.
 *
 * @property {string} displayType
 *  Display name of the facet. (SINGLE_SELECT, MULTI_SELECT, CATEGORY_TREE or
 *  DATE_PICKER)
 *
 * @property {Number} displayRank
 *  Display rank for the facet.
 *
 * @property {DistinctFacetValue[]} values
 *   The values of the facet
 */

/**
 * Representation of distinct facet value.
 *
 * @typedef {Object} ConnectApi.DistinctFacetValue
 *
 * @property {string} nameOrId
 *  ID or internal name of the facet value.
 *
 * @property {string} displayName
 *  Display Name of the facet value.
 *
 * @property {Number} productCount
 *  Number of products in search result that match the facet value.
 */

/**
 * Facet representation that inputFacet will take in
 *
 * @typedef {Object} DistinctFacetValue
 *
 * @property {string} id
 *  ID or internal name of the facet value.
 *
 * @property {string} name
 *  Display Name of the facet value with product count.
 *
 * @property {Boolean} checked
 *  Whether or not the value is selected.
 *
 * @property {Boolean} focusOnInit
 *  Whether or not to show the focus when initially displayed.
 *
 * @property {Number} productCount
 *  Number of products in search results under this category
 */

/**
 * Input representation for an attribute-based refinement input with distinct
 * values for product search. Array of this object will be passed  to search
 * API for refinements. This representation is almost similar to
 *  {@see Refinement} except removed all the internal members that wouldn't be
 *  needed to pass to a search query.
 *
 * @typedef {Object} ConnectApi.RefinementInput
 *
 * @property {string} type
 *  Type of the refinement.
 *  Supported values: "DistinctValue". "Range" value may come in later releases.
 *
 * @property {string} nameOrId
 *  Internal/developer name of the attribute to refine search on.
 *
 * @property {string} attributeType
 *  Type of the search attribute underlying the refinement.
 *  Supported values: (STANDARD, CUSTOM, PRODUCT_ATTRIBUTE or PRODUCT_CATEGORY).
 *
 * @property {string[]} values
 *  The list of facet values.
 */

/**
 * The UI representation of a refinement
 *
 * @typedef {Object} Refinement
 *
 * @property {string} id
 *  The client-side generated unique identifier
 *
 * @property {string} type
 *  Type of the refinement.
 *  Supported values: "DistinctValue". "Range" value may come in later releases.
 *
 * @property {string} nameOrId
 *  Internal/developer name of the attribute to refine search on.
 *
 * @property {string} attributeType
 *  Type of the search attribute underlying the refinement.
 *  Supported values: (STANDARD, CUSTOM, PRODUCT_ATTRIBUTE or PRODUCT_CATEGORY).
 *
 * @property {string[]} values
 *  The list of facet values.
 */

/**
 * The mapping of facet types between UI and API response
 * @type {Map}
 */
const FacetTypeMap = new Map();
FacetTypeMap.set(FacetDisplayTypeEnum.MULTISELECT, FacetUiTypeEnum.CHECKBOX);
FacetTypeMap.set(FacetDisplayTypeEnum.SINGLESELECT, FacetUiTypeEnum.RADIO);

/**
 * Creates the category tree, given a search category response
 *  * @param {ProductSearchCategoryData} searchCategoryData
 *   The category given in the search output response
 *
 * @param {CategoryInfoTree} cachedTree
 *   The existing category tree that is present in the search. It consists of an array of tree nodes.
 *   Can be null if category tree hasn't been updated yet
 *
 * @return {CategoryInfoTree} categoryTree
 */
export function createTreeFromCategory(
    searchCategoryData: ProductSearchCategoryData | null | undefined,
    cachedTree: CategoryInfoTree | null | undefined
): CategoryInfoTree {
    const tree: CategoryInfoTree = {
        ancestorCategories: [],
        selectedCategory: {},
    };
    const searchCategoryRep = Object.assign({}, searchCategoryData);

    if (Object.keys(searchCategoryRep).length > 0) {
        // The root category "All Categories" will have a "null" ID.
        // We need to convert this ID into an acceptable key value for the UI component.
        searchCategoryRep.category = Object.assign({}, searchCategoryRep.category);
        if (!searchCategoryRep.category.id) {
            searchCategoryRep.category.id = ROOT_CATEGORY_ID;
        }
        if (cachedTree && Object.keys(cachedTree).length > 0) {
            // CATEGORY TREE UPDATE: "searchCategoryRep" will consist of the selected category object and its children. We will need to figure out where to append this category
            // based on three scenarios.
            //
            // Scenario #1: User has selected on a category above the previously selected category. We will need to remove all categories below the path
            // of the current category.
            //
            // Scenario #2: User has selected on a sub-category of the previously selected category. We add the previously selected category as an ancestor.
            //
            // Scenario #3: User hasn't selected on a new category, which means a facet value was updated. The previously selected category will be removed
            // and added again, with updated product counts.

            // Keep the categories which are ancestors of the selected category. If the user clicked on a sub-category, no filtering will be done.
            let isAncestor = true;
            tree.ancestorCategories = cachedTree.ancestorCategories?.filter((node) => {
                if (searchCategoryRep.category?.id === node.id) {
                    isAncestor = false;
                }
                return isAncestor;
            });

            // Handle Scenario #2. Add the previously selected category as an ancestor if we selected its child.
            if (isAncestor) {
                tree.ancestorCategories?.push({
                    id: cachedTree.selectedCategory?.id,
                    label: cachedTree?.selectedCategory?.label,
                    categoryName: cachedTree?.selectedCategory?.categoryName,
                });
            }

            let categoryLabel = `${searchCategoryRep.category.name} (${searchCategoryRep.productCount?.toString()})`;

            // If there are no ancestor categories, then the selected category is the root category. Remove the product count.
            if (tree?.ancestorCategories?.length === 0) {
                categoryLabel = `${searchCategoryRep.category.name}`;
            }

            // Transform the selected category and its children into a CategoryInfoTreeNode object. Add to the tree.
            const selectedTreeNode: CategoryInfoTreeNode = {
                id: searchCategoryRep.category.id,
                label: categoryLabel,
                categoryName: searchCategoryRep.category.name,
            };
            selectedTreeNode.items = searchCategoryRep.children?.map((child) => {
                const label = `${child.category?.name} (${child.productCount?.toString()})`;
                const categoryName = child.category?.name;
                return {
                    id: child.category?.id,
                    label: label,
                    categoryName: categoryName,
                };
            });
            tree.selectedCategory = selectedTreeNode;
        } else {
            // Initial page load scenario
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
        }
    }
    return tree;
}

/**
 * Creates the facet label by combining the facet value name and product count.
 * Only applies to input facet values (radio button, checkbox).
 *
 * We also determine whether the facet's values are selected by checking if the facet is cached or not.
 * If a facet has been cached, its values should all be selected since we will not return any of its
 * non-selected values
 */
export function createFacetValueLabel(value: DistinctFacetValueData, checked: boolean): DistinctFacetValue {
    const valueAndProductCount = `${value.displayName} (${value?.productCount?.toString()})`;

    const facetValueDetail = {
        id: value.nameOrId,
        name: valueAndProductCount,
        checked: checked,
        focusOnInit: false,
        productCount: value?.productCount,
    };
    return facetValueDetail;
}

/**
 *  convert DistinctFacetValueData type to UI DistinctFacetValue type
 * @type {DistinctFacetValueData}
 * @returns {DistinctFacetValue}
 */
function normalizeDistinctFacetValueData(value: DistinctFacetValueData): DistinctFacetValue {
    const valueAndProductCount = `${value.displayName} (${value?.productCount?.toString()})`;

    const facetValueDetail = {
        id: value.nameOrId,
        checked: false,
        name: valueAndProductCount,
        focusOnInit: false,
        productCount: value?.productCount,
    };
    return facetValueDetail;
}

/**
 *  Replace the facet values with an UI representation that includes a facet value label.
 *  Only applies if the facets are an input type (checkbox, radio button). Other facet types can retain their original API representation.
  @param {NormalizedFacetSummary[]} facetData
 * @param {Refinement[]} refinements
 * @param {SearchFacet} mruFacet
 * @returns {SearchFacet[]} The facets
 * 
 */
export function transformInputFacetLabels(
    facetData: NormalizedFacetSummary[],
    refinements: Refinement[] | null,
    mruFacet: SearchFacet | null | undefined
): SearchFacet[] {
    /**
     * Merge arrays of {facet.values} and {mruFacet.values}
     * Override {mruFacet.values} to {facet.values}
     *
     * @param mruFacetValues
     * @param facetValues
     *
     * @return Merged Facet Values
     */
    function mergeFacetValues(
        mruFacetValues: DistinctFacetValue[],
        facetValues: DistinctFacetValue[]
    ): DistinctFacetValue[] {
        return mruFacetValues.concat(
            facetValues.filter(
                (facetValue) => mruFacetValues.findIndex((mruFacetValue) => mruFacetValue.id === facetValue.id) < 0
            )
        );
    }

    // Facet UI transformation strategy
    //
    // #1 - Iterate over the facet data and check whether each facet is contained in the cache.
    //      refinements will have be non-empty if the facet is cached.
    // #2 - Transform the facet values into a UI representation. If the facet is in the cache, iterate over its values
    //      and check if each value is included in the cache. This will determine whether the value should be checked/unchecked.
    //      If the facet isn't in the cache, we can default all of its values to be unchecked.
    // #3 - Make sure the most recently used facet is skipped over in the update. We want to retain all of its possible values if its the MRU facet.
    const facets = facetData.map((facetDataItem) => {
        const facet = Object.assign({}, facetDataItem);
        let refinementsList: Refinement[] = [];

        if (refinements && refinements.length > 0) {
            // Step #1
            // Filter the list of refinements down to a single item that matches the current facet being transformed.
            // If the current facet isn't in the cached list, the list will return empty.
            refinementsList = refinements.filter((refinement) => refinement.id === facet.id);
        }

        // Step #2
        // Input facet's values get a UI representation that works with the lightning-input component
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
                return normalizeDistinctFacetValueData(facetValue);
            });
        }
        // Convert display type response to UI display type
        facet.displayType = FacetTypeMap.get(facet.displayType);
        return {
            ...facet,
            values,
        };
    });

    // Step #3
    if (mruFacet && Object.keys(mruFacet).length > 0) {
        // Replace the MRU facet's new data with its existing data, since we want to skip updating it
        return facets.map((facet) => {
            if (facet.id === mruFacet.id) {
                facet = {
                    ...facet,
                    ...mruFacet,
                    values: mergeFacetValues(<DistinctFacetValue[]>mruFacet.values, facet.values),
                };
            }
            return facet;
        }) as SearchFacet[];
    }
    return facets;
}

/**
 * Normalize all facet data with client generated ids.
 *
 * @param {(SearchFacetData[]} data
 * @returns {SearchFacet[]}
 */
export function normalizeFacets(input: SearchFacetData[]): NormalizedFacetSummary[] {
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
 *
 * @param {(RefinementInputData[]} data
 * @returns {Refinement[]}
 */
export function normalizeRefinements(input: RefinementInputData[] | null | undefined): Refinement[] {
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
 * Prepare FacetRequestParams by removing all client generated ids.
 * @param {Refinement[]} refinementsList
 * @returns {RefinementInputData[]}
 */
export function prepareRefinementsForRequest(refinementsList: Refinement[] | null | undefined): RefinementInputData[] {
    const refinements = (refinementsList ?? []).map((refItem) => {
        const newRefItem = { ...refItem, values: [...refItem.values] };
        Reflect.deleteProperty(newRefItem, 'id');
        return newRefItem;
    });

    return refinements;
}
