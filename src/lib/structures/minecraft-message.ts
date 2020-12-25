import { ReplyFormatter } from '../../models/message';
import { Client } from '../client/client';

export class MinecraftMessage {
    public client: Client;
    public replyFormatter: ReplyFormatter;
    public type: string;
    public sender: string;
    public text: string;
    public fullText: string;

    /**
     * Create a MinecraftMessage instance.
     * @param {object} client - The client to use when sending messages, etc.
     * @param {object} [data] - Data to apply to this instance, if applicable
     */
    constructor(client: Client, data?: Record<string, unknown>) {
        this.client = client;
        // If no replyFormatter is given, just send the text.
        /**
         * The replyFormatter to use in {@link Client#reply}.
         * This should take (text, sender) as params,
         * where text is the text to reply with and
         * sender is the original message sender, if applicable.
         * <p>
         * By default, this just returns the original text without
         * modifications.
         * @param text
         */
        this.replyFormatter = text => text;

        if (data) {
            this.setup(data);
        }
    }

    static get defaultReplyFormatter(): ReplyFormatter {
        return text => text;
    }

    /**
     * Reply to a message with text.
     * By default, this literally just sends the message in chat.
     * Change {@link Client.replyFormatter} for a different result.
     * @param text
     */
    reply(text: string) {
        if (!this.replyFormatter) {
            this.replyFormatter = MinecraftMessage.defaultReplyFormatter;
        }

        return this.client.send(this.replyFormatter(text, this.sender));
    }

    /**
     * Add data to this MinecraftMessage.
     * @param data
     */
    setup(data: Record<string, unknown>) {
        /**
         * @namespace
         * @property {string} MinecraftMessage.text - The text of the message. This is only what the user sent, not what the server did. Extra info should be removed.
         * @property {string} MinecraftMessage.fullText - The full text of the message. This includes all the extra garbage the server sent in the message.
         */
        Object.assign(this, data);
    }
}

module.exports = MinecraftMessage;