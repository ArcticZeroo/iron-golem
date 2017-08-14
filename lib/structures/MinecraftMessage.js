class MinecraftMessage {
    constructor(client, data) {
        this.client = client;
        // If no replyFormatter is given, just send the text.
        this.replyFormatter = text => text;

        if (data) {
            this.setup(data);
        }
    }

    static get defaultReplyFormatter () {
        return text => text;
    }

    reply(text) {
        if (!this.replyFormatter) {
            this.replyFormatter = MinecraftMessage.defaultReplyFormatter;
        }

        this.client.send(this.replyFormatter(text, this.sender));
    }

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