/**
 * @typedef {object} ReadContext
 * @property {import('@octokit/core').Octokit} client
 * @property {string} owner
 * @property {string} repo
 * @property {string} apiVersion
 * @property {string} [gistId]
 * @property {*} fallback
 * @property {string} category
 * @property {string} fileName
 */

/**
 * @typedef {object} WriteContext
 * @property {import('@octokit/core').Octokit} client
 * @property {string} owner
 * @property {string} repo
 * @property {string} apiVersion
 * @property {string} [gistId]
 * @property {string} category
 * @property {string} fileName
 * @property {string} gistDescription
 */

/**
 * @param {ReadContext} context
 * @returns {Promise<{[key: string]: *}>}
 * @see {@link https://docs.github.com/en/rest/gists/gists#get-a-gist}
 */
export async function readGist(context) {
    const { gistId, fallback } = context;
    if (typeof gistId !== 'string') {
        return fallback;
    }

    const { client, apiVersion, category, fileName } = context;
    console.log(`[${category}] Fetching Gist '${gistId}' from GitHub...`);
    return client
        .request('GET /gists/{gist_id}', {
            gist_id: gistId,
            headers: {
                'X-GitHub-Api-Version': apiVersion,
            },
        })
        .then(
            ({ data }) => {
                console.log(`[${category}] Successfully fetched Gist '${gistId}' from GitHub`);
                const content = data?.files?.[fileName]?.content;
                return JSON.parse(content);
            },
            (error) => {
                const message = error instanceof Error ? error.message : String(error);
                console.error(`[${category}] Error fetching Gist '${gistId}' from GitHub`, message);
                return fallback;
            }
        );
}

/**
 * @param {WriteContext} context
 * @param {{[key: string]: *}} stats
 * @returns {Promise<void>}
 * @see {@link https://docs.github.com/en/rest/gists/gists#create-a-gist}
 */
function createGist(context, stats) {
    const { client, apiVersion, category, fileName, gistDescription } = context;
    console.log(`[${category}] Creating new Gist on GitHub...`);
    return client
        .request('POST /gists', {
            description: gistDescription,
            public: false,
            files: { [fileName]: { content: JSON.stringify(stats, null, 4) } },
            headers: {
                'X-GitHub-Api-Version': apiVersion,
            },
        })
        .then(
            ({ data }) => {
                console.log(`[${category}] Successfully created new Gist '${data.id}' on GitHub`);
            },
            (error) => {
                const message = error instanceof Error ? error.message : String(error);
                console.error(`[${category}] Error creating new Gist on GitHub`, message);
            }
        );
}

/**
 * @param {WriteContext} context
 * @param {{[key: string]: *}} stats
 * @returns {Promise<void>}
 * @see {@link https://docs.github.com/en/rest/gists/gists#create-a-gist}
 * @see {@link https://docs.github.com/en/rest/gists/gists#update-a-gist}
 */
export async function writeGist(context, stats) {
    const { client, gistId, apiVersion, category, fileName } = context;
    if (typeof gistId === 'string') {
        console.log(`[${category}] Updating Gist '${gistId}' on GitHub...`);
        return client
            .request('PATCH /gists/{gist_id}', {
                gist_id: gistId,
                files: { [fileName]: { content: JSON.stringify(stats, null, 4) } },
                headers: {
                    'X-GitHub-Api-Version': apiVersion,
                },
            })
            .then(
                ({ data }) => {
                    console.log(`[${category}] Successfully updated Gist '${gistId}' on GitHub`);
                },
                (error) => {
                    const message = error instanceof Error ? error.message : String(error);
                    console.error(`[${category}] Error updating Gist '${gistId}' on GitHub`, message);
                    return createGist(context, stats);
                }
            );
    }
    return createGist(context, stats);
}
