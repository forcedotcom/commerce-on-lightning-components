/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE file in the repo
 * root or https://opensource.org/licenses/apache-2.0/
 */
import { createElement } from 'lwc';
import CustomPill from 'c/customPill';
import { PILL_VARIANT } from '../constants';

describe('c-custom-pill', () => {
    let element;

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('renders with default variant (promotion) and label', async () => {
        element = createElement('c-custom-pill', { is: CustomPill });
        element.label = '20% off';
        document.body.appendChild(element);
        await Promise.resolve();

        const span = element.querySelector('span.pill');
        expect(span).not.toBeNull();
        expect(span.classList.contains('pill-promotion')).toBe(true);
        expect(span.title).toBe('20% off');
        expect(element.querySelector('.pill-text').textContent).toBe('20% off');
    });

    it('renders coupon variant', async () => {
        element = createElement('c-custom-pill', { is: CustomPill });
        element.label = 'SAVE10';
        element.variant = PILL_VARIANT.COUPON;
        document.body.appendChild(element);
        await Promise.resolve();

        const span = element.querySelector('span.pill');
        expect(span.classList.contains('pill-coupon')).toBe(true);
        expect(span.title).toBe('');
        expect(element.querySelector('.pill-text').textContent).toBe('SAVE10');
    });

    it('applies disabled class when disabled is true', async () => {
        element = createElement('c-custom-pill', { is: CustomPill });
        element.label = 'CODE';
        element.variant = PILL_VARIANT.COUPON;
        element.disabled = true;
        document.body.appendChild(element);
        await Promise.resolve();

        const span = element.querySelector('span.pill');
        expect(span.classList.contains('pill-disabled')).toBe(true);
    });

    it('applies max-width style when maxWidth is set', async () => {
        element = createElement('c-custom-pill', { is: CustomPill });
        element.label = 'Promo';
        element.maxWidth = '180px';
        document.body.appendChild(element);
        await Promise.resolve();

        const span = element.querySelector('span.pill');
        expect(span.getAttribute('style')).toContain('max-width: min(180px, 100%)');
    });
});
