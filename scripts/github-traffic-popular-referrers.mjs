/**
 * @typedef {object} Context
 * @property {import('@octokit/core').Octokit} client
 * @property {string} owner
 * @property {string} repo
 * @property {string} apiVersion
 * @property {string} [gistId]
 */

import { readGist, writeGist } from './github-traffic-shared.mjs';

const EMPTY_GIST = {};
const FILE_NAME = 'popular-referrers.json';
const GIST_DESCRIPTION = 'GitHub Traffic Statistics - Popular Referrers';

/**
 * @param {Context} context
 * @see {@link https://docs.github.com/en/rest/metrics/traffic#get-top-referral-sources}
 * @returns {Promise<void>}
 */
export function updatePopularReferrers(context) {
    console.log('[popular/referrers] Fetching popular referrers data from GitHub...');
    const { client, owner, repo, apiVersion } = context;
    return client
        .request('GET /repos/{owner}/{repo}/traffic/popular/referrers', {
            owner,
            repo,
            headers: {
                'X-GitHub-Api-Version': apiVersion,
            },
        })
        .then(
            async ({ data }) => {
                console.log('[popular/referrers] Successfully fetched popular referrers data from GitHub');

                const stats = await readGist({
                    ...context,
                    category: 'popular/referrers',
                    fallback: EMPTY_GIST,
                    fileName: FILE_NAME,
                });
                for (const entry of data) {
                    // No matter if the entry already exists in the stats,
                    // we simply create or update it that way
                    stats[entry.referrer] = {
                        count: entry.count,
                        uniques: entry.uniques,
                    };
                }

                return writeGist(
                    {
                        ...context,
                        category: 'popular/referrers',
                        fileName: FILE_NAME,
                        gistDescription: GIST_DESCRIPTION,
                    },
                    stats
                );
            },
            (error) => {
                const message = error instanceof Error ? error.message : String(error);
                console.error('[popular/referrers] Error fetching popular referrers data from GitHub', message);
                throw error;
            }
        );
}
