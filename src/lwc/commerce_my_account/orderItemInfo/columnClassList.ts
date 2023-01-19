const classListPrefix = 'slds-col slds-p-right_small ';

/**
 * 1.when there is only 1 column then it should occupy the maximum width
 * 2. if all three columns are shown then in mobile view column 1 should take 1/2 width
 * (because column 1 fields and column 2 fields are shown together in one column)
 * 3.when there are two columns then column 1 should occupy 1/2 of the max width
 */
export function classListForColumnOne(showTotalPrice: boolean, showFieldsInSecondColumn: boolean): string {
    if (!showTotalPrice && !showFieldsInSecondColumn) {
        return classListPrefix + 'slds-size_1-of-1';
    } else if (showTotalPrice && showFieldsInSecondColumn) {
        return classListPrefix + 'slds-size_1-of-2 slds-large-size_1-of-3';
    }

    return classListPrefix + 'slds-size_1-of-2';
}

/**
 * 1.If there are only 2 columns then each column should occupy 50% width
 * 2.In mobile view fields for column 1 and column 2 will be in one column
 * in desktop view the second column will have 1/3 width.
 */

export function classListForColumnTwo(showTotalPrice: boolean): string {
    if (!showTotalPrice) {
        return classListPrefix + 'slds-size_1-of-2';
    }
    return classListPrefix + 'slds-size_1-of-2 slds-large-size_1-of-3 slds-order_2 slds-large-order_1';
}

/**
 * 1.If there are only two columns then showTotal field should occupy 50% width
 * 2. If there are three columns then showTotal field should occupy 50% width in mobile view
      and it should occupy 1/3 of the width in desktop view.
 */

export function classListForColumnTotalPriceColumn(showFieldsInSecondColumn: boolean): string {
    if (!showFieldsInSecondColumn) {
        return classListPrefix + 'slds-size_1-of-2';
    }
    return classListPrefix + 'slds-size_1-of-2 slds-large-size_1-of-3 slds-order_1 slds-large-order_2';
}
