import { createElement } from 'lwc';
import ActionButtons from '../actionButtons';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });
const clickHandler = jest.fn();

describe('Commerce Action Button', () => {
    let element: HTMLButtonElement & ActionButtons;

    beforeEach(() => {
        element = createElement('commerce-action-buttons', {
            is: ActionButtons,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
        jest.clearAllMocks();
    });
    it('displays the correct button text when the text property is set', () => {
        const firstButtonText = 'First Button Text';
        const secondButtonText = 'Second Button Text';
        element.firstActionButtonText = firstButtonText;
        element.secondActionButtonText = secondButtonText;
        return Promise.resolve().then(() => {
            const button1 = <HTMLButtonElement>element.querySelector('button:nth-child(1)');
            const button2 = <HTMLButtonElement>element.querySelector('button:nth-child(2)');
            expect(button1.textContent).toBe(firstButtonText);
            expect(button2.textContent).toBe(secondButtonText);
        });
    });

    it('css of button should be verified', async () => {
        element.firstButtonVariant = 'secondary';
        element.size = 'large';
        const button1 = <HTMLButtonElement>element.querySelector('button:nth-child(1)');
        await Promise.resolve();
        expect(button1.getAttribute('class')).toContain('slds-button');
        expect(button1.getAttribute('class')).toContain('dxp-button-large');
        expect(button1.getAttribute('class')).toContain('slds-button_outline-brand ');
    });

    it('triggers event on first button click', async () => {
        element.addEventListener('firstaction', clickHandler);
        const button = <HTMLButtonElement>element.querySelector('button:nth-child(1)');
        button.click();
        await Promise.resolve();
        expect(clickHandler).toHaveBeenCalled();
    });

    it('triggers event on second button click', async () => {
        element.addEventListener('secondaction', clickHandler);
        const button = <HTMLButtonElement>element.querySelector('button:nth-child(2)');
        button.click();
        await Promise.resolve();
        expect(clickHandler).toHaveBeenCalled();
    });

    it('should be accessible', async () => {
        element.firstActionButtonText = 'First Test Button';
        element.secondActionButtonText = 'Secon Test Button';
        await Promise.resolve();
        await expect(element).toBeAccessible();
    });
});
