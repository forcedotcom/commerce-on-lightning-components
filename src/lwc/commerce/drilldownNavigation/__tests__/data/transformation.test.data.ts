import type { MenuItemApi } from '../../../navigationMenu/types';

export const apiData: { menuItems: MenuItemApi[] } = {
    menuItems: [
        {
            actionType: 'InternalLink',
            actionValue: '/ernie/s/category/drinks/0ZGRM0000004LID',
            imageUrl: null,
            label: 'Drinks',
            subMenu: [
                {
                    actionType: 'InternalLink',
                    actionValue: '/ernie/s/category/drinks/energy-drinks/0ZGRM0000004LIH',
                    imageUrl: null,
                    label: 'Energy Drinks',
                    subMenu: [],
                    target: 'CurrentWindow',
                },
                {
                    actionType: 'InternalLink',
                    actionValue: '/ernie/s/category/drinks/coffee-2/0ZGRM0000004LLr',
                    imageUrl: null,
                    label: 'Coffee',
                    subMenu: [
                        {
                            actionType: 'InternalLink',
                            actionValue: '/ernie/s/category/drinks/coffee-2/coffee-21/0ZGRM0000004LLw',
                            imageUrl: null,
                            label: 'Coffee 2.1',
                            subMenu: [],
                            target: 'CurrentWindow',
                        },
                    ],
                    target: 'CurrentWindow',
                },
            ],
            target: 'CurrentWindow',
        },
        {
            actionType: 'InternalLink',
            actionValue: '/ernie/s/category/energy/0ZGRM0000004LIF',
            imageUrl: null,
            label: 'Energy',
            subMenu: [
                {
                    actionType: 'InternalLink',
                    actionValue: '/ernie/s/category/energy/energy-bars/0ZGRM0000004LIG',
                    imageUrl: null,
                    label: 'Energy Bars',
                    subMenu: [],
                    target: 'CurrentWindow',
                },
                {
                    actionType: 'InternalLink',
                    actionValue: '/ernie/s/category/energy/energy-gels/0ZGRM0000004LII',
                    imageUrl: null,
                    label: 'Energy Gels',
                    subMenu: [],
                    target: 'CurrentWindow',
                },
            ],
            target: 'CurrentWindow',
        },
        {
            actionType: 'InternalLink',
            actionValue: '/ernie/s/category/products/0ZGRM0000000CA3',
            imageUrl: null,
            label: 'Products',
            subMenu: [],
            target: 'CurrentWindow',
        },
    ],
};
