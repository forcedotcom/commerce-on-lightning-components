export interface MarkerEntry {
    start?: number;
    end?: number;
}

export interface Markers {
    [key: string]: MarkerEntry;
}

export interface MarkersDiff {
    [key: string]: number;
}

/**
 * Main object that holds all the markers.
 * e.g.
 *    markers = {
 *       't-example': {
 *           start: 1000,
 *           end: 1500
 *       }
 *    }
 */
const markers: Markers = {};
let _hostElement: HTMLElement | null = null;

/**
 * Gives difference between start & end markers for all markers.
 *
 * @returns markersDiff {MarkersDiff}
 */
export function getAllMarkersDiff(): MarkersDiff {
    const markerDiff: MarkersDiff = {};
    Object.keys(markers).forEach((key) => {
        const markerEntry: MarkerEntry = markers[key];
        if (markerEntry.start && markerEntry.end) {
            markerDiff[key] = Math.round(markerEntry.end - markerEntry.start);
        }
    });
    return markerDiff;
}

/**
 * Returns the markers object.
 *
 * @returns markers {Markers}
 */
export function getMarkers(): Markers {
    return markers;
}

/**
 * Add 'start' to the provided key.
 *
 * @param key {string}
 * @returns void
 */
export function start(key: string): void {
    markers[key] = markers[key] ? markers[key] : {}; // Create the holding obj only if it is not there.
    if (!markers[key].start) {
        markers[key].start = performance.now();
    }
}

/**
 * Add 'end' to the provided key.
 *
 * @param key {string}
 * @returns void
 */
export function end(key: string): void {
    if (markers[key] && markers[key].start && !markers[key].end) {
        markers[key].end = performance.now(); // only mark the first end. Don't overwrite
    }
}

/**
 * Set host element which will be used by publishEkgLogs method.
 *
 * @param hostElement {HTMLElement}
 * @returns void
 */
export function setHostElementForEkg(hostElement: HTMLElement | null): void {
    _hostElement = hostElement;
}

/**
 * Add the markers to previously provided element in setHostElementForEkg method.
 *
 * @returns void
 */
export function publishEkgLogs(): void {
    const all: MarkersDiff = getAllMarkersDiff();
    _hostElement?.setAttribute('data-ekg', JSON.stringify(all));
}

// Start markers
start('t-ekg-to-shipping-interactive');
start('t-checkout-1');
start('t-address-1');
