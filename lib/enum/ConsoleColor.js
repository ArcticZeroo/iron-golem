const chalk = require('chalk');

const Minecraft = {
    BLACK:         chalk.black.bold,
    DARK_BLUE:     chalk.blue,
    DARK_GREEN:    chalk.green,
    DARK_AQUA:     chalk.cyan,
    DARK_RED:      chalk.red,
    DARK_PURPLE:   chalk.magenta,
    GOLD:          chalk.yellow,
    GRAY:          chalk.white,
    DARK_GRAY:     chalk.gray,
    BLUE:          chalk.blue,
    GREEN:         chalk.green,
    AQUA:          chalk.cyan.bold,
    RED:           chalk.red.bold,
    LIGHT_PURPLE:  chalk.magenta.bold,
    YELLOW:        chalk.yellow,
    WHITE:         chalk.white.bold,

    BOLD:          chalk.bold,
    UNDERLINE:     chalk.underline,
    ITALICS:       chalk.italics,
    STRIKETHROUGH: chalk.strikethrough,
    RESET:         chalk.white,

    get:          c => Minecraft[c] || Minecraft.WHITE
};

const Chat = {
    4: Minecraft.DARK_RED,
    c: Minecraft.RED,
    6: Minecraft.GOLD,
    e: Minecraft.YELLOW,
    2: Minecraft.DARK_GREEN,
    a: Minecraft.GREEN,
    b: Minecraft.AQUA,
    3: Minecraft.DARK_AQUA,
    1: Minecraft.DARK_BLUE,
    9: Minecraft.BLUE,
    d: Minecraft.LIGHT_PURPLE,
    5: Minecraft.DARK_PURPLE,
    f: Minecraft.WHITE,
    7: Minecraft.GRAY,
    l: Minecraft.BOLD,
    n: Minecraft.UNDERLINE,
    o: Minecraft.ITALICS,
    m: Minecraft.STRIKETHROUGH,
    r: Minecraft.RESET,

    // Not possible to represent magic in console without constantly updating it.
    k: Minecraft.RESET,

    get: c => Chat[c] || Minecraft.WHITE
};

module.exports = { Chat, Minecraft };