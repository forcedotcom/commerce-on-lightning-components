import webstoreId from '@salesforce/webstore/Id';
import { currentRelease } from 'commerce/config';
import type { AppContextData } from './types';
import { fetchService } from 'experience/data';

const API_VERSION = currentRelease.apiVersion;

export async function readAppContext(): Promise<AppContextData> {
    const endPointUrl = `/services/data/${API_VERSION}/commerce/webstores/${webstoreId}/application-context`;

    // CAUTION: Before you blindly implement task W-11747147 and always set the asGuest flag to true for
    // this request, pause for a moment. The topic is more complex than described in the work item and
    // requires the implementation of TD-0128396 and/or TD-0126206.
    return fetchService<AppContextData>(endPointUrl).catch((response: Response) => {
        throw new Error(response.statusText);
    });
}
