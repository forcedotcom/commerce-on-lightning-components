import type { AppContextData } from '../types';
import { mockData } from './mockData';

export function readAppContext(): Promise<AppContextData> {
    return Promise.resolve({ ...mockData.appData });
}
