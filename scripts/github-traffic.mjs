#!/usr/bin/env node --no-warnings
import { updateClones } from './github-traffic-clones.mjs';
import { updatePopularPaths } from './github-traffic-popular-paths.mjs';
import { updatePopularReferrers } from './github-traffic-popular-referrers.mjs';
import { Octokit } from '@octokit/core';

const { GH_TOKEN } = process.env;
if (typeof GH_TOKEN !== 'string') {
    throw new TypeError(`No environment variable 'GH_TOKEN' defined.`);
}
if (typeof process.env.GIST_ID_CLONES !== 'string') {
    console.warn(`No environment variable 'GIST_ID_CLONES' defined.`);
}
if (typeof process.env.GIST_ID_POPULAR_PATHS !== 'string') {
    console.warn(`No environment variable 'GIST_ID_POPULAR_PATHS' defined.`);
}
if (typeof process.env.GIST_ID_POPULAR_REFERRERS !== 'string') {
    console.warn(`No environment variable 'GIST_ID_POPULAR_REFERRERS' defined.`);
}

const octokit = new Octokit({
    auth: GH_TOKEN,
});

const context = {
    client: octokit,
    owner: 'forcedotcom',
    repo: 'commerce-on-lightning-components',
    apiVersion: '2022-11-28',
};

console.log('[traffic] Fetching traffic data from GitHub...');

Promise.allSettled([
    updateClones(
        Object.freeze({
            ...context,
            gistId: process.env.GIST_ID_CLONES,
        })
    ),
    updatePopularPaths(
        Object.freeze({
            ...context,
            gistId: process.env.GIST_ID_POPULAR_PATHS,
        })
    ),
    updatePopularReferrers(
        Object.freeze({
            ...context,
            gistId: process.env.GIST_ID_POPULAR_REFERRERS,
        })
    ),
]).then(
    () => {
        console.log('[traffic] Successfully fetched traffic data from GitHub');
    },
    (error) => {
        console.error('[traffic] Error fetching traffic data from GitHub', error);
    }
);
