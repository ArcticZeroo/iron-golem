declare module 'mojang' {
    export interface ICustomSession {
        id: string;
        name: string;
        timestamp: number;
        skin: string;
        cape: string;
        isSlim: boolean;
    }

    export interface IProfile {
        id: string;
        name: string;
    }

    export interface IMojangSession {
        clientToken: string;
        accessToken: string;
        selectedProfile?: IProfile;
        availableProfiles?: IProfile[];
        user?: {
            id: string;
        }
    }

    export function status(): void;

    export function getProfile(): void;

    export function getProfileHistory(): void;

    export function lookupProfiles(): void;

    export function lookupProfileAt(): void;

    export function getOrdersStatistics(): void;

    interface ICredentials {
        username: string;
        password: string;
        clientToken?: string;
        agent?: {
            name: string;
            version: number;
        }
    }

    export function authenticate(credentials: ICredentials): Promise<IMojangSession>;

    export function isValid(session: IMojangSession): Promise<boolean>;

    export function refresh(session: IMojangSession): Promise<IMojangSession>;

    export function invalidate(): void;

    export function signout(): void;

    export function isSecure(): void;

    export function getChallenges(): void;

    export function answerChallenges(): void;

    export function getSession(): void;

    export function getBlockedServers(): void;

    export function getUser(): void;

    export function setSkin(): void;

    export function uploadSkin(): void;

    export function resetSkin(): void;

    export function getUserProfiles(): void;

    export function getUserCapeData(): void;
}