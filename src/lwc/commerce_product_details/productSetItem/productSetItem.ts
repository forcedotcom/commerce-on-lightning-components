import { LightningElement, api } from 'lwc';
import type { ProductMediaData, PurchaseQuantityRule } from 'commerce/productApiInternal';
import type { ProductTaxResult } from 'commerce/productApiInternal';
import type { ProductDetailData, ProductPricingResult } from 'commerce/productApiInternal';
import type { ProductSetItemQuantityChangedEventDetails, VariantChangedEventDetails } from './types';
import type { VariantSelectedEventDetail, VariantSelectorProductState } from 'commerce_product_details/variantSelector';
import type { ChangeEventDetail } from 'commerce/numberInput';
import { getVariantStateFromProduct } from 'commerce_product_details/variantSelector';
import { resolve } from 'experience/resourceResolver';
import { addToCartButtonText, quantitySelectorText } from './labels';
import { deepFreeze } from 'experience/util';

export type { ProductSetItemQuantityChangedEventDetails, VariantChangedEventDetails } from './types';

export const QUANTITY_CHANGED_EVENT_NAME = 'quantitychanged';
export const VARIANT_CHANGED_EVENT_NAME = 'variantchanged';
export const IMAGE_SELECTED_EVENT_NAME = 'imageselected';

type VariantState = Pick<VariantSelectedEventDetail, 'isValid' | 'options'>;

interface Field {
    value: string;
    type: string;
}

const PRODUCT_FIELDS = deepFreeze([
    { name: 'Name', type: 'STRING' },
    { name: 'Description', type: 'TEXTAREA' },
]).value;

/**
 * A presentational component for displaying an item of a product set.
 */
export default class ProductSetItem extends LightningElement {
    static renderMode = 'light';

    /**
     * The tax result for the product.
     */
    @api productTax: ProductTaxResult | undefined;
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
     * Text to be displayed for the add to cart button.
     */
    @api addToCartButtonText: string | undefined;
    /**
     * The quantity label.
     */
    @api quantityLabel: string | undefined;
    /**
     * Whether the add to cart button is disabled by the parent.
     * The button will still be disabled if the product is a variation and invalid
     * regardless of the parent component.
     */
    @api addToCartDisabled = false;
    /**
     * Whether the add to cart button is disabled.
     */
    @api taxLocaleType: string | undefined;
    /**
     * The pricing result for the product.
     */
    @api productPricing: ProductPricingResult | undefined;
    /**
     * The product to display.
     */
    @api
    product: ProductDetailData | undefined;
    /**
     * Whether the product image should be shown.
     */
    @api showProductImage = false;
    /**
     * Whether the product description should be shown.
     */
    @api showProductDescription = false;

    /**
     * The quantity for the quantity selector.
     */
    @api
    set quantity(qty: number | undefined) {
        this._quantity = qty;
    }

    get quantity(): number | undefined {
        return this._quantity;
    }

    get isProductSet(): boolean {
        return this.product?.productClass === 'Set';
    }

    get variantState(): VariantSelectorProductState {
        return getVariantStateFromProduct(this.product);
    }

    get currencyIsoCode(): string | null | undefined {
        return this.productPricing?.currencyIsoCode;
    }

    get negotiatedPrice(): string | null | undefined {
        return this.productPricing?.negotiatedPrice;
    }

    get originalPrice(): string | null | undefined {
        return this.productPricing?.listPrice;
    }

    private get productId(): string | undefined {
        return this.product?.id;
    }

    get addToCartButtonLabel(): string {
        return this.addToCartButtonText || addToCartButtonText;
    }

    get productVariant(): VariantState | undefined {
        return this._productVariant;
    }

    get productImage(): ProductMediaData | undefined {
        return this.product?.mediaGroups?.filter((group) => group.usageType === 'Listing')[0]?.mediaItems?.[0];
    }

    get imageUrl(): string | undefined {
        const productImage = this.productImage;
        const url = productImage?.thumbnailUrl || productImage?.url || '';
        // We are leveraging the CMS api to deliver scaled images.
        // 100px is the minimum allowed by the API
        return resolve(url, false, {
            height: 100,
            width: 100,
        });
    }

    get isProductImageVisible(): boolean {
        return Boolean(this.showProductImage && this.hasProductImage);
    }

    get hasProductImage(): boolean {
        return Boolean(this.productImage);
    }

    get currencyCode(): string {
        return <string>this.product?.fields?.CurrencyIsoCode;
    }

    get productClass(): string | undefined {
        return this.product?.productClass;
    }

    get taxRate(): number | undefined {
        const taxOrNaN = Number(this.productTax?.taxPolicies?.[0]?.taxRatePercentage);

        return Number.isFinite(taxOrNaN) ? taxOrNaN : undefined;
    }

    get isAddToCartDisabled(): boolean {
        return (
            this.addToCartDisabled ||
            (this.productVariant && !this.productVariant.isValid) ||
            this.productClass === 'VariationParent'
        );
    }

    get quantitySelectorLabel(): string {
        return this.quantityLabel ?? quantitySelectorText;
    }

    get quantityRule(): PurchaseQuantityRule | null | undefined {
        return this.product?.purchaseQuantityRule;
    }

    get productFieldsData(): Field[] | undefined {
        const productFields = this.product?.fields ?? {};

        return PRODUCT_FIELDS.reduce((fields, field) => {
            const fieldValue =
                this.showProductDescription || field.name !== 'Description'
                    ? (productFields[field.name] as string)
                    : undefined;

            if (fieldValue?.length) {
                fields.push({
                    value: fieldValue,
                    type: field.type,
                });
            }

            return fields;
        }, [] as Field[]);
    }

    get isPriceVisible(): boolean {
        return (
            this.productVariant?.isValid !== false &&
            this.productClass !== 'VariationParent' &&
            Boolean(this.productPricing)
        );
    }

    private _quantity: number | undefined;
    private _productVariant: VariantState | undefined;

    /**
     * Handles when the quantity of the product changes.
     *
     * @fires ProductSetItem#quantitychanged
     */
    handleQuantityChanged(event: CustomEvent<ChangeEventDetail>): void {
        event.stopPropagation();

        this._quantity = event.detail.value;

        if (this.productId) {
            this.dispatchEvent(
                new CustomEvent<ProductSetItemQuantityChangedEventDetails>(QUANTITY_CHANGED_EVENT_NAME, {
                    bubbles: true,
                    composed: true,
                    detail: {
                        quantity: this._quantity,
                        productId: this.productId,
                        isValid: event.detail.isValid,
                    },
                })
            );
        }
    }

    /**
     * Handles when the variation of the product changes.
     *
     * @fires ProductSetItem#variantchanged
     */
    handleVariantChanged(event: CustomEvent<VariantSelectedEventDetail>): void {
        event.stopPropagation();

        this._productVariant = {
            isValid: event.detail.isValid,
            options: event.detail.options,
        };

        this.dispatchEvent(
            new CustomEvent<VariantChangedEventDetails>(VARIANT_CHANGED_EVENT_NAME, {
                bubbles: true,
                composed: true,
                detail: {
                    variantProductId: event.detail.productId,
                    isValid: event.detail.isValid,
                },
            })
        );
    }

    /**
     * Handles the product image is clicked.
     *
     * @fires ProductSetItem#imageselected
     */
    handleImageSelected(event: CustomEvent): void {
        event.stopPropagation();
        this.dispatchEvent(
            new CustomEvent(IMAGE_SELECTED_EVENT_NAME, {
                bubbles: true,
                composed: true,
            })
        );
    }
}
