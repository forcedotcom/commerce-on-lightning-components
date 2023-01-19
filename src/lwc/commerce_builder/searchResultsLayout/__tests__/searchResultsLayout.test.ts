import { createElement } from 'lwc';
import MatchMediaMock from 'jest-matchmedia-mock';
import SearchResultsLayout from '../searchResultsLayout';

describe('Search Results Layout', () => {
    let element: SearchResultsLayout & HTMLElement;
    let matchMedia: MatchMediaMock;

    describe('mobile', () => {
        beforeEach(async () => {
            matchMedia = new MatchMediaMock();
            element = createElement('commerce_builder-search-results-layout', {
                is: SearchResultsLayout,
            });
            document.body.appendChild(element);
            await Promise.resolve();
        });
        afterEach(() => {
            document.body.removeChild(element);
            matchMedia.destroy();
        });
        it('is displayed when the window reaches the mobile threshold size', () => {
            expect(element.querySelector('.mobile')).not.toBeNull();
        });
    });

    describe('desktop', () => {
        beforeEach(async () => {
            matchMedia = new MatchMediaMock();
            window.matchMedia = jest.fn().mockImplementation(() => ({
                matches: true,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
            }));
            element = createElement('commerce_builder-search-results-layout', {
                is: SearchResultsLayout,
            });
            document.body.appendChild(element);
            await Promise.resolve();
        });
        afterEach(() => {
            document.body.removeChild(element);
            matchMedia.destroy();
        });
        it('is displayed when the window reaches the desktop threshold size', () => {
            expect(element.querySelector('.desktop')).not.toBeNull();
        });
    });
});
