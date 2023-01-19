import type { CartItemData } from 'commerce_data_provider/cartDataProvider';

export const sampleCartItemData: CartItemData = {
    id: '0a9xx00000006obAAA',
    name: 'GoBrew Moca MCT + Protein Vegetarian, 6 oz can - 6 pack',
    quantity: 3,
    type: 'Product',
    salesPrice: 13.99,
    adjustmentAmount: 0,
    amount: 41.97,
    listPrice: 59.97,
    price: 41.97,
    tax: 0,
    unitAdjustedPrice: 13.99,
    unitAdjustmentAmount: 0,
    ProductDetails: {
        name: 'GoBrew Moca MCT + Protein Vegetarian, 6 oz can - 6 pack',
        fields: {
            DisplayUrl: null,
            Description: 'Alpine Blends GoBrew Mocha Coffee in 6 oz can.',
            ProductCode: '6010006',
            QuantityUnitOfMeasure: null,
            Family: null,
        },
        purchaseQuantityRule: {
            minimum: '1.00',
            minimumNumber: 1,
            maximum: '10.00',
            maximumNumber: 10,
            increment: '1.00',
            incrementNumber: 1,
        },
        sku: '6010006',
        productId: '01txx0000006lgNAAQ',
        thumbnailImage: {
            alternateText: '',
            contentVersionId: null,
            id: null,
            mediaType: 'Image',
            sortOrder: 0,
            thumbnailUrl: null,
            title: 'image',
            url: '/img/b2b/default-product-image.svg',
        },
        variationAttributes: {
            attributes: [
                {
                    label: 'Flavor',
                    value: 'Chocolate',
                    apiName: 'flavor',
                    sequence: 1,
                },
                {
                    label: 'Size',
                    value: '500mL',
                    apiName: 'size',
                    sequence: 1,
                },
            ],
        },
    },
};
