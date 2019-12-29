'use strict';

import {PPU} from './ppu/PPU';
import {CPU6502} from './cpu/CPU6502';

/**
 * Base NES class.
 */
export class NES {
    /**
     * NES constructor.
     */
    constructor() {
        // A count of how many clocks have passed.
        this.systemClockCounter = 0;

        // RAM.
        this.cpuRam = new Uint8Array(2048);

        // CPU.
        this.cpu = new CPU6502();
        this.cpu.read = (addr) => {
            // The cart can block the CPU & PPU.
            let cartRead = this.cartridge.cpuRead(addr);
            if (cartRead) {
                return cartRead;
            }

            if (addr >= 0x0000 && addr <= 0x1fff) {
                return this.cpuRam[addr & 0x07ff];
            } else if (addr >= 0x2000 && addr <= 0x3fff) {
                return this.ppu.cpuRead(addr & 0x0007);
            }

            return 0x00;
        };
        this.cpu.write = (addr, value) => {
            // The cart can block the CPU & PPU.
            let cartWrite = this.cartridge.cpuWrite(addr);
            if (cartWrite) {
                return;
            }

            if (addr >= 0x0000 && addr <= 0x1fff) {
                this.cpuRam[addr & 0x07ff] = value;
            } else if (addr >= 0x2000 && addr <= 0x3fff) {
                this.ppu.cpuWrite(addr & 0x0007, value);
            }
        };

        // PPU.
        this.ppu = new PPU();
    }

    // SYSTEM INTERFACE.

    /**
     * Insert a cartridge into the NES.
     *
     * @param cartridge
     * @param callback When the cartridge has been loaded.
     */
    insertCartridge(cartridge, callback) {
        this.cartridge = cartridge;
        this.cartridge.load(() => {
            this.ppu.insertCartridge(cartridge);

            callback();
        });
    }

    /**
     * Reset the NES.
     */
    reset() {
        this.cpu.reset();
        this.systemClockCounter = 0;
    }

    /**
     * NES step.
     */
    step() {
        this.ppu.step();
        // The PPU is 3x times faster than the CPU.
        if (this.systemClockCounter % 3 === 0) {
            this.cpu.step();
        }

        if (this.ppu.nmi) {
            this.ppu.nmi = false;
            this.cpu.nmi();
        }
        this.systemClockCounter++;
    }
}
