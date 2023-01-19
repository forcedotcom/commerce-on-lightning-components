import webstoreId from '@salesforce/webstore/Id';
import type { EinsteinContextData } from './types';
import { currentRelease } from 'commerce/config';
import { fetchService } from 'experience/data';

const API_VERSION = currentRelease.apiVersion;

export async function readEinsteinContext(): Promise<EinsteinContextData> {
    const endPointUrl = `/services/data/${API_VERSION}/commerce/webstores/${webstoreId}/ai/configuration`;

    return fetchService<EinsteinContextData>(endPointUrl).catch((response: Response) => {
        throw new Error(response.statusText);
    });
}
