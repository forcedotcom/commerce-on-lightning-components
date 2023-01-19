import generateLabel from '../../inputFacet/inputFacetLabelGenerator';

// Mock the labels with known values.
jest.mock('../labels', () => ({
    showMoreLabel: 'Show More',
    showLessLabel: 'Show Less',
    showMoreAriaLabel: 'Show More {name}',
    showLessAriaLabel: 'Show Less {name}',
}));

describe('commerce_search/inputFacet: Input Facet Label Generator', () => {
    [
        {
            expanded: true,
            facetName: 'Color',
            result: 'Show Less Color',
        },
        {
            expanded: false,
            facetName: 'Color',
            result: 'Show More Color',
        },
    ].forEach((data) => {
        it(`returns the label "${data.result}" when expanded is ${data.expanded}`, () => {
            const labelStr = generateLabel(data.expanded, data.facetName);
            expect(labelStr).toBe(data.result);
        });
    });
});
