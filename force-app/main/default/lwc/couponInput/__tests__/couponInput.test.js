/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2-0/
 */
import { createElement } from 'lwc';
import CouponInput from 'c/couponInput';

describe('c-coupon-input', () => {
    let element;

    const createComponent = (config = {}) => {
        element = createElement('c-coupon-input', {
            is: CouponInput,
        });
        if (config.language) {
            element.configuration = { language: config.language };
        }
        document.body.appendChild(element);
        return element;
    };

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('should render the component with default values', () => {
        createComponent();

        const input = element.querySelector('.coupon-input');
        const button = element.querySelector('.apply-button');

        expect(input).toBeTruthy();
        expect(button).toBeTruthy();
        expect(button.disabled).toBe(true);
        expect(button.classList.contains('disabled')).toBe(true);
    });

    it('should enable apply button when input has value', async () => {
        createComponent();

        const input = element.querySelector('.coupon-input');
        const button = element.querySelector('.apply-button');

        input.value = 'TESTCOUPON';
        input.dispatchEvent(new CustomEvent('input'));

        await Promise.resolve();

        expect(button.disabled).toBe(false);
        expect(button.classList.contains('enabled')).toBe(true);
    });

    it('should dispatch applycoupon event when apply button is clicked', async () => {
        createComponent();

        const handler = jest.fn();
        element.addEventListener('applycoupon', handler);

        const input = element.querySelector('.coupon-input');
        const button = element.querySelector('.apply-button');

        input.value = 'TESTCOUPON';
        input.dispatchEvent(new CustomEvent('input'));

        await Promise.resolve();

        button.click();

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].detail).toEqual({
            couponCode: 'TESTCOUPON',
        });
    });

    it('should dispatch applycoupon event when Enter key is pressed', async () => {
        createComponent();

        const handler = jest.fn();
        element.addEventListener('applycoupon', handler);

        const input = element.querySelector('.coupon-input');

        input.value = 'TESTCOUPON';
        input.dispatchEvent(new CustomEvent('input'));

        await Promise.resolve();

        input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].detail).toEqual({
            couponCode: 'TESTCOUPON',
        });
    });

    it('should not dispatch event when apply button is clicked with empty input', () => {
        createComponent();

        const handler = jest.fn();
        element.addEventListener('applycoupon', handler);

        const button = element.querySelector('.apply-button');
        button.click();

        expect(handler).not.toHaveBeenCalled();
    });

    it('should trim whitespace from coupon code', async () => {
        createComponent();

        const handler = jest.fn();
        element.addEventListener('applycoupon', handler);

        const input = element.querySelector('.coupon-input');
        const button = element.querySelector('.apply-button');

        input.value = '  TESTCOUPON  ';
        input.dispatchEvent(new CustomEvent('input'));

        await Promise.resolve();

        button.click();

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].detail).toEqual({
            couponCode: 'TESTCOUPON',
        });
    });

    it('should use configured language for labels', () => {
        createComponent({ language: 'es' });

        const input = element.querySelector('.coupon-input');
        expect(input.placeholder).toBe('Ingresa el código del cupón...');
    });

    it('should set coupon code via API', async () => {
        createComponent();

        element.couponCode = 'APICOUPON';

        await Promise.resolve();

        const input = element.querySelector('.coupon-input');
        expect(input.value).toBe('APICOUPON');
    });

    it.each([
        ['null', null],
        ['undefined', undefined],
        ['empty string', ''],
    ])('should handle %s coupon code by setting empty string', async (description, value) => {
        createComponent();

        element.couponCode = value;

        await Promise.resolve();

        expect(element.couponCode).toBe('');
        expect(element.querySelector('.coupon-input').value).toBe('');
    });
});
