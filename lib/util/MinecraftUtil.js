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

    static _applyColor(str, code) {
        return (ConsoleColor.Chat.get(code))(str);
    }

    static textToChalk(text) {
        text = text.trim();
        let chalkMessage = '';

        const bits = text.split('§');

        let bit;
        for (let i = 0; i < bits.length; i++) {
            bit = bits[i];

            if (bit.length === 0) {
                continue;
            }

            if (bit.length === 1) {
                const relatedBits = [bit];

                for (++i; i < bits.length; i++) {
                    bit = bits[i];

                    relatedBits.push(bit[0]);

                    if (bit.length !== 1) {
                        bit = relatedBits.reduce(MinecraftUtil._applyColor, bit.slice(1));
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

    static packetToChalk(packet) {
        const text = MinecraftUtil.packetToText(packet);

        let chalkMessage = '';

        // Assume the whole message is colored only with section signs
        // If this is an issue in the future, I'll fix it
        if (text.includes('§')) {
            chalkMessage = MinecraftUtil.textToChalk(text);
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