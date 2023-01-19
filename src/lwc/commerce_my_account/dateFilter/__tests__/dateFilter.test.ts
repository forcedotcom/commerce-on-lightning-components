import { createElement } from 'lwc';
import { querySelector, querySelectorAll } from 'kagekiri';
import DateFilter from 'commerce_my_account/dateFilter';

describe('commerce_my_account/dateFilter', () => {
    let element: HTMLElement & DateFilter;
    type dateFilterProps = 'filterText' | 'startDate' | 'endDate';

    beforeEach(() => {
        element = createElement('commerce_my_account-date-filter', {
            is: DateFilter,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    [
        {
            property: 'filterText',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'startDate',
            defaultValue: undefined,
            changeValue: null,
        },
        {
            property: 'endDate',
            defaultValue: undefined,
            changeValue: null,
        },
    ].forEach((propertyTest) => {
        describe(`the '${propertyTest.property}' property`, () => {
            it(`defaults to ${propertyTest.defaultValue}`, () => {
                expect(element[<dateFilterProps>propertyTest.property]).toStrictEqual(propertyTest.defaultValue);
            });

            it('reflects a changed value', () => {
                // Ensure the value isn't already set to the target value.
                expect(element[<dateFilterProps>propertyTest.property]).not.toStrictEqual(propertyTest.changeValue);

                // Change the value.
                element[<dateFilterProps>propertyTest.property] = propertyTest.changeValue;

                // Ensure we reflect the changed value.
                expect(element[<dateFilterProps>propertyTest.property]).toStrictEqual(propertyTest.changeValue);
            });
        });
    });

    it('is accessible', async () => {
        element.filterText = 'Filter by date';
        element.startDate = '2021-02-05';
        element.endDate = '2021-02-03';
        await Promise.resolve();
        await expect(element).toBeAccessible();
    });

    it('displays filter text when present', async () => {
        element.filterText = 'Filter by date';
        await Promise.resolve();
        const filterText = querySelector('.slds-align-middle');
        expect(filterText).toBeTruthy();
    });

    it('indicates error if start date is greater than end date', async () => {
        element.startDate = '2021-02-05';
        element.endDate = '2021-02-03';
        await Promise.resolve();
        (<HTMLElement>querySelector('lightning-input')).dispatchEvent(new CustomEvent('change'));
        await Promise.resolve();
        expect((<HTMLElement>querySelector('lightning-input')).classList).toContain('slds-has-error');
    });

    it('triggers the event when apply button is clicked', async () => {
        element.startDate = '2021-02-01';
        element.endDate = '2021-02-03';
        const applyButtonListener = jest.fn();
        element.addEventListener('applydatefilter', applyButtonListener);
        await Promise.resolve();
        (<HTMLElement>querySelector('lightning-input')).dispatchEvent(new CustomEvent('change'));
        (<HTMLElement>querySelectorAll('lightning-button')[0]).click();
        expect(applyButtonListener).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: {
                    startDate: '2021-02-01',
                    endDate: '2021-02-03',
                },
            })
        );
    });

    it('triggers the event containing start date only when apply button is clicked and user has entered start date only', async () => {
        element.startDate = '2021-02-01';
        element.endDate = '';
        const applyButtonListner = jest.fn();
        element.addEventListener('applydatefilter', applyButtonListner);
        await Promise.resolve();
        (<HTMLElement>querySelector('lightning-input')).dispatchEvent(new CustomEvent('change'));
        (<HTMLElement>querySelectorAll('lightning-button')[0]).click();
        expect(applyButtonListner).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: {
                    startDate: '2021-02-01',
                    endDate: '',
                },
            })
        );
    });

    it('triggers the event when reset button is clicked', async () => {
        element.startDate = '2021-02-01';
        const resetButtonListner = jest.fn();
        element.addEventListener('resetdatefilter', resetButtonListner);
        await Promise.resolve();
        (<HTMLElement>querySelectorAll('lightning-button')[1]).click();
        expect(resetButtonListner).toHaveBeenCalled();
    });
});
