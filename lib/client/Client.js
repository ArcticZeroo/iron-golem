const EventEmitter = require('events');
const mineflayer = require('mineflayer');

const config = require('../../config');
const MinecraftUtil = require('../util/MinecraftUtil');
const MinecraftMessage = require('../structures/MinecraftMessage');

class Client extends EventEmitter {
    /**
     * Create a single-server Minecraft client.
     * @param {object} [options={}]
     * @param {string} options.username - The username to use.
     * @param {string} options.password - The password to use.
     * @param {string} options.server - The server to connect to.
     * @param {number} [options.port=25565] - The port to connect to.
     * @param {boolean} [options.chatStripExtraSpaces=true] - Whether to strip extra spaces from chat.
     * @param {boolean} [options.consoleColorChat=true] - Whether to emit a console colored chat in addition to the textual chat.
     * @param {boolean} [options.useServerConfigs=true] - Whether server configs should be used for port, readable name, etc.
     * @param {boolean} [options.parseChat=true] - Whether this client should parse chat.
     * @param {Array} [options.serverConfigs=[]] - An array of server configs, if applicable.
     */
    constructor(options={}) {
        super();

        /**
         * The client's options.
         * Values are documented in the constructor.
         * @type {object}
         */
        this.options = Object.assign({
            port: 25565,
            chatStripExtraSpaces: true,
            consoleColorChat: true,
            useServerConfigs: true,
            parseChat: true,
            serverConfigs: []
        }, options);

        if (this.options.useServerConfigs) {
            this.options.serverConfigs = this.options.serverConfigs.concat(config.servers);

            for (const config of this.options.serverConfigs) {
                // If server regex matches ours
                // i.e. if the bot is on a known server
                if (config.server && config.server.test(this.options.server)) {
                    this.config = config;
                    break;
                }
            }
        }

        /**
         * A mineflayer client instance.
         * Null until {@link Client#init} is called.
         * @type {object}
         */
        this.bot = null;
    }

    _handleMinecraftMessage(packet) {
        // Remove extra spaces because they break things.
        const text = MinecraftUtil.stripColor(MinecraftUtil.packetToText(packet, this.options.chatStripExtraSpaces));

        const consoleText = (this.options.consoleColorChat)
            ? MinecraftUtil.packetToChalk(packet)
            : null;

        /**
         * Emitted when the client receives a message.
         * @event Client#message
         * @param {string} text - Text sent by the sender.
         */
        this.emit('message', text, consoleText);

        if (this.config && this.options.parseChat) {
            for (const chatType of this.config.chat) {
                const chatMatch = chatType.regex.exec(text);
                if (chatMatch) {
                    const parts = {};

                    // Get the name of the match in each index,
                    // and set the part's property to the value
                    for (let i = 0; i < chatMatch.length; i++) {
                        parts[chatType.matches[i]] = chatMatch[i];
                    }

                    const minecraftMessage = new MinecraftMessage(this, parts);

                    minecraftMessage.type = chatType.name;

                    if (chatType.replyFormatter) {
                        minecraftMessage.replyFormatter = chatType.replyFormatter;
                    }

                    this.emit(chatType.name, minecraftMessage, parts);
                }
            }
        }
    }

    _registerEvents() {
        const forward = (e)=> {
            this.bot.on(e, (...d)=> {
                this.emit(e, ...d);
            });
        };

        forward('login');
        forward('spawn');
        forward('respawn');

        this.bot.on('message', this._handleMinecraftMessage);
    }

    init() {
        if (this.bot) {
            this.bot.quit(reason);
            this.bot.removeAllListeners();
            this.bot = null;
        }

        this.bot = mineflayer.createBot({
            username: this.options.username,
            password: this.options.password,
            port: this.options.port,
            host: this.options.server
        });

        this._registerEvents();
    }

    send(text) {
        if (!this.bot) return;

        this.bot.chat(text);
    }

    chat(text) {
        return this.send(text);
    }
}