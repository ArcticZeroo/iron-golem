const fs = require('fs');
const mojang = require('mojang');

async function mojangCall(call, ...args) {
    let res;
    try {
        res = await mojang[call](...args);
    } catch (e) {
        throw e;
    }

    if (res.errorMessage) {
        throw new Error(res.errorMessage);
    }

    if (res.error) {
        throw new Error(res.error);
    }

    return res;
}

async function create(username, password) {
    try {
        const {accessToken, clientToken, selectedProfile} = await mojangCall('auth', username, password, null, {name: 'Minecraft', version: 1});

        return {accessToken, clientToken, selectedProfile};
    } catch (e) {
        throw e;
    }
}

async function validate(session) {
    try {
        await mojangCall('validate', session.accessToken, session.clientToken);

        // It worked, so yay
        return true;
    } catch (e) {
        // Return true if empty response (which is what mojang sends on success),
        // false if anything else.
        return (e.message || e || '').toLowerCase().includes('no data received');
    }
}

async function refresh(session) {
    return mojangCall('refresh', session.accessToken, session.clientToken, session.selectedProfile);
}

/**
 * Save a session to a file.
 * @param {object} session - The session to save.
 * @param {string} name - A name to append to the file name.
 * @returns {Promise}
 */
async function save(session, name) {
    return new Promise((resolve, reject) => {
        fs.writeFile(`../../session${name ? `-${name.toLowerCase()}` : ''}.json`, JSON.stringify(session), function (err) {
            if (err) {
                reject(err);
            }

            resolve();
        });
    });
}

/**
 * Attempt to load the sessions file.
 * @param {string} name - A name to append to the file.
 * @returns {Promise}
 */
async function load(name) {
    return new Promise((resolve, reject) => {
        fs.readFile(`../../session${name ? `-${name.toLowerCase()}` : ''}`, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            }

            let session;
            try {
                session = JSON.parse(data);
            } catch (e) {
                reject(e);
            }

            resolve(session);
        });
    });
}

/**
 * Attempt to get a session from local file storage.
 * <p>
 * If the session exists in local storage, it will
 * be validated, and refreshed as needed.
 * <p>
 * If the file does not exist, or refresh fails,
 * an error is thrown.
 * @param {string} name - The name used to save the file.
 * @returns {Promise.<*>}
 */
async function getSessionFromSaved(name) {
    let session;
    try {
        session = await load(name);
    } catch (e) {
        throw e;
    }

    try {
        await validate(session);
    } catch (validateErr) {
        try {
            session = await refresh(session);
        } catch (e) {
            throw e;
        }
    }

    // Returns a saved and validated session,
    // or a refreshed session.
    return session;
}

async function getValidSession(username, password, name) {
    let session;
    try {
        session = await getSessionFromSaved(name);
    } catch (retrieveErr) {
        // If it can't be retrieved, make a new one
        try {
            session = await create(username, password);
        } catch (e) {
            throw e;
        }
    }

    try {
        await save(session, name);
    } catch (e) {
        throw e;
    }

    return session;
}

module.exports = getValidSession;