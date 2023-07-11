/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
/**
 * @typedef {import('./searchPagingControl').PageItem} PageItem
 */

/**
 * Construct a PageItem object with given parameters and add to the given array.
 * @param {PageItem[]} pageObjArray reference array to add the PageItem object
 * @param {boolean} isRange is this a range?
 * @param {number} [pageNumber] page number
 * @param {number} [currentPage] current page number
 */
function addPageObject(pageObjArray, isRange, pageNumber, currentPage) {
    const id = pageObjArray.length;
    pageObjArray.push({
        id,
        pageNumber,
        isRange,
        isCurrentPage: pageNumber != null && pageNumber === currentPage,
    });
}

/**
 * @param {number} length length of the result array
 * @param {number} start starting number of the range
 * @returns {Array<number>} An array filled with given range values
 */
function getRangeArray(length, start) {
    return Array.from(
        {
            length,
        },
        (v, k) => k + start
    );
}

/**
 * @param {number} currentPage current page number
 * @param {number} totalPage total number of pages
 * @param {number} maxPageButtons max no. of page buttons to show in this page range.
 * @returns {PageItem[]} An array of {@link PageItem}s with relevant information
 * such as `id`, `pageNumber`, `isCurrentPage`, `isRange`
 */
export function generatePagesForRange(currentPage, totalPage, maxPageButtons) {
    let pages = [];
    let balanceLength;
    let lastPageNumber;
    const pageRange = [];

    balanceLength = maxPageButtons - 2;
    if (maxPageButtons > totalPage) {
        pages = getRangeArray(totalPage, 1);
    } else if (currentPage < balanceLength) {
        pages = getRangeArray(balanceLength, 1);

        pages.push(totalPage);
    } else if (currentPage > totalPage - balanceLength + 1) {
        pages = getRangeArray(balanceLength, totalPage - balanceLength + 1);

        pages.unshift(1);
    } else {
        balanceLength = maxPageButtons - 4;

        let beginIndex = 0;
        const halfRB = balanceLength >> 1;
        if (halfRB) {
            beginIndex = currentPage - halfRB;

            if (balanceLength === 2) {
                beginIndex += 1;
            }
        } else {
            beginIndex = currentPage;
        }
        pages = getRangeArray(balanceLength, beginIndex);

        pages.unshift(1);
        pages.push(totalPage);
    }

    pages.forEach((pageNumber) => {
        if (lastPageNumber) {
            if (pageNumber - lastPageNumber === 2) {
                addPageObject(pageRange, false, lastPageNumber + 1, currentPage);
            } else if (pageNumber - lastPageNumber !== 1) {
                addPageObject(pageRange, true, undefined, undefined);
            }
        }
        addPageObject(pageRange, false, pageNumber, currentPage);
        lastPageNumber = pageNumber;
    });
    return pageRange;
}
