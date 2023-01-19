import { mockData } from './mockData';
import type { EinsteinContextData } from '../types';

export function readEinsteinContext(): Promise<EinsteinContextData> {
    return Promise.resolve({ ...mockData.einsteinData });
}
