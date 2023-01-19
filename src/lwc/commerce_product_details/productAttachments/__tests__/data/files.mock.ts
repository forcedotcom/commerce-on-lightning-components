import type { File } from 'commerce_product_details/productAttachments';
export function getFile(): File[] {
    return [
        {
            name: 'image1',
            url: 'url1',
        },
        {
            name: 'image2',
            url: 'url2',
        },
    ];
}
