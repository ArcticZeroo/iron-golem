class MinecraftMessage {
    /**
     * Create a MinecraftMessage instance.
     * @param {object} client - The client to use when sending messages, etc.
     * @param {object} [data] - Data to apply to this instance, if applicable
     */
    constructor(client, data) {
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

    static get defaultReplyFormatter () {
        return text => text;
    }

    /**
     * Reply to a message with text.
     * By default, this literally just sends the message in chat.
     * Change {@link Client.replyFormatter} for a different result.
     * @param text
     */
    reply(text) {
        if (!this.replyFormatter) {
            this.replyFormatter = MinecraftMessage.defaultReplyFormatter;
        }

        this.client.send(this.replyFormatter(text, this.sender));
    }

    /**
     * Add data to this MinecraftMessage.
     * @param data
     */
    setup(data) {
        /**
         * @namespace
         * @property {string} MinecraftMessage.type - The type of message.
         * @property {string} [MinecraftMessage.sender] - The sender of the message. Null if it's the server.
         * @property {number} [MinecraftMessage.level] - The level of the user, if given.
         * @property {string} [MinecraftMessage.rank] - The rank of the user, if given.
         * @property {string} [MinecraftMessage.target] - The target of the message, if given.
         * @property {string} MinecraftMessage.text - The text of the message. This is only what the user sent, not what the server did. Extra info should be removed.
         * @property {string} MinecraftMessage.fullText - The full text of the message. This includes all the extra garbage the server sent in the message.
         */
        Object.assign(this, data);
    }
}

module.exports = MinecraftMessage;