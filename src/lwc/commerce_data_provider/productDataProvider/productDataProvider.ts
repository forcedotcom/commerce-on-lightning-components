import { api, wire } from 'lwc';
import { trackAddProductToCart, trackViewProduct } from 'commerce/activitiesApi';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import { createContextBoundary, createContextProvider } from 'experience/context';
import DataProvider, { registerAction } from 'experience/dataProvider';
import { deepEqual } from 'experience/util';
import type { Breadcrumb } from 'commerce/breadcrumbs';
import { BreadcrumbsAdapter } from 'commerce_builder/breadcrumbs';
import type { ProductDetailData, ProductPricingResult, ProductTaxResultData } from 'commerce/productApi';
import { transformToProductTaxResult } from 'commerce/productApiInternal';
import { ProductAdapter, ProductPricingAdapter, ProductTaxAdapter } from 'commerce/productApi';
import { addItemsToCart, addItemToCart } from 'commerce/cartApi';
import { isDataAvailable, transformToBreadcrumbs, updateDataAvailable } from 'commerce_data_provider/utils';
import type { AddItemsToCartActionPayload } from 'commerce/cartApiInternal';
import type {
    AddItemToCartActionPayload,
    ProductData,
    SelectedQuantityChangedPayload,
    VariantChangedActionPayload,
} from './types';
import { transformProductDetailData, updateSelectedQuantity } from './productDataUtils';
import template from './productDataProvider.html';

export type { AddItemToCartActionPayload, VariantChangedActionPayload };

const breadcrumbsContextProvider = createContextProvider(BreadcrumbsAdapter);

/**
 * Data provider that provides exp api data.
 *
 * @extends DataProvider
 */
export default class ProductDataProvider extends DataProvider {
    /**
     * Enable the component to render as light DOM
     *
     * @static
     */
    public static renderMode = 'light';

    private readonly setBreadcrumbs: (breadcrumbs?: Breadcrumb[]) => void;

    html = template;

    @api recordId!: string;

    @api sfdcExpressionKey!: string;

    /**
     * Product data fetched from product stores
     *
     * @type {object}
     */
    protected productData: ProductData = {
        SelectedVariant: {
            isValid: undefined,
            options: undefined,
        },
    };
    /**
     * local variable to keep track of quantity onload and modified quantity - default to 1
     *
     * @type {number}
     *
     */
    quantity: number | undefined;

    /*
     * Retrieves the product detail information.
     */
    @wire(ProductAdapter, {
        productId: '$recordId',
    })
    private wireProduct({ data, loaded }: StoreAdapterCallbackEntry<ProductDetailData>): void {
        updateDataAvailable(this, loaded, 'Details');

        // use "undefined" to indicate data has not been loaded.
        // when error occurs, the data will be empty object.
        this.productData = {
            ...this.productData,
            Details: loaded ? transformProductDetailData(data) || {} : undefined,
        };
        this.quantity = updateSelectedQuantity(this.productData);

        // Provide breadcrumbs to all consumers of the contextual breadcrumbs adapter
        this.setBreadcrumbs(transformToBreadcrumbs(this.productData?.Details?.primaryProductCategoryPath?.path));

        // Sending tracking data to einstein that this product was viewed.
        if (this.productData?.Details?.id) {
            const sku = <string>this.productData?.Details?.fields?.StockKeepingUnit;
            trackViewProduct({
                id: this.productData?.Details?.id,
                sku,
            });
        }
        this.updateComponents();
    }

    /**
     * Retrieves the product price information.
     */
    @wire(ProductPricingAdapter, {
        productId: '$recordId',
        quantity: '$quantity',
    })
    private wireProductPrice({ data, loaded }: StoreAdapterCallbackEntry<ProductPricingResult>): void {
        updateDataAvailable(this, loaded, 'Pricing');

        // use "undefined" to indicate data has not been loaded.
        // when error occurs, the data will be empty object.
        this.productData = {
            ...this.productData,
            Pricing: loaded ? data || {} : undefined,
        };

        // Update components only when call is finished to avoid flickering of components.
        if (loaded) {
            this.updateComponents();
        }
    }

    /**
     * Retrieves the product tax information.
     */
    @wire(ProductTaxAdapter, {
        productId: '$recordId',
    })
    private wireProductTax({ data, loaded }: StoreAdapterCallbackEntry<ProductTaxResultData>): void {
        updateDataAvailable(this, loaded, 'Tax');

        // use "undefined" to indicate data has not been loaded.
        // when error occurs, the data will be empty object.
        const transformedData = transformToProductTaxResult(data)[this.recordId];
        this.productData = {
            ...this.productData,
            Tax: loaded ? transformedData || {} : undefined,
        };
        this.updateComponents();
    }

    constructor() {
        super();
        this.setBreadcrumbs = createContextBoundary(this, breadcrumbsContextProvider);
    }

    // Override for DataProvider getData method
    @api
    getData(): ProductData {
        return this.productData;
    }

    @api
    hasData(): boolean {
        return isDataAvailable(this);
    }

    /**
     * @type Promise<Record<string, unknown>
     * @private
     */
    protected handleAddItemToCart(quantity: number): Promise<Record<string, unknown>> {
        return addItemToCart(this.recordId, quantity).then((fulfilled) => {
            const price = this.productData?.Pricing?.unitPrice || undefined;
            const originalPrice = this.productData?.Pricing?.listPrice || undefined;
            const id = <string>this.productData?.Details?.id;
            const sku = <string>this.productData?.Details?.fields?.StockKeepingUnit;
            const qty = String(quantity);
            // Sending tracking data to einstein that this product was added to cart.
            trackAddProductToCart({
                id,
                sku,
                quantity: qty,
                price,
                originalPrice,
            });
            return fulfilled;
        });
    }

    protected handleAddItemsToCart(payload: AddItemsToCartActionPayload): Promise<Record<string, unknown>> {
        return addItemsToCart(payload);
    }
}

registerAction(
    ProductDataProvider,
    'product:variantChanged',
    function (this: ProductDataProvider, payload: VariantChangedActionPayload): void {
        const isEqual = deepEqual(this.productData.SelectedVariant, payload).value;
        if (!isEqual) {
            const { isValid, options } = payload;
            this.productData = {
                ...this.productData,
                SelectedVariant: {
                    isValid,
                    options,
                },
            };
            this.updateComponents();
        }
    }
);

registerAction(
    ProductDataProvider,
    'product:selectedQuantityChanged',
    function (this: ProductDataProvider, { quantity }: SelectedQuantityChangedPayload): void {
        this.quantity = quantity;
    }
);

registerAction(
    ProductDataProvider,
    'product:addItemToCart',
    function (this: ProductDataProvider, { quantity }: AddItemToCartActionPayload): Promise<Record<string, unknown>> {
        return this.handleAddItemToCart(quantity);
    }
);

registerAction(
    ProductDataProvider,
    'product:addItemsToCart',
    function (this: ProductDataProvider, payload: AddItemsToCartActionPayload): Promise<Record<string, unknown>> {
        return this.handleAddItemsToCart(payload);
    }
);
