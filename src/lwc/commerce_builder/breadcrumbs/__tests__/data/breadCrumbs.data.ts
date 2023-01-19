import type { Breadcrumb } from 'commerce/breadcrumbs';

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
    {
        label: 'Energy Bars (vegan)',
        pageReference: {
            type: 'standard__recordPage',
            attributes: {
                actionName: 'view',
                objectApiName: 'ProductCategory',
                recordId: '0ZGSB00000007G54AI',
            },
            state: {
                categoryPath: 'ProductCategory',
            },
        },
    },
];

export const breadcrumbsLong: Breadcrumb[] = [
    ...breadcrumbs,
    {
        label: 'Energy Bars (vegan squared)',
        pageReference: {
            type: 'standard__recordPage',
            attributes: {
                actionName: 'view',
                objectApiName: 'ProductCategory',
                recordId: '0ZGSB00000007G64AI',
            },
            state: {
                categoryPath: 'ProductCategory',
            },
        },
    },
    {
        label: 'Energy Bars (vegan to the power of three)',
        pageReference: {
            type: 'standard__recordPage',
            attributes: {
                actionName: 'view',
                objectApiName: 'ProductCategory',
                recordId: '0ZGSB00000007G74AI',
            },
            state: {
                categoryPath: 'ProductCategory',
            },
        },
    },
    {
        label: 'Energy Bars (vegan to the power of four)',
        pageReference: {
            type: 'standard__recordPage',
            attributes: {
                actionName: 'view',
                objectApiName: 'ProductCategory',
                recordId: '0ZGSB00000007G84AI',
            },
            state: {
                categoryPath: 'ProductCategory',
            },
        },
    },
];
