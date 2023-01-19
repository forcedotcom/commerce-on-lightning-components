import generateLabel from '../../listHeader/headerLabelGenerator';
import * as Constants from '../../listHeader/constants';

// Mock the labels with known values.
jest.mock('../labels.js', () => ({
    oneResultSearchHeader: '{count} Result for "{keyword}"',
    oneResultSearchHeaderShort: '{count} Result',
    oneCategoryHeader: '{count} Item',
    multipleResultSearchHeader: '{count} Results for "{keyword}"',
    multipleResultSearchHeaderWithIndex: '{startIndex} - {endIndex} of {count} Results for "{keyword}"',
    multipleResultSearchHeaderShort: '{count} Results',
    multipleResultSearchHeaderShortWithIndex: '{startIndex} - {endIndex} of {count} Results',
    multipleCategoryHeader: '{count} Items',
    multipleCategoryHeaderWithIndex: '{startIndex} - {endIndex} of {count} Items',
}));

describe('commerce_search/listHeader: Header Label Generator', () => {
    [
        {
            testName: 'singular result with indexes and with display word',
            displayCount: 1,
            displayStartIndex: 1,
            displayEndIndex: 1,
            displayWord: 'toaster oven',
            displayMode: Constants.ResultType.SearchResult,
            result: '1 Result for "toaster oven"',
        },
        {
            testName: 'singular result with indexes and without display word',
            displayCount: 1,
            displayStartIndex: 1,
            displayEndIndex: 1,
            displayWord: undefined,
            displayMode: Constants.ResultType.SearchResult,
            result: '1 Result',
        },
        {
            testName: 'singular result without indexes and with display word',
            displayCount: 1,
            displayStartIndex: 0,
            displayEndIndex: 0,
            displayWord: 'toaster oven',
            displayMode: Constants.ResultType.SearchResult,
            result: '1 Result for "toaster oven"',
        },
        {
            testName: 'singular result without indexes and without display word',
            displayCount: 1,
            displayStartIndex: 0,
            displayEndIndex: 0,
            displayWord: undefined,
            displayMode: Constants.ResultType.SearchResult,
            result: '1 Result',
        },
        {
            testName: 'singular product list with indexes and with display word',
            displayCount: 1,
            displayStartIndex: 1,
            displayEndIndex: 1,
            displayWord: 'Chandelier',
            displayMode: Constants.ResultType.ProductList,
            result: '1 Item',
        },
        {
            testName: 'singular product list with indexes and without display word',
            displayCount: 1,
            displayStartIndex: 1,
            displayEndIndex: 1,
            displayWord: undefined,
            displayMode: Constants.ResultType.ProductList,
            result: '1 Item',
        },
        {
            testName: 'singular product list without indexes and with display word',
            displayCount: 1,
            displayStartIndex: 0,
            displayEndIndex: 0,
            displayWord: 'Chandelier',
            displayMode: Constants.ResultType.ProductList,
            result: '1 Item',
        },
        {
            testName: 'singular product list without indexes and without display word',
            displayCount: 1,
            displayStartIndex: 0,
            displayEndIndex: 0,
            displayWord: 'Chandelier',
            displayMode: Constants.ResultType.ProductList,
            result: '1 Item',
        },
        {
            testName: 'multiple results with indexes and with display word',
            displayCount: 10,
            displayStartIndex: 1,
            displayEndIndex: 1,
            displayWord: 'toaster oven',
            displayMode: Constants.ResultType.SearchResult,
            result: '1 - 1 of 10 Results for "toaster oven"',
        },
        {
            testName: 'multiple results with indexes and without display word',
            displayCount: 10,
            displayStartIndex: 1,
            displayEndIndex: 1,
            displayWord: undefined,
            displayMode: Constants.ResultType.SearchResult,
            result: '1 - 1 of 10 Results',
        },
        {
            testName: 'multiple product list with indexes and with display word',
            displayCount: 10,
            displayStartIndex: 1,
            displayEndIndex: 1,
            displayWord: 'Chandelier',
            displayMode: Constants.ResultType.ProductList,
            result: '1 - 1 of 10 Items',
        },
        {
            testName: 'multiple product list with indexes and without display word',
            displayCount: 10,
            displayStartIndex: 0,
            displayEndIndex: 0,
            displayWord: 'Chandelier',
            displayMode: Constants.ResultType.ProductList,
            result: '10 Items',
        },
        {
            testName: 'no products without indexes and with display word',
            displayCount: 10,
            displayStartIndex: 0,
            displayEndIndex: 0,
            displayWord: 'Chandelier',
            displayMode: Constants.ResultType.ProductList,
            result: '10 Items',
        },
        {
            testName: 'no results without indexes and with display word',
            displayCount: 0,
            displayStartIndex: 0,
            displayEndIndex: 0,
            displayWord: 'toaster oven',
            displayMode: Constants.ResultType.SearchResult,
            result: '0 Results for "toaster oven"',
        },
        {
            testName: 'no results without indexes and without display word',
            displayCount: 0,
            displayStartIndex: 0,
            displayEndIndex: 0,
            displayWord: undefined,
            displayMode: Constants.ResultType.SearchResult,
            result: '0 Results',
        },
    ].forEach((test) => {
        it(`shows expected label for ${test.testName}`, () => {
            const label = generateLabel(
                test.displayCount,
                test.displayStartIndex,
                test.displayEndIndex,
                test.displayWord,
                test.displayMode
            );
            expect(label).toBe(test.result);
        });
    });

    // Out-of-range output.
    [-1, undefined, null].forEach((count) => {
        it(`generates no label for an invalid displayCount (${count}) of results`, () => {
            expect(generateLabel(count, 'toaster oven', Constants.ResultType.SearchResult)).toBeUndefined();
        });
    });
});
