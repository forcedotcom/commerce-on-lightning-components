import { createElement } from 'lwc';
import FieldsTable from 'commerce_product_details/fieldsTable';
import { getField } from './data/fields.mock';

describe('commerce_product_details/fieldsTable: Product Record Table', () => {
    let element: HTMLElement & FieldsTable;

    beforeEach(() => {
        element = createElement('commerce_product_details-fields-table', {
            is: FieldsTable,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('should not render any rows when there is no Field objects', () => {
        element.fields = undefined;
        const tableElem = <HTMLElement>element.querySelector('table');
        return Promise.resolve().then(() => {
            const rows = tableElem.querySelectorAll('tr');
            expect(rows).toHaveLength(0);
        });
    });

    it('should render rows for Field objects', () => {
        element.fields = getField();
        const tableElem = <HTMLElement>element.querySelector('table');
        return Promise.resolve().then(() => {
            const rows = tableElem.querySelectorAll('tr');
            expect(rows).toHaveLength(2);

            // verify each row
            const firstRowCells = rows[0].querySelectorAll('td');
            expect(firstRowCells).toBeDefined();
            expect(firstRowCells[0].textContent).toBe('Product Code');
            expect(firstRowCells[1].textContent).toBe('00000001');
            const secondRowCells = rows[1].querySelectorAll('td');
            expect(secondRowCells).toBeDefined();
            expect(secondRowCells[0].textContent).toBe('Description');
            expect(secondRowCells[1].textContent).toBe('Coffee Bean');
        });
    });

    it('is accessible', async () => {
        element.fields = getField();

        await Promise.resolve();
        await expect(element).toBeAccessible();
    });
});
