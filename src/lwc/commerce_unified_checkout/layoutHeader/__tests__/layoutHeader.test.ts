import { createElement } from 'lwc';
import LayoutHeader from 'commerce_unified_checkout/layoutHeader';

const createComponentUnderTest = (): HTMLElement & LayoutHeader => {
    const element = createElement('commerce_unified_checkout-layout-header', {
        is: LayoutHeader,
    });
    document.body.appendChild(element);
    return element;
};

describe('commerce_unified_checkout/layout-header: LayoutHeader', () => {
    let element: HTMLElement & LayoutHeader;

    beforeEach(() => {
        element = createComponentUnderTest();
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('Layout Header', () => {
        it('should show the header with logo and cart badge', async () => {
            return Promise.resolve().then(() => {
                const headerElement = element.querySelector('.slds-global-header_container');
                const items = element.querySelectorAll('.slds-global-header__item');

                expect(headerElement).toBeTruthy();
                expect(items).toHaveLength(2);
            });
        });
    });
});
