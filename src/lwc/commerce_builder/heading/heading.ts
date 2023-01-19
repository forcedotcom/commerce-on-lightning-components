import { api, LightningElement } from 'lwc';
import type { ProductDetailData } from 'commerce/productApi';
import { transformProductFields } from './headingHelper';
import type { Field } from './headingHelper';
export type { Field };
export { transformProductFields };

/**
 * @slot heading ({ locked: true, defaultContent: [ { descriptor: "dxp_base/textBlock", attributes: { "textDisplayInfo": "{\"headingTag\": \"h1\", \"textStyle\": \"heading-medium\"}", text: "{!Product.Details.fields.Name}"} }]})
 */
export default class Heading extends LightningElement {
    static renderMode = 'light';
    /**
     * SKU label.
     *
     * @type {string | undefined }
     */
    @api
    identifierName?: string | undefined;
    /**
     * product api.
     *
     * @type {ProductDetailData }
     */
    @api
    product?: ProductDetailData;

    @api
    productDetailSummaryFieldMapping!: string;

    private get currencyCode(): string {
        return <string>this.product?.fields?.CurrencyIsoCode;
    }

    private get productFieldsData(): Field[] | undefined {
        return transformProductFields(this.productDetailSummaryFieldMapping, this.product?.fields, this.identifierName);
    }
}
