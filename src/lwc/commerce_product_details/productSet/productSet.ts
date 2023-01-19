import { LightningElement, api } from 'lwc';
import type { ProductChildCollectionRepresentation, ProductDetailData } from 'commerce/productApiInternal';
import type {
    ProductSetItemQuantityChangedEventDetails,
    VariantChangedEventDetails,
} from 'commerce_product_details/productSetItem';
import type { ProductSetAddAllToCartEventDetails } from './types';
import { Labels } from './labels';

export type { ProductSetAddAllToCartEventDetails };

export const ADD_ALL_TO_CART_EVENT_NAME = 'addalltocart';

interface ProductSetItemData {
    id: ProductDetailData['id'];
    quantity: number | undefined;
    index: string;
}

interface ProductSetItemState {
    productId: string;
    productClass: string;
    quantity: number;
    isValid: boolean;
    isQuantityValid: boolean;
}

/**
 * The presentational component for displaying a product set.
 */
export default class ProductSet extends LightningElement {
    static renderMode = 'light';

    private _productOrder: ProductSetItemState[] = [];
    private _productSet: ProductChildCollectionRepresentation | undefined;
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
     * Whether the add all to cart button is disabled by the parent.
     * The button will still disable if a child product is not valid
     * regardless of the parent binding.
     */
    @api addAllToCartDisabled = false;
    /**
     * Whether the product image should be shown.
     */
    @api showProductImage = false;
    /**
     * Whether the product description should be shown.
     */
    @api showProductDescription = false;

    get products(): ProductSetItemData[] {
        return this._productOrder.map((productSetItem, index) => {
            return {
                id: productSetItem?.productId,
                quantity: productSetItem?.quantity,
                index: `productSetIndex${index}`,
            };
        });
    }

    get areProductsValid(): boolean {
        return this._productOrder.every(({ isValid, isQuantityValid }) => isValid && isQuantityValid);
    }

    get isAddToCartDisabled(): boolean {
        return this.addAllToCartDisabled || !this.areProductsValid;
    }

    get addAllToCartButtonText(): string {
        return Labels.addAllToCartButtonText;
    }

    /**
     * The product set data to display.
     */
    @api
    set productSet(value: ProductChildCollectionRepresentation | undefined) {
        this._productSet = value;
        if (value?.items && Array.isArray(value?.items)) {
            this._productOrder = Array.from(value?.items, (item) => {
                const quantity = parseFloat(item.defaultQuantity);
                return {
                    productId: item.productInfo.id,
                    isQuantityValid: true,
                    quantity: Number.isFinite(quantity) ? quantity : 1,
                    isValid: item.productInfo.productClass !== 'VariationParent',
                    productClass: item.productInfo.productClass,
                } as ProductSetItemState;
            });
        }
    }

    get productSet(): ProductChildCollectionRepresentation | undefined {
        return this._productSet;
    }

    /**
     * Handles when the add all to cart button is clicked.
     *
     * @fires ProductSet#addalltocartclicked
     */
    handleAddAllToCartClick(event: Event): void {
        event.stopPropagation();

        const payload = this._productOrder.reduce((res, item) => {
            const isProductSet = item.productClass === 'Set';

            return isProductSet
                ? res
                : Object.assign(res, {
                      [item.productId]: res[item.productId] ? res[item.productId] + item.quantity : item.quantity,
                  });
        }, {} as Record<string, number>);

        this.dispatchEvent(
            new CustomEvent<ProductSetAddAllToCartEventDetails>(ADD_ALL_TO_CART_EVENT_NAME, {
                bubbles: true,
                composed: true,
                detail: payload,
            })
        );
    }

    /**
     * Handles the quantity changed event.
     */
    handleQuantityChanged(event: CustomEvent<ProductSetItemQuantityChangedEventDetails>): void {
        const {
            detail: { quantity, isValid },
        } = event;

        const index = (<HTMLElement>event.currentTarget).dataset.index;

        // Update the quantity and quantity validity for the product changed.
        if (index) {
            const parsedIndex = parseInt(index, 10);
            if (Number.isInteger(parsedIndex) && parsedIndex >= 0) {
                this._productOrder = [
                    ...this._productOrder.slice(0, parsedIndex),
                    {
                        ...this._productOrder[parsedIndex],
                        isQuantityValid: isValid,
                        quantity: quantity,
                    },
                    ...this._productOrder.slice(parsedIndex + 1),
                ];
            }
        }
    }

    /**
     * Handles when a variation is changed.
     */
    handleVariantChanged(event: CustomEvent<VariantChangedEventDetails>): void {
        const { detail } = event;

        event.stopPropagation();
        const index = (<HTMLElement>event.currentTarget).dataset.index;
        if (index) {
            const parsedIndex = parseInt(index, 10);
            // Maintain the order of the products in the sets when switching the old parent or Variant product Id with the new variant product Id
            if (Number.isInteger(parsedIndex) && parsedIndex >= 0) {
                if (detail.variantProductId && detail.isValid) {
                    this._productOrder = [
                        ...this._productOrder.slice(0, parsedIndex),
                        {
                            productId: detail.variantProductId,
                            productClass: 'Variation',
                            quantity: 1,
                            isValid: detail.isValid,
                            isQuantityValid: true,
                        },
                        ...this._productOrder.slice(parsedIndex + 1),
                    ];
                } else {
                    this._productOrder = [
                        ...this._productOrder.slice(0, parsedIndex),
                        {
                            ...this._productOrder[parsedIndex],
                            isValid: false,
                        },
                        ...this._productOrder.slice(parsedIndex + 1),
                    ];
                }
            }
        }
    }
}
