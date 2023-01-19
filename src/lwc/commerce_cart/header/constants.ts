import { dateAddedNew, dateAddedOld, nameAZ, nameZA } from './labels';
import type { SortOption } from './types';

export const SORT_OPTIONS: SortOption[] = [
    {
        value: 'CreatedDateDesc',
        label: dateAddedNew,
    },
    {
        value: 'CreatedDateAsc',
        label: dateAddedOld,
    },
    {
        value: 'NameDesc',
        label: nameZA,
    },
    {
        value: 'NameAsc',
        label: nameAZ,
    },
];

export const CHANGE_SORT_ORDER_EVENT = 'cartchangesortorder';
