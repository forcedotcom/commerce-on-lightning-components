import { createElement } from 'lwc';
import B2bCartContents from 'commerce_builder/b2bCartContents';

jest.mock(
    'transport',
    () => ({
        fetch: jest.fn(),
    }),
    { virtual: true }
);

describe('commerce_builder/b2bCartContents: Cart Contents', () => {
    let element: HTMLElement & B2bCartContents;

    beforeEach(() => {
        jest.clearAllMocks();

        element = createElement('commerce_builder-b2b-cart-contents', {
            is: B2bCartContents,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('intermediate state', () => {
        it('shows the spinner when the component loads', () => {
            const spinner = element.querySelector('lightning-spinner');
            expect(spinner).not.toBeNull();
        });

        it('should not display the spinner when cart is empty', async () => {
            element.items = [];
            await Promise.resolve();

            let spinner = element.querySelector('lightning-spinner');
            expect(spinner).toBeNull();

            element.items = undefined;
            await Promise.resolve();

            spinner = element.querySelector('lightning-spinner');
            expect(spinner).not.toBeNull();
        });
    });
});
