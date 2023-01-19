import generateLabels from '../resultsLabelGenerator';
import { DISPLAY_MODE } from '../constants';

// Mock the labels with known values.
jest.mock('../labels', () => ({
    oneResultSearchHeaderShort: '{count} Result',
    oneCategoryHeader: '{count} Item',
    multipleResultSearchHeaderShort: '{count} Results',
    multipleCategoryHeader: '{count} Items',
}));

describe('commerce_search/facetsModal: Results Label Generator', () => {
    [
        //Singular result label tests.
        {
            displayCount: 1,
            displayMode: DISPLAY_MODE.SEARCH_RESULTS,
            result: '1 Result',
        },
        {
            displayCount: 1,
            displayMode: DISPLAY_MODE.PRODUCT_LIST,
            result: '1 Item',
        },
        // Multiple result label tests.
        {
            displayCount: 10,
            displayMode: DISPLAY_MODE.SEARCH_RESULTS,
            result: '10 Results',
        },
        {
            displayCount: 10,
            displayMode: DISPLAY_MODE.PRODUCT_LIST,
            result: '10 Items',
        },
        // No result labels test.
        {
            displayCount: 0,
            displayMode: DISPLAY_MODE.SEARCH_RESULTS,
            result: '0 Results',
        },
        {
            displayCount: 0,
            displayMode: DISPLAY_MODE.PRODUCT_LIST,
            result: '0 Items',
        },
    ].forEach((p) => {
        it(`returns the results label string "${p.result}" when given displayCount: "${p.displayCount}" and displayMode:  "${p.displayMode}"`, () => {
            const labelStr = generateLabels(p.displayCount, p.displayMode);
            expect(labelStr).toBe(p.result);
        });
    });

    // Out-of-range output.
    [-1, undefined, null].forEach((count) => {
        it(`generates no label for an invalid displayCount (${count}) of results`, () => {
            expect(generateLabels(count, DISPLAY_MODE.SEARCH_RESULTS)).toBeUndefined();
        });
    });
});
