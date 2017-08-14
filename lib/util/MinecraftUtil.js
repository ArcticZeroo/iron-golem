const stripAnsi = require('strip-ansi');

const ConsoleColor = require('../enum/ConsoleColor');

class MinecraftUtil {
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

    /**
     * Color a bit.
     * This will recurse to allow for nested styles, e.g. &3&lcat should be bold and colored.
     * @param {Array} bits - All bits
     * @param {number} i - Current index.
     * @return {object}
     * @private
     */
    static _colorBit(bits, i) {
        const bit = bits[i];

        // Empty strings are also falsy
        if (!bit) return bit;

        const colorCode = bit[0];

        // ConsoleColor.Chat maps codes to chalk colors.
        // Get the chalk color for this code.
        const chalkColor = ConsoleColor.Chat.get(colorCode);

        if (bit.length === 1 && i < bits.length) {
            return {bit: chalkColor(MinecraftUtil._colorBit(bits, ++i)), i};
        }

        return {bit: chalkColor(bit.slice(1)) , i};
    }


    static packetToChalk(packet) {
        const text = MinecraftUtil.packetToText(packet);

        let chalkMessage = '';

        // Assume the whole message is colored only with section signs
        // If this is an issue in the future, I'll fix it
        if (text.includes('\u00A7')) {
            const bits = text.split('\u00A7');

            let bit;
            for (let i = 0; i < bits.length; i++) {

                ({ bit, i } = MinecraftUtil._colorBit(bits, i));

                chalkMessage += bit;
            }
        } else {
            // Yay, it's a JSON message... Just what I wanted.
            // This completely ignores most vanilla server messages,
            // most prominently achievements.
            const extra = packet.json.extra;

            if (!extra) {
                // Nothing we can do here, it's not a JSON message.
                return text;
            }

            for (const item of extra) {
                if (typeof item === 'string') {
                    chalkMessage += ConsoleColor.Minecraft.WHITE(item);
                    continue;
                }

                chalkMessage += (ConsoleColor.Minecraft.get(item.color))(item.text);
            }
        }

        return chalkMessage;
    }
}

module.exports = MinecraftUtil;