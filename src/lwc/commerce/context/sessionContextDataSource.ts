import webstoreId from '@salesforce/webstore/Id';
import type { SessionContextData } from './types';
import { currentRelease } from 'commerce/config';
import { fetchService } from 'experience/data';

const API_VERSION = currentRelease.apiVersion;

// This is temporary until the app & session service are split
export async function readSessionContext(): Promise<SessionContextData> {
    const endPointUrl = `/services/data/${API_VERSION}/commerce/webstores/${webstoreId}/session-context`;

    return fetchService<SessionContextData>(endPointUrl).catch((response: Response) => {
        throw new Error(response.statusText);
    });
}
