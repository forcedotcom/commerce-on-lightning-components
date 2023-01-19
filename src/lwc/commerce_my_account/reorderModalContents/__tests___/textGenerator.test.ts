import { generateModalHeading, generateModalSubheading } from '../textGenerator';

// Mock the labels with known values.
jest.mock('../labels', () => ({
    successfullyAddedToCart: 'All items were added to cart',
    itemsNotAvailableInStoreHeaderText: 'Some items are unavailable',
    noItemsAvailableHelpText: 'We could not add any items to your cart, items are unavailable or out of stock.',
    itemsAddedItemNotAvailableInStoreHelpText:
        'We added {0} items to your cart, but 1 item is unavailable or out of stock:',
    itemAddedItemsNotAvailableInStoreHelpText:
        'We added 1 item to your cart, but {0} items are unavailable or out of stock:',
    itemAddedItemNotAvailableInStoreHelpText:
        'We added 1 item to your cart, but 1 item is unavailable or out of stock:',
    itemsAddedItemsNotAvailableInStoreHelpText:
        'We added {0} items to your cart, but {1} items are unavailable or out of stock:',
}));

describe('commerce_myAccount/reorderModal: Text Generator', () => {
    it('Test generateModalHeading', () => {
        expect(generateModalHeading(1, 0)).toBe('All items were added to cart');
        expect(generateModalHeading(1, 1)).toBe('Some items are unavailable');
        expect(generateModalHeading(0, 1)).toBe('Some items are unavailable');
        expect(generateModalHeading(0, 0)).toBe('Some items are unavailable');
    });

    it('Test generateModalSubheading', () => {
        expect(generateModalSubheading(2, 1)).toBe(
            'We added 2 items to your cart, but 1 item is unavailable or out of stock:'
        );
        expect(generateModalSubheading(1, 2)).toBe(
            'We added 1 item to your cart, but 2 items are unavailable or out of stock:'
        );
        expect(generateModalSubheading(1, 1)).toBe(
            'We added 1 item to your cart, but 1 item is unavailable or out of stock:'
        );
        expect(generateModalSubheading(2, 2)).toBe(
            'We added 2 items to your cart, but 2 items are unavailable or out of stock:'
        );
        expect(generateModalSubheading(0, 0)).toBe(
            'We could not add any items to your cart, items are unavailable or out of stock.'
        );
    });
});
