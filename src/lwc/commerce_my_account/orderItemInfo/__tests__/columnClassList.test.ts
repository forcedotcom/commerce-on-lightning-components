import { classListForColumnOne, classListForColumnTwo, classListForColumnTotalPriceColumn } from '../columnClassList';
const classListPrefix = 'slds-col slds-p-right_small ';
describe('classList/classListForColumnOne', () => {
    it('verifies column 1 takes 100% width when the second column and the totalPrice column are not present', () => {
        const result = classListForColumnOne(false, false);
        expect(result).toBe(classListPrefix + 'slds-size_1-of-1');
    });
    it('verifies column 1 takes 50% of the width when there is a second column', () => {
        const result = classListForColumnOne(true, false);
        expect(result).toBe(classListPrefix + 'slds-size_1-of-2');
    });
    it('verifies column 1 takes 50% width in mobile view and 1/3 of the width in desktop view if there are 3 columns', () => {
        const result = classListForColumnOne(true, true);
        expect(result).toBe(classListPrefix + 'slds-size_1-of-2 slds-large-size_1-of-3');
    });
});

describe('classList/classListForColumnTwo', () => {
    it('verifies column 2 takes 50% width if totalPrice column is not shown', () => {
        const result = classListForColumnTwo(false);
        expect(result).toBe(classListPrefix + 'slds-size_1-of-2');
    });
    it(`verifies column 2 fields are shown in column 1 fields in mobile view if totalPrice is also shown`, () => {
        const result = classListForColumnTwo(true);
        expect(result).toBe(
            classListPrefix + 'slds-size_1-of-2 slds-large-size_1-of-3 slds-order_2 slds-large-order_1'
        );
    });
});

describe('classList/classListForColumnTotalPriceColumn', () => {
    it('verifies showTotalPrice column takes 50% width if the secondColumn is not shown', () => {
        const result = classListForColumnTotalPriceColumn(false);
        expect(result).toBe(classListPrefix + 'slds-size_1-of-2');
    });
    it('verifies showTotalPrice column takes 50% width in mobile view and 1/3 of the width in desktop view when the second column is shown', () => {
        const result = classListForColumnTotalPriceColumn(true);
        expect(result).toBe(
            classListPrefix + 'slds-size_1-of-2 slds-large-size_1-of-3 slds-order_1 slds-large-order_2'
        );
    });
});
