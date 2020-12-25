import chalk from 'chalk';
import { ObjectUtil } from '../util/object';

export const Minecraft = {
    BLACK:        chalk.hex('#212121'),
    DARK_BLUE:    chalk.hex('#0D47A1'),
    DARK_GREEN:   chalk.hex('#2E7D32'),
    DARK_AQUA:    chalk.hex('#00B8D4'),
    DARK_RED:     chalk.hex('#D50000'),
    DARK_PURPLE:  chalk.hex('#651FFF'),
    GOLD:         chalk.hex('#FFA000'),
    GRAY:         chalk.hex('#9E9E9E'),
    DARK_GRAY:    chalk.hex('#424242'),
    BLUE:         chalk.hex('#304FFE'),
    GREEN:        chalk.hex('#76FF03'),
    AQUA:         chalk.hex('#18FFFF'),
    RED:          chalk.hex('#FF5252'),
    LIGHT_PURPLE: chalk.hex('#D500F9'),
    YELLOW:       chalk.hex('#FFEB3B'),
    WHITE:        chalk.hex('#F5F5F5'),

    BOLD:          chalk.bold,
    UNDERLINE:     chalk.underline,
    ITALICS:       chalk.italic,
    STRIKETHROUGH: chalk.strikethrough,
    RESET:         chalk.reset,
} as const;

export const Chat = {
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
} as const;

export const getMinecraftColor = (color: string) => {
    color = color.toUpperCase();
    if (ObjectUtil.isKeyOf(Minecraft, color)) {
        return Minecraft[color];
    }
    return Minecraft.WHITE;
}

export const getChatColor = (colorChar: string) => {
    colorChar = colorChar.toLowerCase();
    if (ObjectUtil.isKeyOf(Chat, colorChar)) {
        return Chat[colorChar];
    }
    return Minecraft.WHITE;
}