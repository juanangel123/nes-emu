'use strict';

import {Mapper} from '../ Mapper';

/**
 * Mapper class.
 */
export class Mapper000 extends Mapper {
    mapCpuRead(addr) {
        if (addr >= 0x8000 && addr <= 0xffff) {
            return addr & (this.prgBanks > 1 ? 0x7fff : 0x3fff);
        }

        return 0x00;
    }

    mapCpuWrite(addr) {
        if (addr >= 0x8000 && addr <= 0xffff) {
            return addr & (this.prgBanks > 1 ? 0x7fff : 0x3fff);
        }

        return 0x00;
    }

    mapPpuRead(addr) {
        if (addr >= 0x0000 && addr <= 0x1fff) {
            return addr;
        }

        return 0x00;
    }

    mapPpuWrite(addr) {
        if (addr >= 0x0000 && addr <= 0x1fff && this.chrBanks === 0) {
            // Treat as RAM.
            return addr;
        }

        return 0x00;
    }
}