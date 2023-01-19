// eslint-disable-next-line @lwc/lwc/no-disallowed-lwc-imports
import type { WireAdapter } from 'lwc';

declare class TestWireAdapter implements WireAdapter {
    /**
     * Emits any value of any shape.
     * @param value The value to emit to the component
     * @param filterFn When provided, it will be invoked for every adapter instance on the
     *                 component with its associated config; if it returns true, the value will be
     *                 emitted to that particular instance.
     */
    public static emit<T = Record<string, unknown>>(value: T, filterFn?: (config) => boolean): void;

    /**
     * Gets the last resolved config. Useful if component @wire uses includes
     * dynamic parameters.
     */
    public static getLastConfig(): Record<string, unknown>;
}

type identifier = (...unknown) => unknown | undefined;
declare module '@salesforce/wire-service-jest-util' {
    export function createTestWireAdapter(identifier?: (...unknown) => unknown): TestWireAdapter;
    export type TestWireAdapter = TestWireAdapter;
}
