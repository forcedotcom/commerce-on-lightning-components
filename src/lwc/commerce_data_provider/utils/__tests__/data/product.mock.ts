import type { ProductCategoryPathItemData } from 'commerce/productApiInternal';
import type { Breadcrumb } from 'commerce/breadcrumbs';

export const primaryProductCategoryPath: ProductCategoryPathItemData[] = [
    {
        description: null,
        id: '0ZGSB00000007G34AI',
        name: 'Energy',
    },
    {
        description: null,
        id: '0ZGSB00000007G44AI',
        name: 'Energy Bars',
    },
];

export const breadcrumbs: Breadcrumb[] = [
    {
        label: 'Energy',
        pageReference: {
            type: 'standard__recordPage',
            attributes: {
                actionName: 'view',
                objectApiName: 'ProductCategory',
                recordId: '0ZGSB00000007G34AI',
            },
            state: {
                categoryPath: 'ProductCategory',
            },
        },
    },
    {
        label: 'Energy Bars',
        pageReference: {
            type: 'standard__recordPage',
            attributes: {
                actionName: 'view',
                objectApiName: 'ProductCategory',
                recordId: '0ZGSB00000007G44AI',
            },
            state: {
                categoryPath: 'ProductCategory',
            },
        },
    },
];
