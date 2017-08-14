class MinecraftMessage {
    constructor(client, data) {
        this.client = client;
    }

    setup(data) {
        Object.assign(this, data);
    }
}

module.exports = MinecraftMessage;