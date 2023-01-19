import { createElement } from 'lwc';
import ReorderButton from 'commerce_my_account/reorderButton';

describe('commerce_my_account/reorderButton', () => {
    let element: HTMLElement & ReorderButton;

    beforeEach(() => {
        jest.clearAllMocks();
        element = createElement('commerce_my_account-reorder-button', {
            is: ReorderButton,
        });

        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('Is accessible', async () => {
        element.buttonText = 'Reorder';
        element.size = 'small';
        element.width = 'default';
        element.alignment = 'left';
        element.variant = 'primary';

        await Promise.resolve();
        expect.assertions(1);
        await expect(element).toBeAccessible();
    });

    it('Displays the correct button text when the text property is set', () => {
        const text = 'Test button text';
        element.buttonText = text;

        return Promise.resolve().then(() => {
            const reorderButton = <HTMLButtonElement>element.querySelector('button');
            expect(reorderButton.textContent).toBe(text);
        });
    });

    it('Fires reorder event on click', () => {
        const handler = jest.fn();
        element.addEventListener('reorder', handler);

        const reorderButton = <HTMLButtonElement>element.querySelector('button');
        reorderButton.click();

        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                composed: false,
                isTrusted: false,
            })
        );
        expect(handler).toHaveBeenCalledTimes(1);
    });
});
