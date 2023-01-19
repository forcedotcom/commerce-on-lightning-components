import generateLabel from '../../facet/facetLabelGenerator';

// Mock the labels with known values.
jest.mock('../labels.js', () => ({
    toggleFilterExpandedAssistiveText: 'Toggle filter, expanded',
    toggleFilterCollapsedAssistiveText: 'Toggle filter, collapsed',
}));

describe('commerce_search/facet: Facet Label Generator', () => {
    [
        {
            expanded: true,
            result: 'Toggle filter, expanded',
        },
        {
            expanded: false,
            result: 'Toggle filter, collapsed',
        },
    ].forEach((data) => {
        it(`returns the label "${data.result}" when facet being expanded is ${data.expanded}`, () => {
            const labelStr = generateLabel(data.expanded);
            expect(labelStr).toBe(data.result);
        });
    });
});
