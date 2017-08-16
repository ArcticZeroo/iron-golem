const MINECRAFT_NAME_REGEX =  /^([A-Za-z0-9_]{1,16}|\$)$/;

class StringUtil {
    /**
     * Check whether a given string is a valid Minecraft name.
     * This does not check whether the name actually exists,
     * just whether or not it could exist.
     * @param {string} str - The string to check
     * @return {boolean}
     */
    static isValidMinecraftName(str) {
        return MINECRAFT_NAME_REGEX.test(str);
    }
}

module.exports = StringUtil;