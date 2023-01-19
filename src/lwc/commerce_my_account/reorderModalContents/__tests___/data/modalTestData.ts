import type { OrderActionAddToCartData } from 'commerce/orderApi';

export const REORDER_MODAL_DATA_MULTIPLE: OrderActionAddToCartData = {
    cartId: '0a6RO0000000146YAA',
    totalSucceededProductCount: 2,
    totalFailedProductCount: 2,
    unaddedProducts: [
        {
            errorCode: 'ERROR_PROCESSING_CARTITEM',
            errorMessage: "You can't view 01tRO000000XRg9.",
            productId: '01tRO000000XRg9',
            productName: 'Alpine Energy During Eco Pod, Tart Cherry',
            productSKU: '6010024',
        },
        {
            errorCode: 'ERROR_PROCESSING_CARTITEM',
            errorMessage: "You can't view 01tRO000000XRgF.",
            productId: '01tRO000000XRgF',
            productName: 'Alpine Energy Slim-line Smart Dispenser',
            productSKU: '6010041',
        },
    ],
};

export const REORDER_MODAL_DATA_SINGLE: OrderActionAddToCartData = {
    cartId: '0a6RO0000000146YAA',
    totalSucceededProductCount: 1,
    totalFailedProductCount: 1,
    unaddedProducts: [
        {
            errorCode: 'ERROR_PROCESSING_CART_ITEM',
            errorMessage: "You can't view 0987654321",
            productId: '876587658',
            productName: 'Bella Chrome Coffee Machine',
            productSKU: 'B-C-COFMAC-001',
        },
    ],
};

export const Empty_MODAL_DATA: OrderActionAddToCartData = {
    cartId: '',
    totalSucceededProductCount: 0,
    totalFailedProductCount: 0,
};
