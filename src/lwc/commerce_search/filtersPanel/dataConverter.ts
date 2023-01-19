import type { SearchFacetValuesCheckMap, Refinement } from 'commerce/searchApiInternal';

/**
 * The search facet display-data.
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
 *  The values of the facet
 */

/**
 * The search facets values check map. This is to keep track of the facets
 *  values that has been checked to create refinements for the search query.
 *
 * @typedef {Object} SearchFacetValuesCheckMap
 *
 * @property {SearchFacet} searchFacet
 *  The search faceet display-data.
 *
 * @property {Map<string, Boolean>} valuesCheckMap
 *  A map of facet-value-id with its check/uncheck state.
 */

/**
 * The refinement display-data.
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
 * Convert the mapping of facets to refinements. Only add the selected facet
 * values to refinement values.
 *
 * @param {Map<string, SearchFacetValuesCheckMap>} facetsMap
 *  A map of {@see SearchFacetValuesCheckMap} with facet id as the key.
 *
 * @returns {Refinement[]}
 */
/**
 * Convert the mapping of facets to refinements. Only add the selected facet
 * values to refinement values.
 */
export function refinementsFromFacetsMap(
    facetsMap: Map<string | undefined, SearchFacetValuesCheckMap> | null | undefined
): Refinement[] {
    // handle null
    const facetMapValues = facetsMap ? Array.from(facetsMap.values()) : [];

    return facetMapValues
        .map(({ searchFacet, valuesCheckMap }) => {
            const { id, nameOrId, facetType: type, attributeType } = searchFacet;
            const values = Array.from(valuesCheckMap.entries())
                .filter(([, checked]) => checked)
                .map(([facetValueId]) => facetValueId);
            return {
                id,
                nameOrId,
                type,
                attributeType,
                values,
            };
        })
        .filter((mapItem) => mapItem.values.length);
}
