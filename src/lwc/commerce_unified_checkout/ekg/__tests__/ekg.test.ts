import * as ekg from 'commerce_unified_checkout/ekg';

describe('ekg - add markers', () => {
    it('calling start creates a MarkerEntry', () => {
        ekg.start('example-1');
        const markers: ekg.Markers = ekg.getMarkers();
        const markerEntry: ekg.MarkerEntry = markers['example-1'];
        expect(markerEntry).toBeDefined();
    });
    it('start marker is added correctly', () => {
        ekg.start('example-1');
        const markers: ekg.Markers = ekg.getMarkers();
        const markerEntry: ekg.MarkerEntry = markers['example-1'];
        expect(markerEntry.start).toBeDefined();
    });
    it('end marker is added correctly', () => {
        ekg.start('example-1');
        ekg.end('example-1');
        const markers: ekg.Markers = ekg.getMarkers();
        const markerEntry: ekg.MarkerEntry = markers['example-1'];
        expect(markerEntry.end).toBeDefined();
    });
});

describe('ekg - log markers', () => {
    let element: HTMLElement;
    beforeEach(() => {
        element = document.createElement('div');
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('markers are added to data-*', () => {
        ekg.start('example-1');
        ekg.end('example-1');
        ekg.setHostElementForEkg(element);
        ekg.publishEkgLogs();
        const attr = element.getAttribute('data-ekg');
        const str: string = attr ? attr : '';
        expect(JSON.parse(str)).toHaveProperty('example-1');
    });
});
