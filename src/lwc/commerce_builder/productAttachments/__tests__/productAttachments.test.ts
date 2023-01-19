import { createElement } from 'lwc';
import { getProductDetailData } from './data/product.mock';
import ProductAttachments from 'commerce_builder/productAttachments';

describe('commerce_builder/productAttachments: Product Attachment Container', () => {
    let element: HTMLElement & ProductAttachments;

    beforeEach(() => {
        element = createElement('commerce_builder-product-attachments', {
            is: ProductAttachments,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should pass down fileIconColor', () => {
        const color = 'rgb(0,0,0)';
        const productData = getProductDetailData();
        element.product = productData;
        element.fileIconColor = color;

        const attachmentComponent = <ProductAttachments & HTMLElement>(
            element.querySelector('commerce_product_details-product-attachments')
        );
        return Promise.resolve().then(() => {
            expect(attachmentComponent.fileIconColor).toBe(color);
        });
    });

    it('should pass down openFilesInNewTab', () => {
        const productData = getProductDetailData();
        element.product = productData;
        element.openFilesInNewTab = false;

        const attachmentComponent = <ProductAttachments & HTMLElement>(
            element.querySelector('commerce_product_details-product-attachments')
        );
        return Promise.resolve().then(() => {
            expect(attachmentComponent.openFilesInNewTab).toBe(false);
        });
    });

    it('is accessible', async () => {
        element.product = getProductDetailData();
        await Promise.resolve();
        await expect(element).toBeAccessible();
    });
});
