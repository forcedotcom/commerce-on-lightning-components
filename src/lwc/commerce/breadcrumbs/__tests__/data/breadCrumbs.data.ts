import type { Breadcrumb } from '../../types';

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
