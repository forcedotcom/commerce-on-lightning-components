import { api, wire } from 'lwc';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import DataProvider, { registerAction } from 'experience/dataProvider';
import type { CartItemCollectionData, CartItemSummaryData, CartSummaryData } from 'commerce/cartApi';
import {
    CartItemsAdapter,
    CartSummaryAdapter,
    deleteCurrentCart,
    deleteItemFromCart,
    updateItemInCart,
} from 'commerce/cartApi';
import { defaultSortOrder } from 'commerce/config';
import type { SortOrders, CartItemData as ConnectCartItemData } from 'commerce/cartApiInternal';
import { showMoreCartItems } from 'commerce/cartApiInternal';
import type {
    CartData,
    CartItemData,
    DetailsData,
    DetailsDataBase,
    ProductDetailsData,
    CartItemNumberData,
    CartItemNumberStringsData,
    ConnectTotalsData,
    TotalsData,
    UpdateItemActionPayLoad,
    CartItemDescData,
} from './types';
import { isDataAvailable, updateDataAvailable } from 'commerce_data_provider/utils';

export type { CartItemData, UpdateItemActionPayLoad, ProductDetailsData } from './types';

/**
 * @description Function to remap data with a subset of keys with potentially different names
 * @param dataMap The map of the keys to new key name found in data
 * @param data the original data to be remapped
 * @private
 */
function remapData<T extends Record<string, unknown>>(
    dataMap: Record<string, string>,
    data: Record<string, unknown>
): T {
    return Object.entries(dataMap).reduce((acc: Record<string, unknown>, [newName, originalName]: [string, string]) => {
        acc[newName] = data[originalName];
        return <T>acc;
    }, {} as T);
}

/**
 * @description create the DetailsData record from the api response and transform the
 * totalProductCount from the api from a string to a number
 * @param {CartSummaryData | undefined} data
 * @param {Record<string, string>} detailsMap
 * @return {DetailsData | undefined}  {(DetailsData | undefined)}
 */
function transformCartDetails(
    data: CartSummaryData | undefined,
    detailsMap: Record<string, string>
): DetailsData | undefined {
    if (!data) {
        return undefined;
    }
    const tempDetails: DetailsDataBase = remapData<DetailsDataBase>(detailsMap, data);
    const totalProductCount = parseFloat(<string>data.totalProductCount);

    return <DetailsData>{ ...tempDetails, totalProductCount };
}

/**
 * @description create the TotalsData record from the api response and transform the
 * numerical fields that are strings to numbers
 * @param {(CartSummaryData | undefined)} data
 * @param {Record<string, string>} totalsMap
 * @return {*}  {(TotalsData | undefined)}
 */
function transformCartTotals(
    data: CartSummaryData | undefined,
    totalsMap: Record<string, string>
): TotalsData | undefined {
    if (!data) {
        return undefined;
    }
    const tempTotals: ConnectTotalsData = remapData<ConnectTotalsData>(totalsMap, data);
    const totals: TotalsData = <TotalsData>{};

    for (const key in tempTotals) {
        if (!tempTotals[key as keyof ConnectTotalsData]) {
            totals[key as keyof TotalsData] = undefined;
        } else {
            totals[key as keyof TotalsData] = parseFloat(<string>tempTotals[key as keyof ConnectTotalsData]);
        }
    }

    return totals;
}

/**
 * @description create the cartItemNumberData record from the api response and transform the
 * numerical fields that are strings to numbers
 * @param {ConnectCartItemData} cartItemData
 * @param {Record<string, string>} itemDataMap
 * @return {CartItemNumberData}
 */
function transformCartItemData(
    cartItemData: ConnectCartItemData,
    itemDataMap: Record<string, string>
): CartItemNumberData {
    const cartItemNumberData = <CartItemNumberData>{};

    const tempCartItemData: CartItemNumberStringsData = remapData<CartItemNumberStringsData>(itemDataMap, cartItemData);

    for (const key in tempCartItemData) {
        if (!tempCartItemData[key as keyof CartItemNumberData]) {
            cartItemNumberData[key as keyof CartItemNumberData] = undefined;
        } else {
            cartItemNumberData[key as keyof CartItemNumberData] = parseFloat(
                <string>tempCartItemData[key as keyof CartItemNumberStringsData]
            );
        }
    }

    return cartItemNumberData;
}

/**
 * Data provider that provides cart api data.
 *
 * @extends DataProvider
 */
export default class CartDataProvider extends DataProvider {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    static renderMode = 'light'; // default is 'shadow'

    /**
     * The key identifier for the expressions
     */
    @api
    sfdcExpressionKey!: string;

    /**
     * @description CartSummary data fetched from CartSummary stores
     */
    protected cartData?: CartData;

    /**
     * @description Sort order value to be sent to the API, which will determine
     * the order that the cart items are listed
     * @protected
     */
    protected sortOrder?: SortOrders = defaultSortOrder;

    /**
     * @description Token that is used for fetching the next page of items.  If null, then
     * there is no next page.
     * @protected
     */
    protected nextPageToken?: string | null;

    /**
     * @description Retrieves the Cart Summary information.
     */
    @wire(CartSummaryAdapter)
    private wireCartSummary({ data, loaded }: StoreAdapterCallbackEntry<CartSummaryData>): void {
        updateDataAvailable(this, loaded, 'Details');
        updateDataAvailable(this, loaded, 'Totals');

        //The Details fields we want to put into Details
        const detailsMap: Record<string, string> = {
            accountId: 'accountId',
            cartId: 'cartId',
            currencyIsoCode: 'currencyIsoCode',
            name: 'name',
            status: 'status',
            taxType: 'taxType',
            type: 'type',
            webstoreId: 'webstoreId',
            uniqueProductCount: 'uniqueProductCount',
        };
        //The totals keys we want to rename and put into Totals
        const totalsMap: Record<string, string> = {
            grandTotal: 'grandTotalAmount',
            chargeAmount: 'totalChargeAmount',
            listPrice: 'totalListPrice',
            adjustedProductAmount: 'totalProductAmountAfterAdjustments',
            productAmount: 'totalProductAmount',
            promotionalAdjustmentAmount: 'totalPromotionalAdjustmentAmount',
            taxAmount: 'totalTaxAmount',
        };

        this.cartData = {
            ...this.cartData,
            //remap the existing CartSummaryData into Details or Totals data using the helper function
            Details: transformCartDetails(data, detailsMap),
            Totals: transformCartTotals(data, totalsMap),
        };
        this.updateComponents();
    }

    /**
     * @description Retrieves the Cart Item Collection Data.
     * If `loaded` is false, Items = undefined
     * If `loaded` is true, and cart is empty, Items = []
     */
    @wire(CartItemsAdapter, {
        sortOrder: '$sortOrder',
        productFieldNames: ['DisplayUrl', 'ProductCode', 'Description', 'Family', 'QuantityUnitOfMeasure'],
    })
    private wireCartItems({ data, loaded }: StoreAdapterCallbackEntry<CartItemCollectionData>): void {
        updateDataAvailable(this, loaded, 'Items');
        updateDataAvailable(this, loaded, 'Pagination');

        this.nextPageToken = data?.nextPageToken;
        this.cartData = {
            ...this.cartData,
            Items: this.remapCartItems(data?.cartItems ?? (loaded ? [] : undefined)),
            Pagination: {
                hasNextPage: data?.nextPageToken ? true : false,
            },
        };
        this.updateComponents();
    }

    /**
     * @description Override for DataProvider getData method
     * @return {CartData} All data
     */
    @api
    getData(): CartData | undefined {
        return this.cartData;
    }

    @api
    hasData(): boolean {
        return isDataAvailable(this);
    }

    /**
     * @description Re-map the response from the API to the desired format.  Returns an empty
     * array if no data provided
     * @private
     * @param cartItemSummaryData Item summary data as returned by the API
     * @return Remapped list of CartItemData
     */
    protected remapCartItems(cartItemSummaryData: CartItemSummaryData[] | undefined): CartItemData[] | undefined {
        if (!cartItemSummaryData) {
            return undefined;
        }

        const cartItemDescDataMap = {
            id: 'cartItemId',
            name: 'name',
            type: 'type',
        };

        const cartItemNumberDataMap = {
            quantity: 'quantity',
            salesPrice: 'salesPrice',
            adjustmentAmount: 'totalAdjustmentAmount',
            amount: 'totalAmount',
            listPrice: 'totalListPrice',
            price: 'totalPrice',
            tax: 'totalTax',
            unitAdjustedPrice: 'unitAdjustedPrice',
            unitAdjustmentAmount: 'unitAdjustmentAmount',
        };

        const productDetailsDataMap = {
            name: 'name',
            fields: 'fields',
            purchaseQuantityRule: 'purchaseQuantityRule',
            sku: 'sku',
            thumbnailImage: 'thumbnailImage',
            productId: 'productId',
            variationAttributes: 'variationAttributes',
        };

        const remappedCartItems = <CartItemData[]>cartItemSummaryData.map((cartItemSummary) => {
            const cartItem = cartItemSummary.cartItem;
            const cartItemDataBase = remapData<CartItemDescData>(
                cartItemDescDataMap,
                <Record<string, unknown>>cartItem
            );
            const cartItemNumberData = transformCartItemData(cartItem, cartItemNumberDataMap);
            const productDetailData = remapData<ProductDetailsData>(
                productDetailsDataMap,
                <Record<string, unknown>>cartItem?.productDetails
            );
            return {
                ...cartItemDataBase,
                ...cartItemNumberData,
                ProductDetails: productDetailData,
            };
        });

        return remappedCartItems;
    }
}

/**
 * @description Action handler to change the order of the items in the cart
 */
registerAction(CartDataProvider, 'cart:changeSortOrder', function (this: CartDataProvider, payload: SortOrders): void {
    this.sortOrder = payload;
});

/**
 * @description Action handler to clear all of the items in the cart
 */
registerAction(CartDataProvider, 'cart:clear', function (this: CartDataProvider): Promise<Record<string, unknown>> {
    return deleteCurrentCart();
});

/**
 * @description Action handler to update the quantity of an item in the cart
 * @param {string} payload CartItemCollectionData.cartItem.cartItemId
 */
registerAction(
    CartDataProvider,
    'cart:updateItem',
    function (
        this: CartDataProvider,
        { cartItemId, quantity }: UpdateItemActionPayLoad
    ): Promise<Record<string, unknown>> {
        return updateItemInCart(cartItemId, quantity);
    }
);

/**
 * @description Action handler to delete an item in the cart
 * @param {string} payload CartItemCollectionData.cartItem.cartItemId
 */
registerAction(CartDataProvider, 'cart:deleteItem', function (this: CartDataProvider, payload: string): Promise<
    Record<string, unknown>
> {
    return deleteItemFromCart(payload);
});

/**
 * @description Action handler to retrieve the next page of cart items if there is one
 */
registerAction(CartDataProvider, 'cart:showMoreItems', async function (this: CartDataProvider): Promise<
    CartItemCollectionData | Record<string, unknown>
> {
    if (this.nextPageToken && this.cartData?.Items) {
        const data = await showMoreCartItems(this.nextPageToken);

        this.nextPageToken = data?.nextPageToken;

        const currentItems = this.cartData.Items;
        const nextPageItems = this.remapCartItems(data?.cartItems) ?? [];
        const updatedItems = [...currentItems, ...nextPageItems];

        this.cartData = {
            ...this.cartData,
            Items: updatedItems,
            Pagination: {
                hasNextPage: data?.nextPageToken ? true : false,
            },
        };

        this.updateComponents();

        return data;
    }

    return {};
});
