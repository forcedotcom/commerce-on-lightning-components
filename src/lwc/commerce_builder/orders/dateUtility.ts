/**
 * Provide padding (append 0 before) if number is less than 10 \
 * Used to add padding to month, day and get formated date. \
 */
export function pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
}

/**
 * Create a date using today's date in local time zone. \
 * Suppose today's date is 2022-10-18 \
 * createDate(0, 0, 0) -> create today's date i.e. 2022-10-18 \
 * createDate(2, 1, 0) -> create a future date i.e. 2022-11-20, \
 * createDate(2, -1, 0) -> create a past date i.e. 2022-09-20
 */
export function createDate(daysToAdd: number, monthsToAdd: number, yearsToAdd: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    date.setMonth(date.getMonth() + monthsToAdd);
    date.setFullYear(date.getFullYear() + yearsToAdd);
    return date;
}

/**
 * Update time of input date. \
 * Assume date is Mar 11 2019 09:10:50.456 \
 * setTime(date, 0, 0, 0, 0) -> Mar 11 2019 00:00:00.000
 */
export function setTime(
    inputDate: Date | undefined,
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number
): Date | undefined {
    if (inputDate) {
        const date = new Date(inputDate.getTime());
        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(seconds);
        date.setMilliseconds(milliseconds);
        return date;
    }
    return inputDate;
}

/**
 * Return date in format YYYY-MM-DD \
 * Assume date is Mar 11 2019 00:00:00 GMT+1100 \
 * formatDate(date) -> 2019-03-11
 */
export function getStandardDateFormat(date: Date | undefined): string | undefined {
    return date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : date;
}

/**
 * Return date in UTC time \
 * Assume date is Mar 11 2019 00:00:00.000 GMT+0530 \
 * getDateToFilterOrders(date) -> 2019-03-10T18:30:00.000-0000
 */
export function getUTCDate(date: Date | undefined): string | undefined {
    return date ? date.toISOString().replace('Z', '-0000') : date;
}
