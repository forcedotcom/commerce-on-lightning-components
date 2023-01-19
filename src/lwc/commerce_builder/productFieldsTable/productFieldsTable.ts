import type { ProductDetailData } from 'commerce/productApiInternal';
import type { Field } from 'commerce_product_details/fieldsTable';
import { api, LightningElement } from 'lwc';
import { transformProductData } from './productFieldsTableUtils';

/**
 * This is the container component of commerce_product_details/fieldsTable
 */
export default class ProductFieldsTable extends LightningElement {
    static renderMode = 'light';

    /**
     * The product record data
     */
    @api
    product?: ProductDetailData;

    /**
     * The product field metadata
     */
    @api
    productDetailDataContentMapping!: string;

    /**
     * Get the currency iso code
     */
    private get currencyCode(): string {
        return <string>this.product?.fields?.CurrencyIsoCode;
    }

    /**
     * Get the transformed Field objects
     */
    private get fields(): Field[] {
        return transformProductData(this.productDetailDataContentMapping, this.product);
    }
}
