'use strict';

import {Pixel} from '../util/Pixel';
import {Cartridge} from '../Cartridge';
import {Helper} from "../util/Helper";

/**
 * NES 2C02 Picture Processing Unit.
 */
export class PPU {
    /**
     * PPU constructor.
     */
    constructor() {
        // 0x40
        // Pixels.
        this.palette = [
            new Pixel(84, 84, 84),
            new Pixel(0, 30, 116),
            new Pixel(8, 16, 144),
            new Pixel(48, 0, 136),
            new Pixel(68, 0, 100),
            new Pixel(92, 0, 48),
            new Pixel(84, 4, 0),
            new Pixel(60, 24, 0),
            new Pixel(32, 42, 0),
            new Pixel(8, 58, 0),
            new Pixel(0, 64, 0),
            new Pixel(0, 60, 0),
            new Pixel(0, 50, 60),
            new Pixel(0, 0, 0),
            new Pixel(0, 0, 0),
            new Pixel(0, 0, 0),

            new Pixel(152, 150, 152),
            new Pixel(8, 76, 196),
            new Pixel(48, 50, 236),
            new Pixel(92, 30, 228),
            new Pixel(136, 20, 176),
            new Pixel(160, 20, 100),
            new Pixel(152, 34, 32),
            new Pixel(120, 60, 0),
            new Pixel(84, 90, 0),
            new Pixel(40, 114, 0),
            new Pixel(8, 124, 0),
            new Pixel(0, 118, 40),
            new Pixel(0, 102, 120),
            new Pixel(0, 0, 0),
            new Pixel(0, 0, 0),
            new Pixel(0, 0, 0),

            new Pixel(236, 238, 236),
            new Pixel(76, 154, 236),
            new Pixel(120, 124, 236),
            new Pixel(176, 98, 236),
            new Pixel(228, 84, 236),
            new Pixel(236, 88, 180),
            new Pixel(236, 106, 100),
            new Pixel(212, 136, 32),
            new Pixel(160, 170, 0),
            new Pixel(116, 196, 0),
            new Pixel(76, 208, 32),
            new Pixel(56, 204, 108),
            new Pixel(56, 180, 204),
            new Pixel(60, 60, 60),
            new Pixel(0, 0, 0),
            new Pixel(0, 0, 0),

            new Pixel(236, 238, 236),
            new Pixel(168, 204, 236),
            new Pixel(188, 188, 236),
            new Pixel(212, 178, 236),
            new Pixel(236, 174, 236),
            new Pixel(236, 174, 212),
            new Pixel(236, 180, 176),
            new Pixel(228, 196, 144),
            new Pixel(204, 210, 120),
            new Pixel(180, 222, 120),
            new Pixel(168, 226, 144),
            new Pixel(152, 226, 180),
            new Pixel(160, 214, 228),
            new Pixel(160, 162, 160),
            new Pixel(0, 0, 0),
            new Pixel(0, 0, 0),
        ];

        this.nameTable = [[], []];
        for (let i = 0; i < 0x400; i++) {
            this.nameTable[0][i] = 0x00;
            this.nameTable[1][i] = 0x00;
        }
        this.patternTable = [[], []];
        for (let i = 0; i < 0x1000; i++) {
            this.patternTable[0][i] = 0x00;
            this.patternTable[1][i] = 0x00;
        }
        // 32.
        this.paletteTable = [];
        for (let i = 0; i < 0x20; i++) {
            this.paletteTable[i] = 0x00;
        }

        // ---

        // 256x240 of pixels.
        this.sprScreen = [];
        // In reality, this is from -1 to 261?
        // TEST
        for (let i = -1; i < 400; i++) {
            this.sprScreen[i] = [];
        }
        // 256x240, 256x240 of pixels.
        this.sprNameTable = [[], []];
        for (let i = 0; i < 0x100; i++) {
            this.sprNameTable[0][i] = [];
            this.sprNameTable[1][i] = [];
        }

        // 128x128, 128x128 of pixels.
        this.sprPatternTable = [[], []];
        for (let i = 0; i < 0x80; i++) {
            this.sprPatternTable[0][i] = [];
            this.sprPatternTable[1][i] = [];
        }

        this.scanLine = 0;
        this.cycle = 0;
        this.frameComplete = false;

        // Status register.
        // this.status = {
        //     unused: 5
        //     spriteOverflow: false,
        //     spriteZeroHit: false,
        //     verticalBlank: false
        // };
        this.status = 0x00;

        // Mask register.
        // this.mask = {
        //     grayscale: false,
        //     renderBackgroundLeft: false,
        //     renderSpritesLeft: false,
        //     renderBackground: false,
        //     renderSprites: false,
        //     enhanceRed: false,
        //     enhanceGreen: false,
        //     enhanceBlue: false
        // };
        this.mask = 0x00;

        // Control register.
        // this.control = {
        //     nameTableX: false,
        //     nameTableY: false,
        //     incrementMode: false,
        //     patternSprite: false,
        //     patternBackground: false,
        //     spriteSize: false,
        //     slaveMode: false, // unused
        //     enableNmi: false,
        // };
        this.control = 0x00;

        // Loopy register.
        // this.loopy = {
        //     coarseX: 5,
        //     coarseY: 5,
        //     nameTableX: false,
        //     nameTableY: false,
        //     fineY: 3,
        //     unused: 1,
        // },
        // Active "pointer" address into name table to extract background tile info.
        this.vRamAddress = 0x0000;
        // Temporary store of information to be "transferred" into "pointer" at various times.
        this.tRamAddress = 0x0000;
        // Pixel offset horizontally.
        this.fineX = 0x00;

        // Internal communications.
        this.addressLatch = 0x00;
        this.dataBuffer = 0x00;

        // Background rendering.
        this.bgNextTileId = 0x00;
        this.bgNextTileAttr = 0x00;
        this.bgNextTileLsb = 0x00;
        this.bgNextTileMsb = 0x00;

        this.bgShifterPatternLo = 0x0000;
        this.bgShifterPatternHi = 0x0000;
        this.bgShifterAttribLo = 0x0000;
        this.bgShifterAttribHi = 0x0000;

        // Nmi.
        this.nmi = false;

        this.frameCount = 0;

        this.test = false;
    }

    /**
     * Insert cartridge to the PPU.
     *
     * @param cartridge
     */
    insertCartridge(cartridge) {
        this.cart = cartridge;
    }

    /**
     * Read a memory location.
     *
     * @param {number} addr - The address to read from.
     */
    cpuRead(addr) {
        let data = 0x00;

        switch (addr) {
            // Control.
            case 0x0000:
                break;
            // Mask.
            case 0x0001:
                break;
            // Status.
            case 0x0002:
                data = (this.status & 0xe0) | (this.dataBuffer & 0x1f);
                // Clear the vertical blank.
                this.status &= 0x7f;
                // Set the latch to zero.
                this.addressLatch = 0;
                break;
            // OAM Address.
            case 0x0003:
                break;
            // OAM Data.
            case 0x0004:
                break;
            // Scroll.
            case 0x0005:
                break;
            // PPU Address.
            case 0x0006:
                // Can't read to it.
                break;
            // PPU Data.
            case 0x0007:
                data = this.dataBuffer;
                this.dataBuffer = this.ppuRead(this.vRamAddress);
                // Immediate.
                if (this.vRamAddress > 0x3f00) {
                    data = this.dataBuffer;
                }

                // Increment mode.
                if (this.control & 0x04) {
                    this.vRamAddress += 0x20;
                } else {
                    this.vRamAddress++;
                }
                break;
        }

        // console.log('ppu - cpu read, data:', data);

        return data;
    }

    /**
     * Write a value to a memory location.
     *
     * @param {number} addr - The address to write to.
     * @param {number} value - The value to write.
     */
    cpuWrite(addr, value) {
        switch (addr) {
            // Control.
            case 0x0000:
                this.control = value;
                break;
            // Mask.
            case 0x0001:
                this.mask = value;
                break;
            // Status.
            case 0x0002:
                // Can't write to it.
                break;
            // OAM Address.
            case 0x0003:
                break;
            // OAM Data.
            case 0x0004:
                break;
            // Scroll.
            case 0x0005:
                if (this.addressLatch === 0) {
                    this.fineX = value & 0x07;
                    // Set coarse X.
                    this.vRamAddress &= 0xffe0;
                    this.vRamAddress |= value >> 3;
                    this.addressLatch = 1;
                } else {
                    // Set fine Y.
                    this.vRamAddress &= 0x8fff;
                    this.vRamAddress |= value & 0x07;
                    // Set coarse Y.
                    this.vRamAddress &= 0xfc1f;
                    this.vRamAddress |= value >> 3 << 5;
                    this.addressLatch = 0;
                }
                break;
            // PPU Address.
            case 0x0006:
                if (this.addressLatch === 0) {
                    this.tRamAddress = ((value & 0x3f) << 8) | (this.tRamAddress & 0x00ff);
                    this.addressLatch = 1;
                } else {
                    this.tRamAddress = (this.tRamAddress & 0xff00) | value;
                    this.vRamAddress = this.tRamAddress;
                    this.addressLatch = 0;
                }
                break;
            // PPU Data.
            case 0x0007:
                console.log(this.vRamAddress.toString(16), value);
                if (this.vRamAddress === 0x22df) {
                    console.trace();
                }

                this.ppuWrite(this.vRamAddress, value);

                // Increment mode.
                if (this.control & 0x04) {
                    this.vRamAddress += 0x20;
                } else {
                    this.vRamAddress++;
                }
                break;
        }
    };

    /**
     * Read a memory location.
     *
     * @param {number} addr - The address to read from.
     */
    ppuRead(addr) {
        addr &= 0x3fff;

        // console.log('ppu - read', addr.toString(16));

        let cartRead = this.cart.ppuRead(addr);
        if (cartRead) {
            return cartRead;
        }

        if (addr >= 0x0000 && addr <= 0x1fff) {
            if (this.patternTable[(addr & 0x1000) >> 12]) {
                return this.patternTable[(addr & 0x1000) >> 12][addr & 0x0fff];
            }
        } else if (addr >= 0x2000 && addr <= 0x3eff) {
            addr &= 0x0FFF;

            if (this.cart.mirror === Cartridge.MIRROR_VERTICAL) {
                if (addr >= 0x0000 && addr <= 0x03ff) {
                    return this.nameTable[0][addr & 0x03ff];
                } else if (addr >= 0x0400 && addr <= 0x07ff) {
                    return this.nameTable[1][addr & 0x03ff];
                } else if (addr >= 0x0800 && addr <= 0x0bff) {
                    return this.nameTable[0][addr & 0x03ff];
                } else if (addr >= 0x0c00 && addr <= 0x0fff) {
                    return this.nameTable[0][addr & 0x03ff];
                }
            } else if (this.cart.mirror === Cartridge.MIRROR_HORIZONTAL) {
                if (addr >= 0x0000 && addr <= 0x03ff) {
                    return this.nameTable[0][addr & 0x03ff];
                } else if (addr >= 0x0400 && addr <= 0x07ff) {
                    return this.nameTable[0][addr & 0x03ff];
                } else if (addr >= 0x0800 && addr <= 0x0bff) {
                    return this.nameTable[1][addr & 0x03ff];
                } else if (addr >= 0x0c00 && addr <= 0x0fff) {
                    return this.nameTable[1][addr & 0x03ff];
                }
            }
        } else if (addr >= 0x3f00 && addr <= 0x3fff) {
            addr &= 0x001f;
            // Mirroring.
            if (addr === 0x0010) {
                addr = 0x0000;
            } else if (addr === 0x0014) {
                addr = 0x0004;
            } else if (addr === 0x0018) {
                addr = 0x0008;
            } else if (addr === 0x001c) {
                addr = 0x000c;
            }

            return this.paletteTable[addr];
        }

        return 0x00;
    }

    /**
     * Write a value to a memory location.
     *
     * @param {number} addr - The address to write to.
     * @param {number} value - The value to write.
     */
    ppuWrite(addr, value) {
        addr &= 0x3fff;

        // console.log('ppu - write:', addr.toString(16), value);

        let cartWrite = this.cart.ppuWrite(addr);
        if (cartWrite) {
            return cartWrite;
        }

        if (addr >= 0x0000 && addr <= 0x1fff) {
            this.patternTable[(addr & 0x1000) >> 12][addr & 0x0fff] = value;
        } else if (addr >= 0x2000 && addr <= 0x3eff) {
            addr &= 0x0fff;

            if (this.cart.mirror === Cartridge.MIRROR_VERTICAL) {
                if (addr >= 0x0000 && addr <= 0x03ff) {
                    this.nameTable[0][addr & 0x03ff] = value;
                } else if (addr >= 0x0400 && addr <= 0x07ff) {
                    this.nameTable[1][addr & 0x03ff] = value;
                } else if (addr >= 0x0800 && addr <= 0x0bff) {
                    this.nameTable[0][addr & 0x03ff] = value;
                } else if (addr >= 0x0c00 && addr <= 0x0fff) {
                    this.nameTable[0][addr & 0x03ff] = value;
                }
            } else if (this.cart.mirror === Cartridge.MIRROR_HORIZONTAL) {
                if (addr >= 0x0000 && addr <= 0x03ff) {
                    this.nameTable[0][addr & 0x03ff] = value;
                } else if (addr >= 0x0400 && addr <= 0x07ff) {
                    this.nameTable[0][addr & 0x03ff] = value;
                } else if (addr >= 0x0800 && addr <= 0x0bff) {
                    this.nameTable[1][addr & 0x03ff] = value;
                } else if (addr >= 0x0c00 && addr <= 0x0fff) {
                    this.nameTable[1][addr & 0x03ff] = value;
                }
            }
        } else if (addr >= 0x3f00 && addr <= 0x3fff) {
            addr &= 0x001f;
            // Mirroring.
            if (addr === 0x0010) {
                addr = 0x0000;
            } else if (addr === 0x0014) {
                addr = 0x0004;
            } else if (addr === 0x0018) {
                addr = 0x0008;
            } else if (addr === 0x001c) {
                addr = 0x000c;
            }

            this.paletteTable[addr] = value;
        }
    }

    /**
     * Get pattern table.
     *
     * @param i
     * @param palette
     * @returns {*}
     */
    getPatternTable(i, palette) {
        for (let tileY = 0; tileY < 16; tileY++) {
            for (let tileX = 0; tileX < 16; tileX++) {
                let offset = tileY * 256 + tileX * 16;
                for (let row = 0; row < 8; row++) {
                    let tileLsb = this.ppuRead(i * 0x1000 + offset + row);
                    let tileMsb = this.ppuRead(i * 0x1000 + offset + row + 8);
                    for (let col = 0; col < 8; col++) {
                        let pixel = (tileLsb & 0x01) + (tileMsb & 0x01);
                        tileLsb >>= 1;
                        tileMsb >>= 1;

                        let idx1 = tileX * 8 + (7 - col);
                        let idx2 = tileY * 8 + row;

                        // Set the pattern table sprite data.
                        this.sprPatternTable[i][idx2][idx1] = this.getColorFromPaletteRam(palette, pixel);
                    }
                }
            }
        }

        return this.sprPatternTable[i];
    }

    /**
     * Return the color from palette RAM.
     *
     * @param palette
     * @param pixel
     * @returns {Pixel}
     */
    getColorFromPaletteRam(palette, pixel) {
        let idx = this.ppuRead(0x3f00 + (palette << 2) + pixel);
        let srcPixel = this.palette[idx];
        if (srcPixel) {
            return srcPixel;
        }

        return new Pixel();
    }

    /**
     * Increment scroll X.
     */
    incrementScrollX() {
        let renderBackground = (this.mask & 0x0f) >> 3;
        let renderSprites = (this.mask & 0x10) >> 4;
        if (!renderBackground && !renderSprites) {
            return;
        }

        let coarseX = this.vRamAddress & 0x001f;
        if (coarseX === 0x1f) {
            // Set coarseX to zero.
            this.vRamAddress &= 0xffe0;
            // Flip name table bit.
            Helper.flipBit(this.vRamAddress, 11);
        } else {
            // Staying in current name table, so just increment coarseX.
            this.vRamAddress++;
        }
    }

    /**
     * Increment scroll Y.
     */
    incrementScrollY() {
        let renderBackground = (this.mask & 0x0f) >> 3;
        let renderSprites = (this.mask & 0x10) >> 4;
        if (!renderBackground && !renderSprites) {
            return;
        }

        let fineY = (this.vRamAddress & 0x7000) >> 12;
        if (fineY < 0x07) {
            // Set fine Y.
            this.vRamAddress &= 0x8fff;
            this.vRamAddress |= ++fineY << 12;
        } else {
            // Reset fine Y.
            this.vRamAddress &= 0x8fff;

            // Check if we need to swap vertical name table targets.
            let coarseY = this.vRamAddress & 0x03e0 >> 5;
            if (coarseY === 0x1d) {
                // Reset coarse Y offset.
                this.vRamAddress &= 0xfc1f;
                // Flip name table Y.
                Helper.flipBit(this.vRamAddress, 12);
            } else if (coarseY === 0x1f) {
                // Reset coarse Y.
                this.vRamAddress &= 0xfc1f;
            } else {
                // Staying in current name table, so just increment coarseY.
                // Set coarse Y.
                this.vRamAddress &= 0xfc1f;
                this.vRamAddress |= ++coarseY << 5;
            }
        }
    }

    /**
     * Transfer address X.
     */
    transferAddressX() {
        let renderBackground = (this.mask & 0x0f) >> 3;
        let renderSprites = (this.mask & 0x10) >> 4;
        if (!renderBackground && !renderSprites) {
            return;
        }

        let nameTableX = this.tRamAddress & 0x0400;
        let coarseX = this.tRamAddress & 0x001f;

        // Set name table X.
        this.vRamAddress &= 0xfbff;
        this.vRamAddress |= nameTableX;
        // Set coarse X.
        this.vRamAddress &= 0xffe0;
        this.vRamAddress |= coarseX;
    }

    /**
     * Transfer address Y.
     */
    transferAddressY() {
        let renderBackground = (this.mask & 0x0f) >> 3;
        let renderSprites = (this.mask & 0x10) >> 4;
        if (!renderBackground && !renderSprites) {
            return;
        }

        let fineY = this.tRamAddress & 0x7000;
        let nameTableY = this.tRamAddress & 0x0800;
        let coarseY = this.tRamAddress & 0x03e0;

        // Set fine Y.
        this.vRamAddress &= 0x8fff;
        this.vRamAddress |= fineY;
        // Set name table Y.
        this.vRamAddress &= 0xf7ff;
        this.vRamAddress |= nameTableY;
        // Set coarse Y.
        this.vRamAddress &= 0xfc1f;
        this.vRamAddress |= coarseY;
    }

    /**
     * Load background shifters.
     */
    loadBackgroundShifters() {
        this.bgShifterPatternLo = (this.bgShifterPatternLo & 0xff00) | this.bgNextTileLsb;
        this.bgShifterPatternHi = (this.bgShifterPatternHi & 0xff00) | this.bgNextTileMsb;
        this.bgShifterAttribLo = (this.bgShifterAttribLo & 0xff00) | ((this.bgNextTileAttr & 0x0b01) ? 0xff : 0x00);
        this.bgShifterAttribHi = (this.bgShifterAttribHi & 0xff00) | ((this.bgNextTileAttr & 0x0b10) ? 0xff : 0x00);
    }

    /**
     * Update background shifters.
     */
    updateBackgroundShifters() {
        let renderBackground = (this.mask & 0x0f) >> 3;
        if (!renderBackground) {
            return;
        }

        this.bgShifterPatternLo <<= 1;
        this.bgShifterPatternHi <<= 1;
        this.bgShifterAttribLo <<= 1;
        this.bgShifterPatternHi <<= 1;
    }

    /**
     * PPU step.
     */
    step() {
        let oldRam = this.vRamAddress;

        // First, increment scroll.
        this.incrementScrollX();
        this.incrementScrollY();
        this.transferAddressX();
        this.transferAddressY();


        // For all the visible scan lines.
        if (this.scanLine >= -1 && this.scanLine < 240) {
            if (this.scanLine === -1 && this.cycle === 1) {
                // Clear the vertical blank.
                this.status &= 0x7f;
            }

            if ((this.cycle >= 2 && this.cycle < 258) || (this.cycle >= 321 && this.cycle < 338)) {
                let patternBackground = this.control & 0x0f;
                let fineY = (this.vRamAddress & 0x7000) >> 12;

                switch ((this.cycle - 1) % 8) {
                    case 0:
                        this.loadBackgroundShifters();
                        this.bgNextTileId = this.ppuRead(0x0200 | (this.vRamAddress & 0x0fff));
                        break;
                    case 2:
                        let nameTableY = this.vRamAddress & 0x0800;
                        let nameTableX = this.vRamAddress & 0x0400;
                        let coarseY = (this.vRamAddress & 0x03e0) >> 2;
                        let coarseX = (this.vRamAddress & 0x001f) >> 2;
                        let resultAddr = 0x23c0 | nameTableY | nameTableX | coarseY | coarseX;
                        this.bgNextTileAttr = this.ppuRead(resultAddr);
                        if (coarseY & 0x02) {
                            this.bgNextTileAttr >>= 4;
                        }
                        if (coarseX & 0x02) {
                            this.bgNextTileAttr >>= 2;
                        }
                        this.bgNextTileAttr &= 0x03;
                        break;
                    case 4:
                        this.bgNextTileLsb = this.ppuRead(patternBackground + (this.bgNextTileId << 4) + fineY);
                        break;
                    case 6:
                        this.bgNextTileMsb = this.ppuRead(patternBackground + (this.bgNextTileId << 4) + fineY + 8);
                        break;
                    case 7:
                        this.incrementScrollX();
                        break;
                }
            }

            if (this.cycle === 256) {
                this.incrementScrollY();
            }

            if (this.cycle === 257) {
                this.transferAddressX();
            }

            if (this.scanLine === -1 && this.cycle >= 280 && this.cycle < 305) {
                this.transferAddressY();
            }
        }

        // End of visible scan lines.
        if (this.scanLine >= 241 && this.scanLine < 261) {
            if (this.scanLine === 241 && this.cycle === 1) {
                // Enable vertical blank.
                this.status |= 0x80;
                // Check if nmi is enabled.
                if (this.control >> 7) {
                    this.nmi = true;
                }
            }
        }

        // Render it all.
        let bgPixel = 0x00;
        let bgPalette = 0x00;

        // Render background.
        let renderBackground = (this.mask & 0x0f) >> 3;
        if (renderBackground) {
            let bitMux = 0x8000 >> this.fineX;
            let p0Pixel = (this.bgShifterPatternLo & bitMux) > 0;
            let p1Pixel = (this.bgShifterPatternHi & bitMux) > 0;
            bgPixel = (p1Pixel << 1) | p0Pixel;

            let bgPal0 = (this.bgShifterAttribLo & bitMux) > 0;
            let bgPal1 = (this.bgShifterAttribHi & bitMux) > 0;
            bgPalette = (bgPal1 << 1) | bgPal0;
        }

        this.sprScreen[this.cycle - 1][this.scanLine] = this.getColorFromPaletteRam(bgPalette, bgPixel);

        // Advance renderer - it never stops, it's relentless.
        this.cycle++;
        if (this.cycle >= 341) {
            this.cycle = 0;
            this.scanLine++;
            if (this.scanLine >= 261) {
                this.scanLine = -1;
                this.frameComplete = true;
                console.log('fc, vram:', this.vRamAddress.toString(16));
                this.frameCount++;
            }
        }

        if (this.frameCount > 1 && this.vRamAddress === 0x0000) {
            console.log(oldRam, this.vRamAddress);

        }

        this.test = false;
    }
}