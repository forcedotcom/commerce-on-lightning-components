import type { Breadcrumb } from 'commerce/breadcrumbs';
import type { ProductCategoryPathItemData } from 'commerce/productApiInternal';

type MapEntry = Record<string | symbol, boolean>;

const map = new WeakMap<EventTarget, MapEntry>();
const defaultKey: unique symbol = Symbol();

/**
 * Store the information about the loading state of a certain data portion related to a given target.
 *
 * In order to retrieve a target's the overall loading state, the function {@link isDataAvailable}
 * can be used.
 *
 * @param {EventTarget} target The element to store the loading state information for
 * @param {boolean} state The loading state flag
 * @param {string} [prop] An optional portion/slice of an overall loading state
 */
export function updateDataAvailable(target: EventTarget, state: boolean, prop?: string): void {
    !map.has(target) && map.set(target, {});

    const key = typeof prop === 'string' && prop.trim().length > 0 ? prop : defaultKey;
    const data = <MapEntry>map.get(target);
    data[key] = state;
}

/**
 * Returns the overall loading state of a given target.
 *
 * In order to store a target's overall loading state (or portions of it), the function
 * {@link updateDataAvailable} can be used.
 *
 * @param {EventTarget} target The element to retrieve the loading state information for
 * @param {string} [prop] An optional portion/slice of an overall loading state
 * @returns {boolean} The loading state flag
 */
export function isDataAvailable(target: EventTarget, prop?: string): boolean {
    const data = map.get(target) ?? {};
    const hasData = (p: string | symbol): boolean => Reflect.has(data, p) && data[p];
    if (typeof prop === 'string') {
        return hasData(prop);
    }
    const keys = Reflect.ownKeys(data);
    return keys.length > 0 && keys.every((key: string | symbol) => hasData(key));
}

/**
 * Transforms an array of product category paths into a valid breadcrumbs array representation.
 *
 * @param {ProductCategoryPathItemData[]} paths The array to be transformed
 * @returns {Breadcrumb[]} The transformed array to be used in breadcrumbs component
 */
export function transformToBreadcrumbs(paths: ProductCategoryPathItemData[] | undefined): Breadcrumb[] {
    if (!Array.isArray(paths)) {
        return [];
    }
    return paths.map((path: ProductCategoryPathItemData) => ({
        label: path.name,
        pageReference: {
            type: 'standard__recordPage',
            attributes: {
                objectApiName: 'ProductCategory',
                recordId: path.id,
                actionName: 'view',
            },
            state: {
                categoryPath: 'ProductCategory',
            },
        },
    }));
}
