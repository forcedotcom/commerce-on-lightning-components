import { createElement } from 'lwc';
import { querySelector } from 'kagekiri';
import myAccountLayout from '../myAccountLayout';

describe('commerce_my_account/myAccountLayout', () => {
    let element: myAccountLayout & HTMLElement;

    beforeEach(() => {
        element = createElement('commerce_my_account-my-account-layout', {
            is: myAccountLayout,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    ['header', 'footer', 'navigation'].forEach((slot) => {
        it(`should have a slot for ${slot}`, () => {
            expect(querySelector(`div[name=${slot}]`)).toBeTruthy();
        });
    });

    it('should have a default slot', () => {
        expect(querySelector('div:not([name])')).toBeTruthy();
    });
});
