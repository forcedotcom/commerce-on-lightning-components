/**
 * @typedef {object} Context
 * @property {import('@octokit/core').Octokit} client
 * @property {string} owner
 * @property {string} repo
 * @property {string} apiVersion
 * @property {string} [gistId]
 */

import { readGist, writeGist } from './github-traffic-shared.mjs';

const EMPTY_GIST = { count: 0, clones: {} };
const FILE_NAME = 'clones.json';
const GIST_DESCRIPTION = 'GitHub Traffic Statistics - Clones';

/**
 * @param {Context} context
 * @see {@link https://docs.github.com/en/rest/metrics/traffic#get-repository-clones}
 * @returns {Promise<void>}
 */
export function updateClones(context) {
    console.log('[clones] Fetching clones data from GitHub...');
    const { client, owner, repo, apiVersion } = context;
    return client
        .request('GET /repos/{owner}/{repo}/traffic/clones', {
            owner,
            repo,
            headers: {
                'X-GitHub-Api-Version': apiVersion,
            },
        })
        .then(
            async ({ data }) => {
                console.log('[clones] Successfully fetched clones data from GitHub');
                const stats = await readGist({
                    ...context,
                    category: 'clones',
                    fileName: FILE_NAME,
                    fallback: EMPTY_GIST,
                });
                for (const clone of data.clones) {
                    if (Reflect.has(stats.clones, clone.timestamp)) {
                        // Key already exists -> Check for changes
                        const entry = Reflect.get(stats.clones, clone.timestamp);
                        if (entry.count !== clone.count) {
                            stats.count -= entry.count; // <- Reduce overall count by old value
                            stats.count += clone.count; // <- Add new value to overall count
                            Reflect.set(stats.clones, clone.timestamp, {
                                count: clone.count,
                                uniques: clone.uniques,
                            });
                        }
                    } else {
                        // Key doesn't exist -> Update stats
                        stats.count += clone.count;
                        stats.clones = {
                            ...stats.clones,
                            [clone.timestamp]: {
                                count: clone.count,
                                uniques: clone.uniques,
                            },
                        };
                    }
                }
                return writeGist(
                    {
                        ...context,
                        category: 'clones',
                        fileName: FILE_NAME,
                        gistDescription: GIST_DESCRIPTION,
                    },
                    stats
                );
            },
            (error) => {
                const message = error instanceof Error ? error.message : String(error);
                console.error('[clones] Error fetching clones data from GitHub', message);
                throw error;
            }
        );
}
