import type { SortOrders } from 'commerce/cartApiInternal';

/**
 * @typedef {Object} SortOption
 * @description Representation of a sort option.
 *
 * @property {string} value The value for the sort option.
 * @property {string} label The label for the sort option.
 */
export type SortOption = {
    value: SortOrders;
    label: string;
};
