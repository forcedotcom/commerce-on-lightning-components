import { mockData } from './mockData';
import type { SessionContextData } from '../types';

export function readSessionContext(): Promise<SessionContextData> {
    return Promise.resolve({ ...mockData.sessionData });
}
