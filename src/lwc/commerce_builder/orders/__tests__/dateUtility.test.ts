import { createDate, getStandardDateFormat, getUTCDate, pad, setTime } from '../dateUtility';

describe('commerce_builder/orders: dateUtility', () => {
    [0, 5, 9].forEach((num: number) => {
        it(`applies the padding if number ${num} is less than 10`, () => {
            const padNum = pad(num);
            expect(padNum).toBe(`0${num}`);
        });
    });

    [10, 15, 25].forEach((num: number) => {
        it(`doesn’t apply the padding if number ${num} is greater than or equal to 10`, () => {
            const padNum = pad(num);
            expect(padNum).toBe(`${num}`);
        });
    });

    it(`doesn't return date in standard format if it is undefined`, () => {
        const date = getStandardDateFormat(undefined);
        expect(date).not.toBeTruthy();
    });

    it(`doesn't return a UTC date if date parameter is undefined`, () => {
        const date = getUTCDate(undefined);
        expect(date).not.toBeTruthy();
    });

    it(`doesn't return updated time if date parameter is undefined`, () => {
        const date = setTime(undefined, 0, 0, 0, 0);
        expect(date).not.toBeTruthy();
    });

    it(`return today's date as default date from 'createDate'`, () => {
        const date = createDate(0, 0, 0);
        const todayDate = new Date();
        expect(date.getDate()).toBe(todayDate.getDate());
        expect(date.getMonth()).toBe(todayDate.getMonth());
        expect(date.getFullYear()).toBe(todayDate.getFullYear());
    });

    it(`return a future date from 'createDate'`, () => {
        const date = createDate(0, 2, 1);
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 2);
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        expect(date.getDate()).toBe(futureDate.getDate());
        expect(date.getMonth()).toBe(futureDate.getMonth());
        expect(date.getFullYear()).toBe(futureDate.getFullYear());
    });

    it(`return a past date from 'createDate'`, () => {
        const date = createDate(-1, -2, 0);
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        pastDate.setMonth(pastDate.getMonth() - 2);
        expect(date.getDate()).toBe(pastDate.getDate());
        expect(date.getMonth()).toBe(pastDate.getMonth());
        expect(date.getFullYear()).toBe(pastDate.getFullYear());
    });

    it('formats the date to be passed to lightning input component', () => {
        const date = new Date('2022-9-3');
        const formattedDate = getStandardDateFormat(date);
        expect(formattedDate).toBe(`2022-09-03`);
    });

    it('updates the date as ISO string with zero UTC offset', () => {
        const date = createDate(1, 1, 1);
        const updatedDate = setTime(date, 20, 27, 47, 777);
        const filterDate = getUTCDate(updatedDate);
        const exist = filterDate?.includes('-0000');
        expect(exist).toBeTruthy();
    });
});
