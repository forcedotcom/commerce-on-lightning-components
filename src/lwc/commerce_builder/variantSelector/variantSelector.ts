import { api, LightningElement, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { DataProviderActionEvent } from 'experience/dataProvider';
import type { ProductDetailData } from 'commerce/productApi';
import { getVariantStateFromProduct } from 'commerce_product_details/variantSelector';
import type { VariantSelectedEventDetail, VariantSelectorProductState } from 'commerce_product_details/variantSelector';
import type { VariantChangedActionPayload } from 'commerce_data_provider/productDataProvider';
import type { LightningNavigationContext } from 'types/common';

/**
 * @slot heading ({ locked: false, defaultContent: [{ descriptor: "dxp_base/textBlock", attributes: {text: "Product options:", textDisplayInfo: "{\"headingTag\": \"h2\", \"textStyle\": \"body-regular\"}" }}] })
 */
export default class VariantSelector extends LightningElement {
    static renderMode = 'light';

    @api
    product: ProductDetailData | undefined;

    get variantState(): VariantSelectorProductState {
        return getVariantStateFromProduct(this.product);
    }

    @wire(NavigationContext)
    private navContext!: LightningNavigationContext;

    get productClass(): string {
        return <string>this.product?.productClass;
    }

    handleVariantOptionChanged(event: CustomEvent<VariantSelectedEventDetail>): void {
        event.stopPropagation();
        const detail = event.detail;
        this.dispatchEvent(
            new DataProviderActionEvent<VariantChangedActionPayload>('product:variantChanged', {
                isValid: detail.isValid,
                options: detail.options,
            })
        );

        if (detail.isValid && detail.productId) {
            navigate(this.navContext, {
                type: 'standard__recordPage',
                attributes: {
                    objectApiName: 'Product2',
                    recordId: detail.productId,
                    actionName: 'view',
                },
                state: {
                    recordName: 'Product2',
                },
            });
        }
    }

    public renderedCallback(): void {
        this.classList.toggle('slds-hide', !this.variantState.isDisplayable);
    }
}
