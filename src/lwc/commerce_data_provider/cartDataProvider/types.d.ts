import type { CartSummaryData, CartItemData as ConnectorCartItemData, CartProductDetailData } from 'commerce/cartApi';

export declare type CartData = {
    Details?: DetailsData;
    Totals?: TotalsData;
    Items?: CartItemData[];
    Pagination?: PaginationData;
};

export declare type OriginalTotalsData = Pick<
    CartSummaryData,
    | 'grandTotalAmount'
    | 'totalChargeAmount'
    | 'totalListPrice'
    | 'totalProductAmount'
    | 'totalProductAmountAfterAdjustments'
    | 'totalPromotionalAdjustmentAmount'
    | 'totalTaxAmount'
>;

export declare type ConnectTotalsData = {
    [K in keyof OriginalTotalsData as {
        grandTotalAmount: 'grandTotal';
        totalChargeAmount: 'chargeAmount';
        totalListPrice: 'listPrice';
        totalProductAmount: 'productAmount';
        totalProductAmountAfterAdjustments: 'adjustedProductAmount';
        totalPromotionalAdjustmentAmount: 'promotionalAdjustmentAmount';
        totalTaxAmount: 'taxAmount';
    }[K]]: OriginalTotalsData[K];
};

export declare type TotalsData = {
    grandTotal: number | undefined;
    chargeAmount: number | undefined;
    listPrice: number | undefined;
    productAmount: number | undefined;
    adjustedProductAmount: number | undefined;
    promotionalAdjustmentAmount: number | undefined;
    taxAmount: number | undefined;
};

export declare type DetailsDataBase = Pick<
    CartSummaryData,
    | 'accountId'
    | 'cartId'
    | 'currencyIsoCode'
    | 'name'
    | 'status'
    | 'taxType'
    | 'type'
    | 'webstoreId'
    | 'uniqueProductCount'
>;

//original type for totalProductCount is string, but we want a number
export declare type DetailsData = DetailsDataBase & {
    totalProductCount: number;
};

/**
 * @property cartItemId CartItemSummaryData.cartItem.cartItemId
 * @property quantity Quantity of item to update to
 */
export declare type UpdateItemActionPayLoad = {
    cartItemId: string;
    quantity: number;
};

export declare type OriginalCartItemData = Pick<
    ConnectorCartItemData,
    | 'cartItemId'
    | 'name'
    | 'quantity'
    | 'salesPrice'
    | 'totalAdjustmentAmount'
    | 'totalAmount'
    | 'totalListPrice'
    | 'totalPrice'
    | 'totalTax'
    | 'type'
    | 'unitAdjustedPrice'
    | 'unitAdjustmentAmount'
    | 'productDetails'
>;

declare type CartItemDescData = {
    [K in keyof OriginalCartItemData as {
        cartItemId: 'id';
        name: 'name';
        type: 'type';
    }[K]]: OriginalCartItemData[K];
};

export declare type CartItemNumberData = {
    quantity: number | undefined;
    salesPrice: number | undefined;
    adjustmentAmount: number | undefined;
    amount: number | undefined;
    listPrice: number | undefined;
    price: number | undefined;
    tax: number | undefined;
    unitAdjustedPrice: number | undefined;
    unitAdjustmentAmount: number | undefined;
};

//temp type used to remap the property names before we convert the types
export declare type CartItemNumberStringsData = {
    quantity: string | undefined;
    salesPrice: string | undefined;
    adjustmentAmount: string | undefined;
    amount: string | undefined;
    listPrice: string | undefined;
    price: string | undefined;
    tax: string | undefined;
    unitAdjustedPrice: string | undefined;
    unitAdjustmentAmount: string | undefined;
};

export declare type CartItemData = CartItemDescData &
    CartItemNumberData & {
        ProductDetails: ProductDetailsData;
    };

export declare type ProductDetailsData = Pick<
    CartProductDetailData,
    'fields' | 'purchaseQuantityRule' | 'sku' | 'thumbnailImage' | 'variationAttributes' | 'name' | 'productId'
>;

export declare type PaginationData = {
    hasNextPage?: boolean;
};
