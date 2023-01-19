import { transformMediaContents, areExpandable } from '../productGalleryUtils';

const mediaGroups = [
    {
        usageType: 'Listing',
    },
    {
        mediaItems: [
            {
                alternateText: null,
                contentVersionId: 'contentVersionId__c',
                id: '2pmxx0000000003AAA',
                mediaType: 'Image',
                sortOrder: 0,
                thumbnailUrl: 'https://thumbnailUrl',
                title: 'title__c',
                url: 'https://url',
            },
            {
                alternateText: null,
                contentVersionId: 'contentVersionId1__c',
                id: '2pmxx0000000003AAA',
                mediaType: 'Image',
                sortOrder: 0,
                thumbnailUrl: null,
                title: 'title__c1',
                url: 'https://url1',
            },
        ],
        usageType: 'Standard',
    },
];

const mediaGroupsWithNoStandardUsage = [
    {
        mediaItems: [],
        usageType: 'Listing',
    },
    {
        usageType: 'Standard',
    },
];

const transformedMediaItems = [
    {
        alternativeText: null,
        id: '2pmxx0000000003AAA',
        smallUrl: 'https://thumbnailUrl',
        fullUrl: 'https://url',
    },
    {
        alternativeText: null,
        id: '2pmxx0000000003AAA',
        smallUrl: 'https://url1',
        fullUrl: 'https://url1',
    },
];

const transformedItemsWithNullId = [
    {
        alternativeText: null,
        id: null,
        smallUrl: 'https://thumbnailUrl',
        fullUrl: 'https://url',
    },
];

describe('commerce_builder/productGallery/productGalleryUtils: Transform media contents', () => {
    describe('transformMediaContents', () => {
        it(`returns an array of MediaItems when id, url and alternate Text are provided`, () => {
            expect(transformMediaContents(mediaGroups)).toEqual(expect.arrayContaining(transformedMediaItems));
        });

        [null, undefined, [], mediaGroupsWithNoStandardUsage].forEach((invalidFields) => {
            it(`returns empty array when field names are not provided or empty: ${JSON.stringify(
                invalidFields
            )}`, () => {
                expect(transformMediaContents(invalidFields)).toHaveLength(0);
            });
        });
    });
});

describe('commerce_builder/productGallery/productGalleryUtils: whether the images are expandable', () => {
    describe('areExpandable', () => {
        it(`returns true when multiple images are available`, () => {
            expect(areExpandable(transformedMediaItems)).toBe(true);
        });

        it(`returns false when the default image is the only image available`, () => {
            expect(areExpandable(transformedItemsWithNullId)).toBe(false);
        });

        [null, undefined, []].forEach((invalidFields) => {
            it(`returns false when no images are available: ${JSON.stringify(invalidFields)}`, () => {
                expect(areExpandable(invalidFields)).toBe(false);
            });
        });
    });
});
