'use strict';

import parseNES from 'nes-file';
import {Mapper000} from "./mappers/Mapper000";

/**
 * Cartridge class.
 */
export class Cartridge {
    static MIRROR_VERTICAL = 1;
    static MIRROR_HORIZONTAL = 2;
    static MIRROR_ONE_SCREEN_LO = 3;
    static MIRROR_ONE_SCREEN_HI = 4;

    /**
     * Cartridge constructor.
     *
     * @param path
     */
    constructor(path) {
        this.path = path;

        this.header = {};
        this.data = {};
        this.mapper = null;
        // Stores the mirror of the name table.
        this.mirror = Cartridge.MIRROR_HORIZONTAL;
    }

    /**
     * Load the cartridge.
     *
     * @param callback
     */
    load(callback) {
        fetch('/rom/' + this.path)
            .then(res => res.blob()) // Gets the response and returns it as a blob
            .then(blob => {
                let reader = new FileReader();
                reader.onload = () => {
                    this.data = parseNES.parseNES(new Buffer(reader.result));
                    this.header = {
                        name: new TextDecoder().decode(this.data.header.subarray(0, 4)),
                        prgRomChunks: this.data.header[4],
                        chrRomChunks: this.data.header[5],
                    };

                    this.initMapper();

                    callback();
                };
                reader.readAsArrayBuffer(blob);
            });
    }

    /**
     * Init the mapper.
     */
    initMapper() {
        switch (this.data.mapper) {
            case 0:
                this.mapper = new Mapper000(this.header.prgRomChunks, this.header.chrRomChunks);
                break;
            default:
                throw new Error('The mapper ' + this.data.mapper + ' has not been implemented yet');
        }

        this.mirror = (this.data.mapper & 0x01) ? Cartridge.MIRROR_VERTICAL : Cartridge.MIRROR_HORIZONTAL;
    }

    /**
     * Read a memory location.
     *
     * @param {number} addr - The address to read from.
     */
    cpuRead(addr) {
        let mappedAddr = this.mapper.mapCpuRead(addr);
        if (mappedAddr) {
            return this.data.prg_rom[mappedAddr];
        }

        return 0x00;
    }

    /**
     * Write a value to a memory location.
     *
     * @param {number} addr - The address to write to.
     * @param {number} value - The value to write.
     */
    cpuWrite(addr, value) {
        let mappedAddr = this.mapper.mapCpuWrite(addr);
        if (mappedAddr) {
            this.data.prg_rom[mappedAddr] = value;
            return true;
        }

        return false;
    }

    /**
     * Read a memory location.
     *
     * @param {number} addr - The address to read from.
     */
    ppuRead(addr) {
        let mappedAddr = this.mapper.mapPpuRead(addr);
        if (mappedAddr) {
            return this.data.chr_rom[mappedAddr];
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
        let mappedAddr = this.mapper.mapPpuWrite(addr);
        if (mappedAddr) {
            this.data.chr_rom[mappedAddr] = value;
            return true;
        }

        return false;
    }
}