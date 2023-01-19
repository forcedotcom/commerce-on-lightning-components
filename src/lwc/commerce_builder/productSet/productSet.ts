import { LightningElement, api, wire } from 'lwc';
import type { ProductSetAddAllToCartEventDetails } from 'commerce_product_details/productSet';
import { DataProviderActionEvent } from 'experience/dataProvider';
import type { StoreAdapterCallbackEntry } from 'experience/store';
import { ProductSetAdapter } from 'commerce/productApiInternal';
import type { ProductChildCollectionRepresentation, ProductDetailData } from 'commerce/productApiInternal';
import { handleAddToCartErrorWithToast, isAddToCartEnabledForUser } from 'commerce_product_details/addToCartUtils';
import Toast from 'lightning/toast';
import { Labels } from './labels';
import type { CommerceError } from 'commerce/cartApiInternal';

/**
 * Builder component for displaying and interacting with a product set.
 * Note, this component will be hidden completely if the provided product is NOT a product set.
 */
export default class ProductSet extends LightningElement {
    static renderMode = 'light';

    isAddAllToCartDisabled = false;

    /**
     * The product to display.
     */
    @api product: ProductDetailData | undefined;
    /**
     * Whether to show the add all to cart button.
     */
    @api showAddAllToCartButton = false;
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

    get isProductSet(): boolean {
        return this.product?.productClass === 'Set';
    }

    get productId(): string | undefined {
        return this.product?.id;
    }

    get productSet(): ProductChildCollectionRepresentation | undefined {
        return this.productSetEntry?.data;
    }

    get isProductSetLoaded(): boolean {
        return Boolean(this.productSetEntry?.loaded);
    }

    @wire(ProductSetAdapter, { productId: '$productId' })
    productSetEntry: StoreAdapterCallbackEntry<ProductChildCollectionRepresentation> | undefined;

    handleAddAllToCart(event: CustomEvent<ProductSetAddAllToCartEventDetails>): void {
        event.stopPropagation();

        this.dispatchEvent(
            new DataProviderActionEvent('product:addItemsToCart', event.detail, {
                onError: (error: unknown): void => {
                    handleAddToCartErrorWithToast(error as CommerceError | undefined, this);
                },
            })
        );

        Toast.show(
            {
                label: Labels.productsWereAddedToastMessage,
                variant: 'success',
            },
            this
        );
    }

    connectedCallback(): void {
        isAddToCartEnabledForUser().then((isEnabled) => (this.isAddAllToCartDisabled = !isEnabled));
    }

    renderedCallback(): void {
        this.classList.toggle('slds-hide', !this.isProductSet);
    }
}
