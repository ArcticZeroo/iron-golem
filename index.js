const ConsoleColor = require('./lib/enum/ConsoleColor');
const MinecraftUtil = require('./lib/util/MinecraftUtil');
const StringUtil = require('./lib/util/StringUtil');
const MinecraftMessage = require('./lib/structures/MinecraftMessage');
const Client = require('./lib/client/Client');

module.exports = {
    Client,
    MinecraftUtil, StringUtil,
    MinecraftMessage,
    ConsoleColor
};