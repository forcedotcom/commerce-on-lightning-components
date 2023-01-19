import type { SortRuleData } from 'commerce/searchApiInternal';
import type { LabelValuePair } from 'types/common';

/**
 * The mock sort rule data list
 */
export const sortRuleData: SortRuleData[] = [
    {
        direction: 'Default',
        label: 'Best Match',
        nameOrId: 'Best Match',
        sortRuleId: '0qUxx0000000001',
        type: 'Relevancy',
        sortOrder: 1,
    },
    {
        direction: 'Ascending',
        label: 'Product Name',
        nameOrId: 'Name',
        sortRuleId: '0qUxx0000000002',
        type: 'ProductBased',
        sortOrder: 2,
    },
];

/**
 * The expected sort options
 */
export const sortRuleOptions: LabelValuePair[] = [
    {
        label: 'Best Match',
        value: '0qUxx0000000001',
    },
    {
        label: 'Product Name',
        value: '0qUxx0000000002',
    },
];
