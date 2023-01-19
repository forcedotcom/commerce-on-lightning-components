import { isDataAvailable, transformToBreadcrumbs, updateDataAvailable } from '../utils';
import { breadcrumbs, primaryProductCategoryPath } from './data/product.mock';

describe('commerce_data_provider/utils', () => {
    describe('updateDataAvailable()', () => {
        describe('without props', () => {
            it('should update the data availability of a certain event target', () => {
                const target1 = document.createElement('div');
                const target2 = document.createElement('div');
                expect(isDataAvailable(target1)).toBe(false); // Verify that initially the result is `false`
                expect(isDataAvailable(target2)).toBe(false);

                updateDataAvailable(target1, true);
                expect(isDataAvailable(target1)).toBe(true);
                expect(isDataAvailable(target2)).toBe(false);

                updateDataAvailable(target1, false);
                expect(isDataAvailable(target1)).toBe(false);
                expect(isDataAvailable(target2)).toBe(false);
            });
        });

        describe('with props', () => {
            it('should update the data availability of a certain event target', () => {
                const target1 = document.createElement('div');
                const target2 = document.createElement('div');
                expect(isDataAvailable(target1)).toBe(false); // Verify that initially the result is `false`
                expect(isDataAvailable(target2)).toBe(false);

                updateDataAvailable(target1, true, 'prop1');
                expect(isDataAvailable(target1)).toBe(true);
                expect(isDataAvailable(target1, 'prop1')).toBe(true);
                expect(isDataAvailable(target1, 'prop2')).toBe(false);
                expect(isDataAvailable(target2)).toBe(false);

                updateDataAvailable(target1, false, 'prop2');
                expect(isDataAvailable(target1)).toBe(false);
                expect(isDataAvailable(target1, 'prop1')).toBe(true);
                expect(isDataAvailable(target1, 'prop2')).toBe(false);
                expect(isDataAvailable(target2)).toBe(false);

                updateDataAvailable(target1, false, 'prop1');
                expect(isDataAvailable(target1)).toBe(false);
                expect(isDataAvailable(target1, 'prop1')).toBe(false);
                expect(isDataAvailable(target1, 'prop2')).toBe(false);
                expect(isDataAvailable(target2)).toBe(false);

                updateDataAvailable(target1, true, 'prop2');
                expect(isDataAvailable(target1)).toBe(false);
                expect(isDataAvailable(target1, 'prop1')).toBe(false);
                expect(isDataAvailable(target1, 'prop2')).toBe(true);
                expect(isDataAvailable(target2)).toBe(false);

                updateDataAvailable(target1, true, 'prop1');
                expect(isDataAvailable(target1)).toBe(true);
                expect(isDataAvailable(target1, 'prop1')).toBe(true);
                expect(isDataAvailable(target1, 'prop2')).toBe(true);
                expect(isDataAvailable(target2)).toBe(false);
            });
        });
    });

    describe('transformToBreadcrumbs()', () => {
        it('should transform data', () => {
            expect(transformToBreadcrumbs(primaryProductCategoryPath)).toEqual(breadcrumbs);
        });

        it('should not fail on undefined or invalid data', () => {
            [undefined, [], null, true, false].forEach((val) => {
                expect(transformToBreadcrumbs(<never>val)).toEqual([]);
            });
        });
    });
});
