import type { ProductDetailData, ProductMediaData } from 'commerce/productApiInternal';
import type { File } from 'commerce_product_details/productAttachments';
import { resolve } from 'experience/resourceResolver';

export function transformMediaContents(product: ProductDetailData | undefined): File[] {
    let files: File[] = [];
    const attachmentMediaGroups = (product?.mediaGroups || []).filter((group) => {
        return group.usageType === 'Attachment';
    });
    if (attachmentMediaGroups.length > 0) {
        const mediaItems: ProductMediaData[] = attachmentMediaGroups[0].mediaItems;
        files = mediaItems.map(function (mediaItem: ProductMediaData) {
            return {
                name: mediaItem.title,
                url: resolve(mediaItem.url ? mediaItem.url : ''),
            };
        });
    }
    return files;
}
