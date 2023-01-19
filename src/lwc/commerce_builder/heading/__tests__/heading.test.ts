import { createElement } from 'lwc';
import Heading from '../heading';
import { getProductDetailData } from './data/product.mock';
import type HeadingPresentational from 'commerce_product_details/heading';

describe('commerce_builder/heading', () => {
    let element: HTMLElement & Heading;

    beforeEach(() => {
        element = createElement('commerce_builder-heading', {
            is: Heading,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should display Only SKU', () => {
        element.product = getProductDetailData();
        element.identifierName = 'SKU #';
        element.productDetailSummaryFieldMapping = '[]';
        const headingSection = <HeadingPresentational & HTMLElement>(
            element.querySelector('commerce_product_details-heading')
        );
        return Promise.resolve().then(() => {
            const fields = headingSection.fields;
            expect(fields).toHaveLength(1);
        });
    });

    it('should display Only SKU and ProductName', () => {
        element.product = getProductDetailData();
        element.identifierName = 'SKU #';
        element.productDetailSummaryFieldMapping =
            '[{"name":"ProductCode","label":"ProductCode","type":"STRING"},{"name":"Name","label":"ProductName","type":"STRING"}]';
        const headingSection = <HeadingPresentational & HTMLElement>(
            element.querySelector('commerce_product_details-heading')
        );
        return Promise.resolve().then(() => {
            const fields = headingSection.fields;
            expect(fields).toHaveLength(2);
        });
    });

    it('should display Only SKU and Description,ProductNameAnd Family', () => {
        element.product = getProductDetailData();
        element.identifierName = 'SKU #';
        element.productDetailSummaryFieldMapping =
            '[{"name":"Description","label":"ProductDescription","type":"TEXTAREA"},{"name":"Name","label":"ProductName","type":"STRING"},{"name":"Family","label":"ProductFamily","type":"PICKLIST"}]';
        return Promise.resolve().then(() => {
            // @ts-ignore
            const headingSection = <HeadingPresentational & HTMLElement>(
                element.querySelector('commerce_product_details-heading')
            );
            const fields = headingSection.fields;
            expect(fields).toHaveLength(4);
        });
    });
});
