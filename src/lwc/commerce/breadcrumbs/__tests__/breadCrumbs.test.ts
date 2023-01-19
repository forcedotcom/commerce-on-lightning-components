/* eslint-disable no-irregular-whitespace */
import { createElement } from 'lwc';
import { breadcrumbs } from './data/breadCrumbs.data';
import Breadcrumbs from '../breadcrumbs';

describe('commerce/breadcrumbs', () => {
    let element: HTMLElement & Breadcrumbs;

    beforeEach(() => {
        element = createElement('commerce_builder-breadcrumbs', {
            is: Breadcrumbs,
        });
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe('a11y', () => {
        it('should be accessible by default', async () => {
            await expect(element).toBeAccessible();
        });
    });

    describe.each`
        property                | defaultValue | changeValue
        ${'breadcrumbs'}        | ${undefined} | ${[]}
        ${'showLastItemAsLink'} | ${false}     | ${true}
        ${'hideOnMobile'}       | ${false}     | ${true}
        ${'textSize'}           | ${undefined} | ${'small'}
        ${'linkColor'}          | ${undefined} | ${'#000000'}
        ${'linkHoverColor'}     | ${undefined} | ${'#000000'}
        ${'textColor'}          | ${undefined} | ${'#000000'}
        ${'divider'}            | ${undefined} | ${'/'}
        ${'dividerColor'}       | ${undefined} | ${'#000000'}
    `('@api property $property', ({ property, defaultValue, changeValue }) => {
        it(`should default to ${defaultValue}`, () => {
            expect(Reflect.get(element, property)).toBe(defaultValue);
        });

        it('should reflect a changed value', () => {
            Reflect.set(element, property, changeValue);
            expect(Reflect.get(element, property)).toStrictEqual(changeValue);
        });
    });

    describe('render()', () => {
        it.each`
            label                           | data                | showLastItemAsLink | expectedListItems | expectedLinks | expectedLabels
            ${'two breadcrumbs; one link'}  | ${breadcrumbs}      | ${false}           | ${2}              | ${1}          | ${['Energy', 'Energy Bars']}
            ${'two breadcrumbs; two links'} | ${breadcrumbs}      | ${true}            | ${2}              | ${2}          | ${['Energy', 'Energy Bars']}
            ${'one breadcrumb; no link'}    | ${[breadcrumbs[0]]} | ${false}           | ${1}              | ${0}          | ${['Energy']}
            ${'one breadcrumb; one link'}   | ${[breadcrumbs[0]]} | ${true}            | ${1}              | ${1}          | ${['Energy']}
        `(
            `should render $label`,
            async ({ data, showLastItemAsLink, expectedListItems, expectedLinks, expectedLabels }) => {
                element.breadcrumbs = data;
                element.showLastItemAsLink = showLastItemAsLink;
                await Promise.resolve();

                const listEls = element.querySelectorAll('nav > ol > li');
                const anchorEls = element.querySelectorAll('nav > ol > li > a');
                expect(listEls).toHaveLength(expectedListItems);
                expect(anchorEls).toHaveLength(expectedLinks);

                const labels = Array.from(listEls).map((listEl: Element) => listEl.textContent);
                expect(labels).toStrictEqual(expectedLabels);
            }
        );

        it.each`
            property            | styleName             | defaultValue | changeValue  | expectedValue
            ${'linkColor'}      | ${'link-color'}       | ${'initial'} | ${'#000000'} | ${'#000000'}
            ${'linkHoverColor'} | ${'link-hover-color'} | ${'initial'} | ${'#000000'} | ${'#000000'}
            ${'textColor'}      | ${'text-color'}       | ${'initial'} | ${'#000000'} | ${'#000000'}
            ${'divider'}        | ${'divider'}          | ${"''"}      | ${'/'}       | ${"'/'"}
            ${'dividerColor'}   | ${'divider-color'}    | ${'initial'} | ${'#000000'} | ${'#000000'}
            ${'hideOnMobile'}   | ${'hide-on-mobile'}   | ${'block'}   | ${true}      | ${'none'}
        `(
            `should have custom style --com-c-breadcrumb-​$property`,
            async ({ property, styleName, defaultValue, changeValue, expectedValue }) => {
                element.breadcrumbs = breadcrumbs;
                await Promise.resolve();

                const navEl = <HTMLElement>element.querySelector('nav');
                expect(navEl).toBeDefined();
                const { style } = navEl;

                // Verify initial value
                const prop = `--com-c-breadcrumb-${styleName}`;
                expect(style.getPropertyValue(prop)).toBe(defaultValue);

                // Verify custom value
                Reflect.set(element, property, changeValue);
                await Promise.resolve();
                expect(style.getPropertyValue(prop)).toBe(expectedValue);
            }
        );

        it.each`
            value        | expectedCssClass
            ${'small'}   | ${'slds-text-heading_small'}
            ${'medium'}  | ${'slds-text-heading_medium'}
            ${'large'}   | ${'slds-text-heading_large'}
            ${undefined} | ${undefined}
        `(`should compute CSS class for text size $value`, async ({ value, expectedCssClass }) => {
            element.textSize = value;
            element.breadcrumbs = breadcrumbs;
            await Promise.resolve();

            const olEl = <HTMLElement>element.querySelector('nav > ol');
            expect(olEl).toBeDefined();
            if (expectedCssClass) {
                expect(olEl.classList).toContain(expectedCssClass);
            } else {
                expect(olEl.classList).toHaveLength(0);
            }
        });
    });

    describe('handleNavigation()', () => {
        it.each`
            label       | showLastItemAsLink | selector                            | expectedPageReference
            ${'first'}  | ${false}           | ${'nav > ol > li > a'}              | ${breadcrumbs[0].pageReference}
            ${'second'} | ${true}            | ${'nav > ol > li:nth-child(2) > a'} | ${breadcrumbs[1].pageReference}
        `(
            `should fire a 'breadcrumbsclick' event on click; $label element`,
            async ({ showLastItemAsLink, selector, expectedPageReference }) => {
                element.breadcrumbs = breadcrumbs;
                element.showLastItemAsLink = showLastItemAsLink;
                await Promise.resolve();

                const handler = jest.fn();
                element.addEventListener('breadcrumbsclick', handler);

                const anchorEl = element.querySelector<HTMLAnchorElement>(selector);
                anchorEl?.click();

                expect(handler).toHaveBeenCalledTimes(1);
                expect(handler).toHaveBeenCalledWith(expect.any(CustomEvent));

                const payload = handler.mock.lastCall[0].detail;
                expect(payload).toStrictEqual(expectedPageReference);

                element.removeEventListener('breadcrumbsclick', handler);
            }
        );
    });
});
