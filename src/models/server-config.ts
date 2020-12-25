import { ReplyFormatter } from './message';

export interface IServerChatConfig {
    name: string;
    regex: RegExp;
    matches: string[];
    replyFormatter?: ReplyFormatter;
}

export interface IServerConfig {
    server: RegExp;
    name: string;
    version?: string;
    chatDelay?: number;
    chat?: IServerChatConfig[];
}