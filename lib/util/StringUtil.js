const MINECRAFT_NAME_REGEX =  /^([A-Za-z0-9_]{1,16}|\$)$/;

class StringUtil {
    static isValidMinecraftName(str) {
        return MINECRAFT_NAME_REGEX.test(str);
    }
}

module.exports = StringUtil;