'use strict';

/**
 * Mapper class.
 * https://wiki.nesdev.com/w/index.php/Mapper
 */
export class Mapper {
    /**
     * Mapper constructor.
     *
     * @param prgBanks
     * @param chrBanks
     */
    constructor(prgBanks, chrBanks) {
        this.prgBanks = prgBanks;
        this.chrBanks = chrBanks;
    }

    /**
     * Map CPU read address.
     *
     * @param {number} addr - The read address.
     */
    mapCpuRead(addr) {
        throw new Error('This method must be overridden');
    }

    /**
     * Map CPU write address.
     *
     * @param {number} addr - The write address.
     */
    mapCpuWrite(addr) {
        throw new Error('This method must be overridden');
    }

    /**
     * Map PPU read address.
     *
     * @param {number} addr - The read address.
     */
    mapPpuRead(addr) {
        throw new Error('This method must be overridden');
    }

    /**
     * Map PPU write address.
     *
     * @param {number} addr - The read address.
     */
    mapPpuWrite(addr) {
        throw new Error('This method must be overridden');
    }
}