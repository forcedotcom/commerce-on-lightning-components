import { LightningElement, api, wire } from 'lwc';
import { NavigationContext, navigate } from 'lightning/navigation';
import type { LightningNavigationContext } from 'types/common';
import type { StoreAdapterCallbackEntry, StoreAdapterEntry } from 'experience/store';
import {
    ProductAdapter,
    ProductPricingAdapter,
    ProductTaxAdapter,
    transformToProductTaxResult,
} from 'commerce/productApiInternal';
import type { ProductPricingResult, ProductTaxResult, ProductTaxResultData } from 'commerce/productApiInternal';
import type { ProductDetailData } from 'commerce/productApiInternal';
import { SessionContextAdapter } from 'commerce/contextApi';
import type { SessionContext } from 'commerce/contextApi';
import { DataProviderActionEvent } from 'experience/dataProvider';
import type { AddItemToCartActionPayload } from 'commerce_data_provider/productDataProvider';
import { handleAddToCartErrorWithToast, isAddToCartEnabledForUser } from 'commerce_product_details/addToCartUtils';
import { AppContextAdapter } from 'commerce/contextApi';
import type { AppContext } from 'commerce/contextApi';
import Toast from 'lightning/toast';
import { Labels } from './labels';
import type { CommerceError } from 'commerce/cartApi';

/**
 * A smart component for displaying and interacting with an individual item of a product set.
 */
export default class ProductSetItemContainer extends LightningElement {
    static renderMode = 'light';

    isAddToCartDisabled = false;

    /**
     * The product id of the product to display.
     */
    @api productId: string | undefined;
    /**
     * The quantity of the product set item.
     */
    @api quantity: number | undefined;
    /**
     * Whether the negotiated price should be shown.
     */
    @api showNegotiatedPrice = false;
    /**
     * Whether the original price should be shown.
     */
    @api showOriginalPrice = false;
    /**
     * Whether the tax indication should be shown.
     */
    @api showTaxIndication = false;
    /**
     * Whether the product image should be shown.
     */
    @api showProductImage = false;
    /**
     * Whether the product description should be shown.
     */
    @api showProductDescription = false;

    get isProductLoaded(): boolean {
        return Boolean(this.productEntry?.loaded);
    }

    get product(): ProductDetailData | undefined {
        return this.productEntry?.data;
    }

    get taxLocaleType(): string | undefined {
        return this.appContextEntry?.data?.taxType;
    }

    get productTax(): ProductTaxResult | undefined {
        const transformedData = transformToProductTaxResult(this.productTaxEntry?.data)[<string>this.productId];
        return transformedData;
    }

    get productPricing(): ProductPricingResult | undefined {
        return this.productPriceEntry?.data;
    }

    @wire(NavigationContext)
    navigationContext!: LightningNavigationContext;

    @wire(AppContextAdapter)
    appContextEntry: StoreAdapterEntry<AppContext> | undefined;

    @wire(ProductTaxAdapter, { productId: '$productId' })
    productTaxEntry: StoreAdapterEntry<ProductTaxResultData> | undefined;

    @wire(SessionContextAdapter)
    sessionContext: StoreAdapterCallbackEntry<SessionContext> | undefined;

    @wire(ProductAdapter, { productId: '$productId' })
    productEntry: StoreAdapterEntry<ProductDetailData> | undefined;

    @wire(ProductPricingAdapter, { productId: '$productId', quantity: '$quantity' })
    productPriceEntry: StoreAdapterEntry<ProductPricingResult> | undefined;

    connectedCallback(): void {
        isAddToCartEnabledForUser().then((isEnabled) => (this.isAddToCartDisabled = !isEnabled));
    }

    handleImageSelected(event: CustomEvent): void {
        event.stopPropagation();

        if (this.productId) {
            navigate(this.navigationContext, {
                type: 'standard__recordPage',
                attributes: {
                    objectApiName: 'Product2',
                    recordId: this.productId,
                    actionName: 'view',
                },
                state: {
                    recordName: (this.product?.fields?.Name as string) ?? 'Product2',
                },
            });
        }
    }

    handleAddProductToCart(event: CustomEvent<{ quantity: number }>): void {
        if (this.isAddToCartDisabled) {
            navigate(this.navigationContext, {
                type: 'comm__namedPage',
                attributes: {
                    name: 'Login',
                },
            });

            return;
        }

        const dataProvider = this.querySelector('commerce_data_provider-product-data-provider') as HTMLElement;

        dataProvider.dispatchEvent(
            new DataProviderActionEvent<AddItemToCartActionPayload>(
                'product:addItemToCart',
                {
                    quantity: event.detail.quantity,
                },
                {
                    onError: (error: unknown): void => {
                        handleAddToCartErrorWithToast(error as CommerceError, this);
                    },
                }
            )
        );

        Toast.show(
            {
                label: Labels.productWasAddedToastMessage,
                variant: 'success',
            },
            this
        );
    }
}
