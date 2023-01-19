import type { AppContextData, EinsteinContextData, SessionContextData } from '../types';
// eslint-disable-next-line jest/no-mocks-import
import { mockData } from '../__mocks__/mockData';

export const sessionContextResponse = (m: Partial<SessionContextData> = {}): Promise<SessionContextData> =>
    Promise.resolve(Object.assign({}, mockData.sessionData, m));

export const appContextResponse = (m: Partial<AppContextData> = {}): Promise<AppContextData> =>
    Promise.resolve(Object.assign({}, mockData.appData, m));

export const einsteinContextResponse = (m: Partial<EinsteinContextData> = {}): Promise<EinsteinContextData> =>
    Promise.resolve(Object.assign({}, mockData.einsteinData, m));
