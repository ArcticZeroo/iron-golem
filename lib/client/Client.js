const EventEmitter = require('events');
const mineflayer = require('mineflayer');

const config = require('../../config');
const MinecraftUtil = require('../util/MinecraftUtil');
const MinecraftMessage = require('../structures/MinecraftMessage');
const ConnectionStatus = require('../enum/ConnectionStatus');

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
     * @param {number} [options.chatDelay=0] - Delay between chat messages. If a message is sent too early, it'll be queued up.
     */
    constructor(options = {}) {
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
            serverConfigs: [],
            chatDelay: 0
        }, options);

        if (this.options.useServerConfigs) {
            this.options.serverConfigs = this.options.serverConfigs.concat(config.servers);

            for (const config of this.options.serverConfigs) {
                // If server regex matches ours
                // i.e. if the bot is on a known server
                if (config.server && config.server.test(this.options.server)) {
                    this.config = config;

                    // If the config has a specified chatDelay,
                    // and the user has not manually added one,
                    // set the chatDelay to the config's.
                    if (this.config.chatDelay && !this.options.chatDelay) {
                        this.options.chatDelay = this.config.chatDelay;
                    }
                    break;
                }
            }
        }

        if (this.options.chatDelay > 0) {
            this._messageQueue = [];
            this._messageLastSentTime = 0;
        }

        /**
         * A mineflayer client instance.
         * Null until {@link Client#init} is called.
         * @type {object}
         */
        this.bot = null;

        this._connectionStatus = ConnectionStatus.NOT_STARTED;
    }

    /**
     * The current connection status of the bot.
     * @return {string}
     * @readonly
     */
    get status() {
        return this._connectionStatus;
    }

    /**
     * Whether the bot is currently online.
     * @return {boolean}
     * @readonly
     */
    get isOnline() {
        return this.bot && this.status === ConnectionStatus.LOGGED_IN;
    }

    /**
     * Handle a message received by the client.
     * <p>
     * This will emit text as a color-less string,
     * and also emit a colored string if Client.options.consoleColorChat is true.
     * <p>
     * If a config is set and options.parseChat is true,
     * the client will attempt to match a specific chat type.
     * If it can match, the client converts it to a
     * {@link MinecraftMessage} and emits it based on the .name
     * property.
     *
     * @param packet
     * @private
     */
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
         * @param {string} [consoleText] - Console-colored text, if options.consoleColorChat is true.
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

                    /**
                     * Emitted when a custom chat type is matched.
                     * <p>
                     * This will also emit events whose names are equal
                     * to the name of the custom chat type.
                     * @event Client#custom-chat
                     * @param {string} name - Chat type name. This param does not exist for the specific event.
                     * @param {MinecraftMessage} message - The message sent, in MinecraftMessage form.
                     * @param {string} text - The message text
                     * @param {string} consoleText - The message's console-colored text.
                     */
                    this.emit('custom-chat', chatType.name, minecraftMessage, text, consoleText);
                    this.emit(chatType.name, minecraftMessage, text, consoleText);
                    break;
                }
            }
        }
    }

    /**
     * Register events for {@link Client.bot}
     * This does not clear old events, so don't call this too much.
     * @private
     */
    _registerEvents() {
        const forward = (e)=> {
            this.bot.on(e, (...d)=> {
                this.emit(e, ...d);
            });
        };

        /**
         * Emitted when the client respawns, or changes dimension.
         * <p>
         * If you're detecting dimension transfers (for instance,
         * servers that transfer between worlds like Mineplex use
         * respawn packets to transfer players), this is the place
         * to call your code.
         * @event Client#respawn
         * @event Client#dimensionChange
         * @param {string] dimension - The dimension the client is now in.
         */
        this.bot.on('respawn', ()=>{
            this.emit('dimensionChange', this.bot.game.dimension);
            this.emit('respawn', this.bot.game.dimension);
        });

        this.bot.on('login', ()=>{
            this._connectionStatus = ConnectionStatus.LOGGED_IN;
        });

        this.bot.once('end', ()=>{
            this._connectionStatus = ConnectionStatus.DISCONNECTED;
        });

        /**
         * Emitted when the client logs into the server.
         * <p>
         * You probably want to handle most of your logic
         * inside {@link Client#spawn}, since the client has not
         * actually entered the world when login is called.
         * @event Client#login
         */
        forward('login');

        /**
         * Emitted when the client spawns.
         * Don't forget .once if you only want it to fire on first join!
         * @event Client#spawn
         */
        forward('spawn');

        /**
         * Emitted when the client is kicked.
         * @event Client#kicked
         * @param {string} text - The uncolored, stringified reason.
         * @param {boolean} loggedIn - Whether the client was logged in before it was kicked.
         * @param {string} [consoleText] - Console-colored text, if options.consoleColorChat is true.
         */
        this.bot.on('kicked', (reason, loggedIn)=>{
            this._connectionStatus = ConnectionStatus.DISCONNECTED;

            let text, consoleText;

            try {
                reason = JSON.parse(reason);

                text = MinecraftUtil.stripColor(reason.toString());
            } catch (e) {
                text = MinecraftUtil.stripColor(reason);
            }

            if (this.options.consoleColorChat) {
                consoleText = MinecraftUtil.jsonToChalk(reason);
            }

            this.emit('kicked', text, loggedIn, consoleText);
        });

        this.bot.on('message', this._handleMinecraftMessage.bind(this));

        /**
         * Emitted when the server sends an actionBar event
         * @event Client#actionBar
         * @param {string} text - Text sent by the server.
         * @param {string} [consoleText] - Console-colored text, if options.consoleColorChat is true.
         */
        this.bot.on('actionBar', (packet)=>{
            const text = MinecraftUtil.stripColor(MinecraftUtil.packetToText(packet, this.options.chatStripExtraSpaces));

            let consoleText;

            if (this.options.consoleColorChat) {
                consoleText = MinecraftUtil.packetToChalk(packet);
            }

            this.emit('actionBar', text, consoleText);
        });

        this.bot.on('error', (e)=>{
            const errorText = e.message || e || '';

            // Yep, absorb deserialization errors.
            if (errorText.toLowerCase().includes('deserialization')) {
                return;
            }

            // Mojang returns a stupidly useless error whenever
            // username/pass are wrong, which would be fine if
            // it only returned in that case, but it also returns
            // when you've been rate-limited. If the client is
            // started too often (I've found 3+ times in 60 seconds
            // tends to do it), you're rate limited for at least 30
            // seconds to a minute, if not longer. And all you get is
            // this stupid error.
            if (errorText.toLowerCase().includes('invalid username or password')) {
                this.emit('error', new Error('FATAL: Unable to authenticate with Mojang. Your information may be incorrect, or you were rate-limited.'));
                return;
            }

            // Just in case, since it could be a string.
            // You never know with a 3rd-party lib.
            if (e instanceof Error) {
                let message;

                switch (e.code) {
                    case 'ECONNRESET':
                        // Connection was reset, so the host must have closed it.
                        message = 'Connection forcibly closed by remote host.';
                        break;
                    case 'ECONNREFUSED':
                        // Connection was refused, the server is probably down.
                        message = 'Unable to connect to remote host: Connection refused. Is the server up?';
                        break;
                    case 'ENOENT':
                        // If it's not getaddrinfo I don't know what it is. Just let it pass.
                        if (e.syscall !== 'getaddrinfo') {
                            break;
                        }

                        const attempt = e.host + (e.port) ? `:${e.port}` : '';

                        // The client's machine couldn't resolve an IP
                        message = `Unable to resolve ${attempt}. It may not exist, or internet connectivity may not be working.`;
                        break;
                }

                if (message) {
                    // If message is defined, the bot hit a fatal error.
                    // Tt's not connected anymore.
                    this._connectionStatus = ConnectionStatus.DISCONNECTED;

                    // Emit the error.
                    this.emit('error', new Error('FATAL: ' + message));

                    return;
                }
            }

            // If nothing has returned by now, just pass along the error.
            this.emit('error', e);
        });
    }

    /**
     * Call this method to start the bot.
     * It will also kill an existing bot if applicable.
     * @param {string} [reason] - Optional reason for quitting in an existing bot
     */
    init(reason) {
        this._connectionStatus = ConnectionStatus.LOGGING_IN;

        if (this.bot) {
            this.bot.quit(reason);
            this.bot.removeAllListeners();
            this.bot = null;
        }

        const botOptions = {
            username: this.options.username,
            password: this.options.password,
            port: this.options.port,
            host: this.options.server
        };

        if (this.config && this.config.version) {
            botOptions.version = this.config.version;
        }

        this.bot = mineflayer.createBot(botOptions);

        this._registerEvents();
    }

    /**
     * Get the amount of time that has passed
     * since the last message was sent in chat.
     *
     * If no messages have been sent since the
     * initialization of this client,
     * @return {number}
     * @private
     */
    _getTimeSinceLastMessage() {
        return Date.now() - this._messageLastSentTime;
    }

    /**
     * Add a message to the queue.
     * <p>
     * This returns a promise so it can be
     * resolved when the message is actually
     * sent.
     * @param {string} text - Text to send.
     * @return {Promise}
     * @private
     */
    _addToQueue(text) {
        return new Promise((resolve) => {
            this._messageQueue.push([text, resolve]);
        });
    }

    /**
     * Process the next item in the queue.
     * <p>
     * If the queue is empty, nothing happens.
     * Otherwise, the next item is sent and its
     * promise is resolved.
     * <p>
     * If the queue is still not empty, a timeout
     * will be set equal to the chat delay which
     * will call this method again.
     * @private
     */
    _processQueue() {
        if (this._messageQueue.length === 0) {
            return;
        }

        const [text, resolve] = this._messageQueue.shift();

        this.bot.chat(text);
        resolve();

        if (this._messageQueue.length > 0) {
            setTimeout(()=>{
                this._processQueue();
            }, this.options.chatDelay);
        }
    }

    /**
     * Send a message in chat, if the bot is on.
     * @param {string} text - Text to send.
     * @param {boolean} [ignoreDelay=false] - Whether or not to ignore chat delay.
     * @return {Promise}
     */
    async send(text, ignoreDelay) {
        // isOnline checks to make sure the bot
        // is truthy, and that its connectionStatus
        // is logged in.
        if (!this.isOnline) {
            throw new Error('Bot is not currently online.');
        }

        // If delay is supposed to be ignored, or if there
        // is no chat delay, just send it.
        if (ignoreDelay || !this.options.chatDelay) {
            return this.bot.chat(text);
        }

        // If there's any messages in there already, just
        // add it to the end of the queue and return the
        // promise.
        if (this._messageQueue.length > 0) {
            return this._addToQueue(text);
        }

        const sinceLast = this._getTimeSinceLastMessage();

        // If this is true, the message can be sent safely.
        if (sinceLast >= this.options.chatDelay) {
            return this.bot.chat(text);
        }

        // If it wasn't true, find out how long before another
        // can be safely sent.
        const untilNext = this.options.chatDelay - sinceLast;

        // Process the queue after that amount of time has passed.
        setTimeout(()=>{
            this._processQueue();
        }, untilNext);

        // Finally, return the promise for adding it to the queue.
        return this._addToQueue(text);
    }

    /**
     * @alias Client#send
     */
    chat(text, ignoreDelay) {
        return this.send(text, ignoreDelay);
    }

    /**
     * Send a message right now, ignoring chat delay.
     * @param {string} text - Message to send.
     * @return {Promise}
     */
    sendNow(text) {
        return this.send(text, true);
    }

    /**
     * Send a message next, before any others.
     * <p>
     * This is much safer than {@link Client#sendNow}
     * because it does not ignore chat delay. Rather,
     * it simply adds itself to the front of the queue
     * to be sent next.
     * <p>
     * If there's ever an issue with messages here not
     * being sent "next", sendNext is probably being
     * called in a few places.
     * @param text
     * @return {Promise}
     */
    sendNext(text) {
        return new Promise((resolve) => {
            // add this to the start of the queue
            this._messageQueue = [[text, resolve], ...this._messageQueue];
        });
    }

    get username() {
        if (!this.isOnline) {
            return null;
        }

        return this.bot.username;
    }
}

module.exports = Client;