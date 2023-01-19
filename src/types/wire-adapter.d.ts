import type { TestWireAdapter } from '@salesforce/wire-service-jest-util';
/* eslint-disable-next-line @lwc/lwc/no-disallowed-lwc-imports */
import type { WireAdapterConstructor } from 'lwc';

export type MockWireAdapter<TAdapter extends WireAdapterConstructor> = TAdapter & typeof TestWireAdapter;
