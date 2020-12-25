const assert = require('assert');

const ConsoleColor = require('../src/lib/enum/console-color');
const MinecraftUtil = require('../src/lib/util/minecraft');

describe('MinecraftUtil', function () {
    // 2D means §4test instead of §4§ltest, which is 3D
    it('should be able to convert multi-color 2D section sign messages', function () {
        const baseMC = '§bHello §cWorld!';
        const baseChalk = ConsoleColor.Minecraft.AQUA('Hello ') + ConsoleColor.Minecraft.RED('World!');

        assert.equal(MinecraftUtil.textToChalk(baseMC), baseChalk);
    });

    it('should be able to convert multi-color 3D section sign messages', function () {
        const baseMC = '§b§lHello World!';
        const baseChalk = ConsoleColor.Minecraft.BOLD(ConsoleColor.Minecraft.AQUA('Hello World!'));

        assert.equal(MinecraftUtil.textToChalk(baseMC), baseChalk);
    });
});