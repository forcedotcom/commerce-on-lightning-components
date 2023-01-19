import { transformMediaContents } from '../productAttachmentsUtils';
import { getProductDetailData } from './data/product.mock';

describe('transformMediaContents', () => {
    it('should return empty array when product data is undefined or invalid', () => {
        const result = transformMediaContents(undefined);
        expect(result).toEqual([]);
    });

    it('should return empty array when url is invalid', () => {
        const product = getProductDetailData(true);
        const result = transformMediaContents(product);
        expect(result[0].url).toBe('');
    });

    it('should return an array of files when the product data is valid', () => {
        const validProduct = getProductDetailData();
        const result = transformMediaContents(validProduct);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            name: 'northerntrailoutfitterscom-nto-alpine-nutrition-default-images-large-alpine-energy-gobar-cranberryjpg',
            url: 'https://s3.amazonaws.com/northerntrailoutfitters.com/nto-alpine-nutrition/default/images/large/alpine-energy-goBAR-cranberry.jpg',
        });
    });
});
