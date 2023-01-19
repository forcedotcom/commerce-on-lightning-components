import { createElement } from 'lwc';
import ActionButtons from '../actionButtons';
import type { default as CommerceActionButtons } from 'commerce/actionButtons';

jest.mock('transport', () => ({ fetch: jest.fn() }), { virtual: true });

describe('Commerce Action Button', () => {
    let element: HTMLButtonElement & ActionButtons;

    beforeEach(() => {
        element = createElement('commerce_builder-action-buttons', {
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
        const actionButtonElem = <CommerceActionButtons & HTMLElement>element.querySelector('commerce-action-buttons');
        return Promise.resolve().then(() => {
            const button1 = <HTMLButtonElement>actionButtonElem.querySelector('button:nth-child(1)');
            const button2 = <HTMLButtonElement>actionButtonElem.querySelector('button:nth-child(2)');
            expect(button1.textContent).toBe(firstButtonText);
            expect(button2.textContent).toBe(secondButtonText);
        });
    });

    it('text decoration of button should not exist when text emphasis is set to false', async () => {
        element.firstActionButtonTextDecoration = '{"bold":false,"italic":false,"underline":false}';
        await Promise.resolve();
        const actionButtonElem = <CommerceActionButtons & HTMLElement>element.querySelector('commerce-action-buttons');
        expect(actionButtonElem.firstButtonTextDecorationClass).not.toContain('label-bold');
        expect(actionButtonElem.firstButtonTextDecorationClass).not.toContain('label-italic');
        expect(actionButtonElem.firstButtonTextDecorationClass).not.toContain('label-underline');
    });

    it('text decoration of button should exist when text emphasis is set to true', async () => {
        element.firstActionButtonTextDecoration = '{"bold":true,"italic":true,"underline":true}';
        element.firstButtonVariant = 'secondary';
        element.size = 'large';
        await Promise.resolve();
        const actionButtonElem = <CommerceActionButtons & HTMLElement>element.querySelector('commerce-action-buttons');
        expect(actionButtonElem.firstButtonTextDecorationClass).toContain('label-bold');
        expect(actionButtonElem.firstButtonTextDecorationClass).toContain('label-italic');
        expect(actionButtonElem.firstButtonTextDecorationClass).toContain('label-underline');
    });

    it('should be accessible', async () => {
        element.firstActionButtonText = 'First Test Button';
        element.secondActionButtonText = 'Secon Test Button';
        await Promise.resolve();
        await expect(element).toBeAccessible();
    });
});
