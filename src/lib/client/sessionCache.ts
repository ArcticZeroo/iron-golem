import * as fs from 'fs';
import * as mojang from 'mojang';
import { IMojangSession } from 'mojang';

interface IErrorResponse {
    errorMessage?: string;
    error: string;
}

const isErrorResponse = (value: unknown): value is IErrorResponse => value.hasOwnProperty('errorMessage')
                                                                     || value.hasOwnProperty('error');

async function handleMojangCall<T>(call: Promise<T>) {
    let res: IErrorResponse | T;
    try {
        res = await call;
    } catch (e) {
        throw e;
    }

    if (isErrorResponse(res)) {
        throw new Error(res.errorMessage || res.error);
    }

    return res;
}

async function startSession(username: string, password: string) {
    try {
        const { accessToken, clientToken, selectedProfile } = await handleMojangCall(mojang.authenticate({
            username,
            password,
            agent: { name: 'Minecraft', version: 1 }
        }));

        return { accessToken, clientToken, selectedProfile };
    } catch (e) {
        throw e;
    }
}

async function isSessionValid(session: IMojangSession) {
    try {
        // It worked, so yay
        return await handleMojangCall(mojang.isValid({
            accessToken: session.accessToken,
            clientToken: session.clientToken
        }));
    } catch (e) {
        // Return true if empty response (which is what mojang sends on success),
        // false if anything else.
        return (e.message || e || '').toLowerCase().includes('no data received');
    }
}

async function refreshSession(session: IMojangSession) {
    return await mojang.refresh(session);
}

const getSessionFileName = (name: string) => `./session${name ? `-${name.toLowerCase()}` : ''}.json`;

/**
 * Save a session to a file.
 * @param {object} session - The session to save.
 * @param {string} sessionName - A name to append to the file name.
 * @returns {Promise}
 */
async function save(session: IMojangSession, sessionName: string) {
    const fileName = getSessionFileName(sessionName);
    await fs.promises.writeFile(fileName, JSON.stringify(session));
}

/**
 * Attempt to load the sessions file.
 * @param {string} sessionName - A name to append to the file.
 * @returns {Promise}
 */
async function loadSessionFromFile(sessionName: string) {
    const fileName = getSessionFileName(sessionName);
    const data = await fs.promises.readFile(fileName, 'utf-8');
    return JSON.parse(data);
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
async function getSessionFromSaved(name: string) {
    let session = await loadSessionFromFile(name);

    const isValid = await isSessionValid(session);

    if (!isValid) {
        session = await refreshSession(session);
    }

    // Returns a saved and validated session,
    // or a refreshed session.
    return session;
}

async function getValidSession(username: string, password: string, name: string) {
    let session;
    try {
        session = await getSessionFromSaved(name);
    } catch (retrieveErr) {
        // If it can't be retrieved, make a new one
        session = await startSession(username, password);
    }

    await save(session, name);

    return session;
}

module.exports = getValidSession;