import getLayoutClass from '../layoutClassGenerator';

describe('commerce_my_account-order-line-item-fields: Layout Class Generator', () => {
    [
        {
            columns: 1,
            fields: 1,
        },
        {
            columns: 1,
            fields: 2,
        },
        {
            columns: 1,
            fields: 3,
        },
        {
            columns: 1,
            fields: 4,
        },
        {
            columns: 1,
            fields: 5,
        },
        {
            columns: 1,
            fields: 6,
        },
        {
            columns: 1,
            fields: 7,
        },
        {
            columns: 1,
            fields: 8,
        },
        {
            columns: 2,
            fields: 1,
        },
        {
            columns: 3,
            fields: 1,
        },
        {
            columns: 4,
            fields: 1,
        },
        {
            columns: 5,
            fields: 6,
        },
    ].forEach((columnsAndFields) => {
        it(`displays fields in one column layout if columns are ${columnsAndFields.columns} and fields are ${columnsAndFields.fields}`, () => {
            const layoutClass = getLayoutClass(columnsAndFields.columns, columnsAndFields.fields);
            expect(layoutClass).toBe('one-column-layout');
        });
    });

    [
        {
            columns: 2,
            fields: 2,
        },
        {
            columns: 2,
            fields: 3,
        },
        {
            columns: 2,
            fields: 4,
        },
        {
            columns: 2,
            fields: 5,
        },
        {
            columns: 2,
            fields: 6,
        },
        {
            columns: 2,
            fields: 7,
        },

        {
            columns: 2,
            fields: 8,
        },
        {
            columns: 3,
            fields: 2,
        },
        {
            columns: 4,
            fields: 2,
        },
    ].forEach((columnsAndFields) => {
        it(`display fields in two column layout if columns are ${columnsAndFields.columns} and fields are ${columnsAndFields.fields}`, () => {
            const layoutClass = getLayoutClass(columnsAndFields.columns, columnsAndFields.fields);
            expect(layoutClass).toBe('two-column-layout');
        });
    });

    [
        {
            columns: 3,
            fields: 3,
        },
        {
            columns: 3,
            fields: 4,
        },
        {
            columns: 3,
            fields: 5,
        },
        {
            columns: 3,
            fields: 6,
        },
        {
            columns: 3,
            fields: 7,
        },
        {
            columns: 3,
            fields: 8,
        },
        {
            columns: 4,
            fields: 3,
        },
    ].forEach((columnsAndFields) => {
        it(`display fields in three column layout if columns are ${columnsAndFields.columns} and fields are ${columnsAndFields.fields}`, () => {
            const layoutClass = getLayoutClass(columnsAndFields.columns, columnsAndFields.fields);
            expect(layoutClass).toBe('three-column-layout');
        });
    });

    [
        {
            columns: 4,
            fields: 4,
        },
        {
            columns: 4,
            fields: 5,
        },
        {
            columns: 4,
            fields: 6,
        },
        {
            columns: 4,
            fields: 7,
        },
        {
            columns: 4,
            fields: 8,
        },
    ].forEach((columnsAndFields) => {
        it(`display fields in four column layout if columns are ${columnsAndFields.columns} and fields are ${columnsAndFields.fields}`, () => {
            const layoutClass = getLayoutClass(columnsAndFields.columns, columnsAndFields.fields);
            expect(layoutClass).toBe('four-column-layout');
        });
    });
});
