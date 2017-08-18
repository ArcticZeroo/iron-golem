const stripAnsi = require('strip-ansi');

const ConsoleColor = require('../enum/ConsoleColor');

class MinecraftUtil {
    /**
     * Turn a packet (JSON message) into text.
     * @param {object} packet - The packet to turn into text.
     * @param {boolean} [stripSpaces = true] - Whether 2+ spaces should be turned into 1
     * @return {string}
     */
    static packetToText(packet, stripSpaces = true) {
        const packetText = packet.toString();

        return (stripSpaces) ? packetText.replace(/\s+/, ' ') : packetText;
    }

    /**
     * Strip the text of all minecraft color codes and chalk (ANSI) colors.
     * @param text
     * @return {string}
     */
    static stripColor(text) {
        return stripAnsi(text.replace(/\u00A7[0-9A-FK-OR]/ig, ''));
    }

    static _applyColor(str, code) {
        return (ConsoleColor.Chat.get(code))(str);
    }

    /**
     * Turn a minecraft color code string into console-colored text.
     * @param {string} text - The text to console-ify
     * @return {string}
     */
    static textToChalk(text) {
        let chalkMessage = '';

        const bits = text.split('§');

        if (bits.length === 1) {
            return text;
        }

        let bit;
        for (let i = 0; i < bits.length; i++) {
            bit = bits[i];

            if (bit.length === 0) {
                continue;
            }

            if (bit.length === 1) {
                // We don't care about single resets since something else is related to it
                if (bit === 'r') {
                    continue;
                }

                const relatedBits = [bit];

                for (++i; i < bits.length; i++) {
                    bit = bits[i];

                    relatedBits.push(bit[0]);

                    if (bit.length !== 1) {
                        bit = relatedBits.reduce(MinecraftUtil._applyColor, bit.slice(1));
                        break;
                    }
                }

                if (bit.length === 1) {
                    continue;
                }
            } else {
                const colorCode = bit[0];

                bit = MinecraftUtil._applyColor(bit.slice(1), colorCode);
            }

            chalkMessage += bit;
        }

        return chalkMessage;
    }

    /**
     * Turn a minecraft JSON packet into console-colored text.
     * @param {string|object|Array} item - An item to convert. This mainly is multi-type for recursion.
     * @return {string}
     */
    static jsonToChalk(item) {
        let chalkMessage = '';

        if (typeof item === 'string') {
            return item;
        } else if (typeof item === 'object') {
            if (Array.isArray(item)) {
                // We're looking at an array of 'extra' items.
                for (const element of item) {
                    chalkMessage += MinecraftUtil.jsonToChalk(element);
                }
            } else {
                // We're looking at a specific extra item.
                const { color, text, extra } = item;

                if (color) {
                    chalkMessage += (ConsoleColor.Minecraft.get(color.toUpperCase()))(text);
                } else {
                    chalkMessage += text;
                }

                if (extra) {
                    chalkMessage += MinecraftUtil.jsonToChalk(extra);
                }
            }
        }

        return MinecraftUtil.textToChalk(chalkMessage);
    }

    /**
     * Turn a Minecraft packet into console-colored text.
     * @param {object} packet - The packet (JSON message) to convert.
     * @return {string}
     */
    static packetToChalk(packet) {
        const text = MinecraftUtil.packetToText(packet);

        // Assume the whole message is colored only with section signs
        // If this is an issue in the future, I'll fix it
        if (text.includes('§')) {
            return MinecraftUtil.textToChalk(text);
        } else {
            // Yay, it's a JSON message... Just what I wanted.
            // This completely ignores most vanilla server messages,
            // most prominently achievements.
            return MinecraftUtil.jsonToChalk(packet);
        }
    }
}

module.exports = MinecraftUtil;