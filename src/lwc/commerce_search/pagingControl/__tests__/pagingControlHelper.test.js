import { generatePagesForRange } from '../pagingControlHelper';
import * as Constants from '../constants';

const simplifyPageArray = (ar) =>
    ar.map((obj) => {
        let symbol = Constants.PAGING_RANGE_SYMBOL;
        if (!obj.isRange) {
            symbol = obj.pageNumber;
        }
        return symbol;
    });

const isIdsValid = (ar) => ar.every((obj, index) => obj.id === index);

describe('Paging Control Algorithms', () => {
    let RANGE_SYMBOL = Constants.PAGING_RANGE_SYMBOL;

    it('adds range symbol before last page number when the current page is the first page', () => {
        const currentPage = 1;
        const totalPage = 17;
        const maxPageButtons = 5;

        const rangeObjs = generatePagesForRange(currentPage, totalPage, maxPageButtons);

        const pageRange = simplifyPageArray(rangeObjs);

        // [(1)  2  3  ...  17]
        expect(pageRange).toEqual([currentPage, 2, 3, RANGE_SYMBOL, 17]);
        expect(pageRange).toHaveLength(maxPageButtons);
        expect(isIdsValid(rangeObjs)).toBe(true);
    });

    it('adds range symbol after first page number', () => {
        const currentPage = 15;
        const totalPage = 17;
        const maxPageButtons = 7;

        const rangeObjs = generatePagesForRange(currentPage, totalPage, maxPageButtons);

        const pageRange = simplifyPageArray(rangeObjs);

        // [1  ...  13  14  (15)  ...  17]
        expect(pageRange).toEqual([1, RANGE_SYMBOL, 13, 14, currentPage, 16, 17]);
        expect(pageRange).toHaveLength(maxPageButtons);
        expect(isIdsValid(rangeObjs)).toBe(true);
    });

    it('adds range symbol before last page number when the current page is not the first page', () => {
        const currentPage = 2;
        const totalPage = 7;
        const maxPageButtons = 5;

        const rangeObjs = generatePagesForRange(currentPage, totalPage, maxPageButtons);

        const pageRange = simplifyPageArray(rangeObjs);

        // [1  (2)  3  ... 7]
        expect(pageRange).toEqual([1, currentPage, 3, RANGE_SYMBOL, 7]);
        expect(isIdsValid(rangeObjs)).toBe(true);
    });

    it('adds range symbol both sides of the current page', () => {
        const currentPage = 8;
        const totalPage = 17;
        const maxPageButtons = 5;

        const rangeObjs = generatePagesForRange(currentPage, totalPage, maxPageButtons);

        const pageRange = simplifyPageArray(rangeObjs);

        // [1  ...  (8)  ...  17]
        expect(pageRange).toEqual([1, RANGE_SYMBOL, currentPage, RANGE_SYMBOL, 17]);
        expect(pageRange).toHaveLength(maxPageButtons);
        expect(isIdsValid(rangeObjs)).toBe(true);
    });

    it('sets maxPageButtons to totalPage if totalPage is shorter', () => {
        const currentPage = 1;
        const totalPage = 4;
        const maxPageButtons = 6;

        const rangeObjs = generatePagesForRange(currentPage, totalPage, maxPageButtons);

        const pageRange = simplifyPageArray(rangeObjs);

        // [(1)  2  3  4]
        expect(pageRange).toEqual([currentPage, 2, 3, 4]);
        expect(pageRange).toHaveLength(totalPage);
        expect(isIdsValid(rangeObjs)).toBe(true);
    });

    it('returns correct range if totalPage is shorter than maxPageButtons', () => {
        const currentPage = 2;
        const totalPage = 4;
        const maxPageButtons = 5;

        const rangeObjs = generatePagesForRange(currentPage, totalPage, maxPageButtons);

        const pageRange = simplifyPageArray(rangeObjs);

        // [1  (2)  3  4]
        expect(pageRange).toEqual([1, currentPage, 3, 4]);
        expect(pageRange).toHaveLength(totalPage);
        expect(isIdsValid(rangeObjs)).toBe(true);
    });

    it('returns correct range for maxPageButtons === 6', () => {
        const currentPage = 8;
        const totalPage = 17;
        const maxPageButtons = 6;

        const rangeObjs = generatePagesForRange(currentPage, totalPage, maxPageButtons);

        const pageRange = simplifyPageArray(rangeObjs);

        // [1  ...  (8)  9  ...  17]
        expect(pageRange).toEqual([1, RANGE_SYMBOL, currentPage, 9, RANGE_SYMBOL, 17]);
        expect(pageRange).toHaveLength(maxPageButtons);
        expect(isIdsValid(rangeObjs)).toBe(true);
    });

    it('returns correct range for maxPageButtons === 7', () => {
        const currentPage = 8;
        const totalPage = 17;
        const maxPageButtons = 7;

        const rangeObjs = generatePagesForRange(currentPage, totalPage, maxPageButtons);

        const pageRange = simplifyPageArray(rangeObjs);

        // [1  ...  7  (8)  9  ...  17]
        expect(pageRange).toEqual([1, RANGE_SYMBOL, 7, currentPage, 9, RANGE_SYMBOL, 17]);
        expect(pageRange).toHaveLength(maxPageButtons);
        expect(isIdsValid(rangeObjs)).toBe(true);
    });

    it('removes the range symbol if adjacent numbers', () => {
        const currentPage = 3;
        const totalPage = 17;
        const maxPageButtons = 5;

        const rangeObjs = generatePagesForRange(currentPage, totalPage, maxPageButtons);

        const pageRange = simplifyPageArray(rangeObjs);

        // [1  2  (3)  ...  17]
        expect(pageRange).toEqual([1, 2, currentPage, RANGE_SYMBOL, 17]);
        expect(pageRange).toHaveLength(maxPageButtons);
        expect(isIdsValid(rangeObjs)).toBe(true);
    });

    it('has consecutive page element numbers', () => {
        const currentPage = 1;
        const totalPage = 5;
        const maxPageButtons = 5;

        const rangeObjs = generatePagesForRange(currentPage, totalPage, maxPageButtons);

        const pageRange = simplifyPageArray(rangeObjs);

        // [(1)  2  3  4  5]
        expect(pageRange).toEqual([currentPage, 2, 3, 4, 5]);
        expect(pageRange).toHaveLength(maxPageButtons);
        expect(isIdsValid(rangeObjs)).toBe(true);
    });

    it('supports a minimum value of 3 pages', () => {
        const currentPage = 1;
        const totalPage = 5;
        const maxPageButtons = 3;

        const rangeObjs = generatePagesForRange(currentPage, totalPage, maxPageButtons);

        const pageRange = simplifyPageArray(rangeObjs);

        // [(1) ... 5]
        expect(pageRange).toEqual([currentPage, RANGE_SYMBOL, 5]);
        expect(pageRange).toHaveLength(maxPageButtons);
        expect(isIdsValid(rangeObjs)).toBe(true);
    });
});
