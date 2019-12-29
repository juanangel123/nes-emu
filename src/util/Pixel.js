'use strict';

/**
 * Pixel class.
 */
export class Pixel {
    /**
     * Pixel constructor.
     *
     * @param r
     * @param g
     * @param b
     * @param a
     */
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}