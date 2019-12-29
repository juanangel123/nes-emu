'use strict';

/**
 * Helper class.
 */
export class Helper {
    /**
     * Flip the k bit in the number n.
     *
     * @param n
     * @param k
     * @returns {number}
     */
    static flipBit(n, k) {
        return (n ^ (1 << (k - 1)));
    }

    /**
     * ES6 sleep function.
     *
     * @param ms
     * @returns {Promise<function>}
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}