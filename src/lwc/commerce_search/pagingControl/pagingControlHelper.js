/**
 * Gets page numbers as an array of Object with relevant UI information
 * such as id, pageNumber, isCurrentPage, isRange
 *
 * @param {Number} currentPage current page number
 * @param {Number} totalPage total number of pages
 * @param {Number} maxPageButtons max no. of page buttons to show in this page range.
 * @param {String} rangeSymbol range symbol to be inserted
 * @returns {PageItem[]}
 *
 * @typedef {Object} PageItem
 * @property {Number} id
 * @property {Number} pageNumber
 * @property {Boolean} isCurrentPage
 * @property {Boolean} isRange
 */
export function generatePagesForRange(currentPage, totalPage, maxPageButtons) {
    let pages = [];
    let balanceLen;
    let lastPN;
    const pageRange = [];

    // STEP 1: fill the array range with right numbers without range symbol

    // first and the last page# are always visible, so subtract 2
    balanceLen = maxPageButtons - 2;

    if (maxPageButtons > totalPage) {
        pages = getRangeArray(totalPage, 1);
    } else if (currentPage < balanceLen) {
        // handling one range symbol and that would be before the last page#
        // e.g. for total 10 pages, array would be [1  2  3  4  10]

        // filling up the first page numbers
        pages = getRangeArray(balanceLen, 1);

        // filling the last number
        pages.push(totalPage);
    } else if (currentPage > totalPage - balanceLen + 1) {
        // handling one range symbol and that would be after the first page#
        // e.g. for 10 pages, pages array would be [1  7  8  9  10]

        // filling up the last page numbers
        pages = getRangeArray(balanceLen, totalPage - balanceLen + 1);

        // insert first page number at index 0
        pages.unshift(1);
    } else {
        // handling range symbol at both sides of the currentPage
        // e.g. for 10 pages & current page# 6, array would be [1  6  10]

        // subtracting 4 buttons (2 range symbol + 2 navigation buttons)
        balanceLen = maxPageButtons - 4;

        // filling up the numbers around the current page.
        let beginIndex = 0;
        const halfRB = balanceLen >> 1;

        if (halfRB) {
            beginIndex = currentPage - halfRB;

            // if only 2 buttons in center, start from the current to next
            if (balanceLen === 2) {
                beginIndex += 1;
            }
        } else {
            beginIndex = currentPage;
        }

        pages = getRangeArray(balanceLen, beginIndex);

        // add first and last page number
        pages.unshift(1);
        pages.push(totalPage);
    }

    // STEP 2: insert range symbol at the right places in the array
    pages.forEach((pn) => {
        if (lastPN) {
            // edge condition: in case the gap between two numbers are 2
            // it is better to add that number instead of range symbol.
            if (pn - lastPN === 2) {
                addPageObject(pageRange, false, lastPN + 1, currentPage);
            } else if (pn - lastPN !== 1) {
                // this has to be range symbol since the difference is not 1
                addPageObject(pageRange, true, undefined, undefined);
            }
        }
        addPageObject(pageRange, false, pn, currentPage);
        lastPN = pn;
    });

    return pageRange;
}

/**
 * Construct a PageItem object with given parameters and add to the given array.
 *
 * @param {PageItem[]} pageObjArray reference array to add the PageItem object
 * @param {Boolean} isRange is this a range?
 * @param {Number} pageNumber page number
 * @param {Number} currentPage current page number
 */
function addPageObject(pageObjArray, isRange, pageNumber, currentPage) {
    const id = pageObjArray.length;

    pageObjArray.push({
        id,
        pageNumber,
        isRange,
        isCurrentPage: pageNumber !== undefined && pageNumber === currentPage,
    });
}

/**
 * Get an array filled with given range
 *
 * @param {Number} length length of the result array
 * @param {Number} start starting number of the range
 */
function getRangeArray(length, start) {
    return Array.from({ length }, (v, k) => k + start);
}
