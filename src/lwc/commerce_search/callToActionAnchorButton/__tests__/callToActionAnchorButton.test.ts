import type { LightningElement } from 'lwc';
import { createElement } from 'lwc';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import { NavigationContext } from 'lightning/navigation';
import CallToActionAnchorButton from 'commerce_search/callToActionAnchorButton';
import buttonStyleStringGenerator from '../buttonStyleStringGenerator';
import type { TestWireAdapter } from 'types/testing';

const mockGeneratedUrl = '/b2b/s/detail/0a9000000000001AAA';

jest.mock('lightning/navigation', () => ({
    generateUrl: jest.fn(() => mockGeneratedUrl),
    NavigationContext: mockCreateTestWireAdapter(),
}));

const createComponentUnderTest = (): HTMLElement & CallToActionAnchorButton => {
    const element: HTMLElement & CallToActionAnchorButton = createElement(
        'commerce_search-call-to-action-anchor-button',
        {
            is: CallToActionAnchorButton,
        }
    );
    document.body.appendChild(element);
    return element;
};

describe('Call to Action Anchor Button', () => {
    let element: HTMLElement & CallToActionAnchorButton;

    beforeEach(() => {
        element = createComponentUnderTest();
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('the "call to action" anchor button attributes', () => {
        it('defaults to undefined', () => {
            expect(<LightningElement>element).toMatchObject({
                ariaLabel: null,
                customStyles: undefined,
                text: undefined,
                productId: undefined,
            });
        });

        it('reflects a changed value', () => {
            element.ariaLabel = '';
            element.customStyles = {};
            element.text = "I'm a anchor button";
            element.productId = '00000';
            expect(<LightningElement>element).toMatchObject({
                ariaLabel: '',
                customStyles: {},
                text: "I'm a anchor button",
                productId: '00000',
            });
        });
    });

    it('shows the hover styles when the mouse hovers over the anchor button', () => {
        // Spy on the StyleStringGenerator we're using so that the test works across stubs and real code.
        const buttonStyleSpy = jest.spyOn(buttonStyleStringGenerator, 'createForStyles');

        // Fire the "mouseenter" event to simulate the mouse moving over the button.
        const anchor = element.querySelector('a');
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        anchor!.dispatchEvent(new CustomEvent('mouseenter'));

        return Promise.resolve().then(() => {
            // We know we're in a hovering state if we call the StyleStringGenerator with the isHovering state set to true.
            expect(buttonStyleSpy).toHaveBeenLastCalledWith(
                undefined,
                expect.objectContaining({
                    isHovering: true,
                })
            );
        });
    });

    it('reverts the hover styles when the mouse no longer hovers over the anchor button', () => {
        // Spy on the StyleStringGenerator we're using so that the test works across stubs and real code.
        const buttonStyleSpy = jest.spyOn(buttonStyleStringGenerator, 'createForStyles');

        // Fire the "mouseenter" event to simulate the mouse moving over the button.
        const anchor = element.querySelector('a');
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        anchor!.dispatchEvent(new CustomEvent('mouseenter'));

        return Promise.resolve()
            .then(() => {
                // Fire the "mouseleave" event to simulate the mouse leaving.
                // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                anchor!.dispatchEvent(new CustomEvent('mouseleave'));
            })
            .then(() => {
                // We know we're back in a non-hovering state if we call the StyleStringGenerator with the isHovering state set to false.
                expect(buttonStyleSpy).toHaveBeenLastCalledWith(
                    undefined,
                    expect.objectContaining({
                        isHovering: false,
                    })
                );
            });
    });

    it('shows the hover styles when the anchor button receives focus', () => {
        // Spy on the StyleStringGenerator we're using so that the test works across stubs and real code.
        const buttonStyleSpy = jest.spyOn(buttonStyleStringGenerator, 'createForStyles');

        // Gain focus.
        const anchor = element.querySelector('a');
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        anchor!.dispatchEvent(new CustomEvent('focus'));

        return Promise.resolve().then(() => {
            // We know we're in a hovering state if we call the StyleStringGenerator with the isHovering state set to true.
            expect(buttonStyleSpy).toHaveBeenLastCalledWith(
                undefined,
                expect.objectContaining({
                    isHovering: true,
                })
            );
        });
    });

    it('reverts the hover styles when the anchor button loses focus', () => {
        // Spy on the StyleStringGenerator we're using so that the test works across stubs and real code.
        const buttonStyleSpy = jest.spyOn(buttonStyleStringGenerator, 'createForStyles');

        // Gain focus.
        const anchor = element.querySelector('a');
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        anchor!.dispatchEvent(new CustomEvent('focus'));

        return Promise.resolve()
            .then(() => {
                // Lose focus.
                // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                anchor!.dispatchEvent(new CustomEvent('blur'));
            })
            .then(() => {
                // We know we're back in a non-hovering state if we call the StyleStringGenerator with the isHovering state set to false.
                expect(buttonStyleSpy).toHaveBeenLastCalledWith(
                    undefined,
                    expect.objectContaining({
                        isHovering: false,
                    })
                );
            });
    });

    it('shows the correct href for anchor button', async () => {
        element.productId = '00000';

        (<typeof NavigationContext & typeof TestWireAdapter>NavigationContext).emit({
            test: 'test',
        });

        // Wait for all the microtasks to finish since we rely on a Promise chain for this URL resolution.
        // Do not blithely copy this pattern - this applies only to touchy lifecycle behaviors.
        await new Promise((resolve) => {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(resolve, 0);
        });
        await Promise.resolve();

        const anchorEl = element.querySelector('a[href="/b2b/s/detail/0a9000000000001AAA"]');

        expect(anchorEl).toBeTruthy();
    });

    it('does not show the href for anchor button when product ID is not defined', () => {
        element.productId = '';
        (<typeof NavigationContext & typeof TestWireAdapter>NavigationContext).emit({
            test: 'test',
        });

        // Wait for all the microtasks to finish since we rely on a Promise chain for this URL resolution.
        // Do not blithely copy this pattern - this applies only to touchy lifecycle behaviors.
        const settled = new Promise((resolve) => {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(resolve, 0);
        });

        return settled.then(() => {
            const anchorEl = element.querySelector('a[href="/b2b/s/detail/0a9000000000001AAA"]');
            expect(anchorEl).toBeNull();
        });
    });

    it('focuses the anchor button when focus api is called', () => {
        element.productId = '00000';

        // Wait for all the microtasks to finish since we rely on a Promise chain for this URL resolution.
        // Do not blithely copy this pattern - this applies only to touchy lifecycle behaviors.
        const settled = new Promise((resolve) => {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(resolve, 0);
        });

        return settled.then(() => {
            element.focus();
            const anchorEl = element.querySelector('a');
            expect(document.activeElement).toBe(anchorEl);
        });
    });

    it('generates url when navigationContextHandler is called', async () => {
        element.productId = '00000';

        (<typeof NavigationContext & typeof TestWireAdapter>NavigationContext).emit({
            test: 'test',
        });

        // Wait for next loop since we rely on a Promise chain for this URL resolution.
        await new Promise((resolve) => {
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(resolve, 0);
        });

        const anchorEl = element.querySelector('a');
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        expect(anchorEl!.href).toBe('http://localhost/b2b/s/detail/0a9000000000001AAA');
    });
});
