const fs = require('fs');
const mojang = require('mojang');

const debug = process.env.NODE_ENV === 'dev' ? console.log : function() {};

async function mojangCall(call, ...args) {
    debug(`making mojang call to ${call}`);

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

    debug('call is good!');

    return res;
}

async function create(username, password) {
    debug(`creating an auth from username and pass: ${username}|${password}`);
    try {
        const {accessToken, clientToken, selectedProfile} = await mojangCall('auth', username, password, null, {name: 'Minecraft', version: 1});

        return {accessToken, clientToken, selectedProfile};
    } catch (e) {
        throw e;
    }
}

async function validate(session) {
    debug(`validating an existing session: ${JSON.stringify(session)}`);
    try {
        await mojangCall('validate', session.accessToken, session.clientToken);

        debug('still valid!');

        // It worked, so yay
        return true;
    } catch (e) {
        debug('the session is invalid :(');
        debug(e);

        // Return true if empty response (which is what mojang sends on success),
        // false if anything else.
        return (e.message || e || '').toLowerCase().includes('no data received');
    }
}

async function refresh(session) {
    debug(`refreshing a session from an existing one: ${JSON.stringify(session)}`);
    return mojangCall('refresh', session.accessToken, session.clientToken, session.selectedProfile);
}

/**
 * Save a session to a file.
 * @param {object} session - The session to save.
 * @param {string} name - A name to append to the file name.
 * @returns {Promise}
 */
async function save(session, name) {
    debug(`saving a session to a file: name ${name} and contents ${JSON.stringify(session)}`);
    return new Promise((resolve, reject) => {
        fs.writeFile(`./session${name ? `-${name.toLowerCase()}` : ''}.json`, JSON.stringify(session), function (err) {
            if (err) {
                debug(`could not save session: ${err.toString()}`);
                reject(err);
                return;
            }

            debug('saved!');
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
    debug(`loading session of name ${name} from file`);
    return new Promise((resolve, reject) => {
        fs.readFile(`./session${name ? `-${name.toLowerCase()}` : ''}.json`, 'utf8', function (err, data) {
            if (err) {
                debug(`could not load session: ${err.toString()}`);
                reject(err);
                return;
            }

            let session;
            try {
                session = JSON.parse(data);
            } catch (e) {
                debug(`could not parse session data: ${e.toString()}`);
                reject(e);
                return;
            }

            debug('loaded session!');
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
    } catch (loadErr) {
        throw loadErr;
    }

    const isValid = await validate(session);

    if (!isValid) {
        try {
            session = await refresh(session);
        } catch (refreshErr) {
            throw refreshErr;
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