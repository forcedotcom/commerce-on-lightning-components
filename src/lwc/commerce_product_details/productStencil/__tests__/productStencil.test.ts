import { createElement } from 'lwc';

import ProductStencil from 'commerce_product_details/productStencil';

describe('commerce_product_details/productStencil', () => {
    let element: HTMLElement & ProductStencil;

    beforeEach(() => {
        element = createElement('commerce_product_information-product-stencil', {
            is: ProductStencil,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('displays the correct number of default items', () => {
        const items = element.querySelectorAll('.stencil-item-container');
        expect(items).toHaveLength(3);
    });

    it('api returns correct number of default items', () => {
        expect(element.itemCount).toBe(3);
    });

    it('sets number of items correctly', async () => {
        element.itemCount = 10;
        await Promise.resolve();
        const items = element.querySelectorAll('.stencil-item-container');
        expect(items).toHaveLength(10);
    });
});
