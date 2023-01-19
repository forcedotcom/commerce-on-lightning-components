import { createElement } from 'lwc';
import type { TestWireAdapter } from '@salesforce/wire-service-jest-util';
import { createTestWireAdapter as mockCreateTestWireAdapter } from '@salesforce/wire-service-jest-util';
import MatchMediaMock from 'jest-matchmedia-mock';
import { navigate, NavigationContext } from 'lightning/navigation';
import { breadcrumbs, breadcrumbsLong } from './data/breadCrumbs.data';
import Breadcrumbs from '../breadcrumbs';
import { BreadcrumbsAdapter } from '../breadcrumbsAdapter';

const MEDIA_QUERY_MOBILE = '(max-width: 47.9375em)';
const MEDIA_QUERY_DESKTOP = '(min-width: 64em)';

function defer(): Promise<void> {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    return new Promise((resolve) => setTimeout(resolve));
}

jest.mock('lightning/navigation', () => ({
    navigate: jest.fn(),
    NavigationContext: mockCreateTestWireAdapter(),
}));

jest.mock(
    '@salesforce/label/LwcComponent:commerce_builder:breadcrumbs.homelabel',
    () => {
        return {
            default: 'Home',
        };
    },
    { virtual: true }
);

jest.mock('../breadcrumbsAdapter', () => ({
    BreadcrumbsAdapter: mockCreateTestWireAdapter(),
}));

const BreadcrumbsTestAdapter = <typeof BreadcrumbsAdapter & typeof TestWireAdapter>BreadcrumbsAdapter;
const NavigationContextTestAdapter = <typeof NavigationContext & typeof TestWireAdapter>NavigationContext;

describe('commerce_builder/breadcrumbs', () => {
    let element: HTMLElement & Breadcrumbs;

    let matchMedia: MatchMediaMock;

    beforeEach(() => {
        matchMedia = new MatchMediaMock();

        element = createElement('commerce_builder-breadcrumbs', {
            is: Breadcrumbs,
        });

        document.body.appendChild(element);
    });

    afterAll(() => {
        matchMedia.destroy();
    });

    afterEach(() => {
        matchMedia.destroy();
        document.body.removeChild(element);
    });

    describe('a11y', () => {
        it('should be accessible by default', async () => {
            await expect(element).toBeAccessible();
        });
    });

    describe.each`
        property                | defaultValue | changeValue
        ${'showHomeLink'}       | ${false}     | ${true}
        ${'showLastItemAsLink'} | ${false}     | ${true}
        ${'hideOnMobile'}       | ${false}     | ${true}
        ${'maxDepthOnMobile'}   | ${undefined} | ${'3'}
        ${'textSize'}           | ${undefined} | ${'small'}
        ${'linkColor'}          | ${undefined} | ${'#000000'}
        ${'hoverLinkColor'}     | ${undefined} | ${'#000000'}
        ${'textColor'}          | ${undefined} | ${'#000000'}
        ${'divider'}            | ${undefined} | ${'/'}
        ${'dividerColor'}       | ${undefined} | ${'#000000'}
    `('@api property $property', ({ property, defaultValue, changeValue }) => {
        it(`should defaults to ${defaultValue}`, () => {
            expect(Reflect.get(element, property)).toBe(defaultValue);
        });

        it('should reflects a changed value', () => {
            Reflect.set(element, property, changeValue);
            expect(Reflect.get(element, property)).toBe(changeValue);
        });
    });

    describe('render()', () => {
        it('should render a custom divider', async () => {
            BreadcrumbsTestAdapter.emit(breadcrumbs);
            await Promise.resolve();

            const navEl = <HTMLElement>element.querySelector('commerce-breadcrumbs > nav');
            expect(navEl).toBeDefined();
            expect(navEl.style.getPropertyValue('--com-c-breadcrumb-divider')).toBe("'>'");

            // Update to a valid divider
            element.divider = 'slash';
            await Promise.resolve();
            expect(navEl.style.getPropertyValue('--com-c-breadcrumb-divider')).toBe("'/'");

            // Update to an invalid divider
            element.divider = <never>'invalid';
            await Promise.resolve();
            expect(navEl.style.getPropertyValue('--com-c-breadcrumb-divider')).toBe("'>'");
        });

        it('should limit the number of rendered breadcrumbs based on media query', async () => {
            element.showHomeLink = true;
            element.maxDepthOnMobile = '3';
            BreadcrumbsTestAdapter.emit(breadcrumbs);
            matchMedia.useMediaQuery(MEDIA_QUERY_DESKTOP);
            await defer();

            let listEls = element.querySelectorAll<HTMLLIElement>('commerce-breadcrumbs > nav > ol > li');
            let labels = Array.from(listEls).map((listEl: Element) => listEl.textContent);
            expect(listEls).toHaveLength(4);
            expect(labels).toStrictEqual(['Home', 'Energy', 'Energy Bars', 'Energy Bars (vegan)']);

            matchMedia.useMediaQuery(MEDIA_QUERY_MOBILE);
            await defer();
            listEls = element.querySelectorAll<HTMLLIElement>('commerce-breadcrumbs > nav > ol > li');
            labels = Array.from(listEls).map((listEl: Element) => listEl.textContent);
            expect(listEls).toHaveLength(3);
            expect(labels).toStrictEqual(['Home', 'Energy', 'Energy Bars']);

            element.showHomeLink = false;
            await defer();
            listEls = element.querySelectorAll<HTMLLIElement>('commerce-breadcrumbs > nav > ol > li');
            labels = Array.from(listEls).map((listEl: Element) => listEl.textContent);
            expect(listEls).toHaveLength(3);
            expect(labels).toStrictEqual(['Energy', 'Energy Bars', 'Energy Bars (vegan)']);
        });

        it('should set a hard limit of depth to 5', async () => {
            element.showHomeLink = true;
            element.maxDepthOnMobile = '3';
            BreadcrumbsTestAdapter.emit(breadcrumbsLong);
            matchMedia.useMediaQuery(MEDIA_QUERY_DESKTOP);
            await defer();

            // Verify desktop is limited to a max of 5
            let listEls = element.querySelectorAll<HTMLLIElement>('commerce-breadcrumbs > nav > ol > li');
            let labels = Array.from(listEls).map((listEl: Element) => listEl.textContent);
            expect(listEls).toHaveLength(5);
            expect(labels).toStrictEqual([
                'Home',
                'Energy',
                'Energy Bars',
                'Energy Bars (vegan)',
                'Energy Bars (vegan squared)',
            ]);

            // Verify current mobile limit takes effect (i.e. 3)
            matchMedia.useMediaQuery(MEDIA_QUERY_MOBILE);
            await defer();
            listEls = element.querySelectorAll<HTMLLIElement>('commerce-breadcrumbs > nav > ol > li');
            labels = Array.from(listEls).map((listEl: Element) => listEl.textContent);
            expect(listEls).toHaveLength(3);
            expect(labels).toStrictEqual(['Home', 'Energy', 'Energy Bars']);

            // Verify invalid max mobile depth setting is cut to a max of 5
            element.maxDepthOnMobile = '6';
            await defer();
            listEls = element.querySelectorAll<HTMLLIElement>('commerce-breadcrumbs > nav > ol > li');
            labels = Array.from(listEls).map((listEl: Element) => listEl.textContent);
            expect(listEls).toHaveLength(5);
            expect(labels).toStrictEqual([
                'Home',
                'Energy',
                'Energy Bars',
                'Energy Bars (vegan)',
                'Energy Bars (vegan squared)',
            ]);

            // Verify a reset mobile depth is also cut to a max of 5
            element.maxDepthOnMobile = undefined;
            await defer();
            listEls = element.querySelectorAll<HTMLLIElement>('commerce-breadcrumbs > nav > ol > li');
            labels = Array.from(listEls).map((listEl: Element) => listEl.textContent);
            expect(listEls).toHaveLength(5);
            expect(labels).toStrictEqual([
                'Home',
                'Energy',
                'Energy Bars',
                'Energy Bars (vegan)',
                'Energy Bars (vegan squared)',
            ]);
        });

        it('should stop subsequent media query timeouts', async () => {
            element.showHomeLink = true;
            element.maxDepthOnMobile = '2';
            BreadcrumbsTestAdapter.emit(breadcrumbs);
            matchMedia.useMediaQuery(MEDIA_QUERY_MOBILE);
            await Promise.resolve();
            matchMedia.useMediaQuery(MEDIA_QUERY_DESKTOP);
            await defer();

            const listEls = element.querySelectorAll<HTMLLIElement>('commerce-breadcrumbs > nav > ol > li');
            const labels = Array.from(listEls).map((listEl: Element) => listEl.textContent);
            expect(listEls).toHaveLength(4);
            expect(labels).toStrictEqual(['Home', 'Energy', 'Energy Bars', 'Energy Bars (vegan)']);
        });

        it('should not fail on invalid breadcrumbs data', async () => {
            element.showHomeLink = true;
            BreadcrumbsTestAdapter.emit('invalid');
            await Promise.resolve();

            const listEls = element.querySelectorAll<HTMLLIElement>('commerce-breadcrumbs > nav > ol > li');
            const labels = Array.from(listEls).map((listEl: Element) => listEl.textContent);
            expect(listEls).toHaveLength(1);
            expect(labels).toStrictEqual(['Home']);
        });
    });

    describe('handleNavigateToPage()', () => {
        it('should navigate to the clicked page', async () => {
            const mockContext = jest.fn();
            element.showHomeLink = true;
            element.showLastItemAsLink = true;
            BreadcrumbsTestAdapter.emit(breadcrumbs);
            NavigationContextTestAdapter.emit(mockContext);
            await Promise.resolve();

            const anchorEls = element.querySelectorAll<HTMLLIElement>('commerce-breadcrumbs > nav > ol > li > a');
            expect(anchorEls).toHaveLength(4);

            // Click 2nd element -> the first product category entry
            anchorEls.item(1).click();
            expect(navigate).toHaveBeenCalledTimes(1);
            expect(navigate).toHaveBeenCalledWith(mockContext, breadcrumbs[0].pageReference);

            // Click 1st element -> the manually added Home entry
            anchorEls.item(0).click();
            expect(navigate).toHaveBeenCalledTimes(2);
            expect(navigate).toHaveBeenNthCalledWith(2, mockContext, {
                type: 'comm__namedPage',
                attributes: {
                    name: 'Home',
                },
            });
        });
    });
});
