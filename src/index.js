'use strict';

import {NES} from './NES';
import {Cartridge} from './Cartridge';
import {Pixel} from './util/Pixel';
import {Helper} from './util/Helper';

const screen = document.getElementById('screen');
const pattern1 = document.getElementById('pattern1');
const pattern2 = document.getElementById('pattern2');
let currentPalette = 0x00;
let path = 'test.nes';
//let path = 'mario.nes';
//let path = 'tetris.nes';
//let path = 'dk.nes';

const nes = new NES();
nes.insertCartridge(new Cartridge(path), () => {
    nes.reset();

    document.addEventListener('keypress', (e) => {
        if (e.code === 'Space') {
            frame(true);
        } else if (e.code === 'KeyS') {
            nes.step();
        } else if (e.code === 'KeyP') {
            currentPalette = currentPalette + 1 % 0x16;
        }

        drawScreen(screen);
        drawPattern(pattern1, 0, currentPalette);
        drawPattern(pattern2, 1, currentPalette);

        nes.cpu.log();
    });

    heya();

    // while (true) {
    //     heya();
    // }
});

async function heya() {
    let now = Date.now();
    let dt = 0;

    frame(true);

    // Wait for the next frame.
    dt = Date.now() - now;
    let wait = 16.666 - dt;
    if (wait) {
        await Helper.sleep(wait);
    }

    console.log('heya2');
}

/**
 * Do a complete frame.
 *
 * @param render
 */
function frame(render = false) {
    do {
        nes.step();
    } while (!nes.ppu.frameComplete);
    // Reset the frame complete flag.
    nes.ppu.frameComplete = false;

    if (render) {
        drawScreen(screen);
        drawPattern(pattern1, 0, currentPalette);
        drawPattern(pattern2, 1, currentPalette);
    }
}

function drawScreen(canvas) {
    let ctx = canvas.getContext('2d');

    let data = [];
    for (let x = 0; x < 256; x++) {
        for (let y = 0; y < 240; y++) {
            let pixel = new Pixel(255, 0, 0);
            if (nes.ppu.sprScreen[x] && nes.ppu.sprScreen[x][y]) {
                pixel = nes.ppu.sprScreen[x][y];
            }

            data.push(pixel.r, pixel.g, pixel.b, pixel.a * 255);
        }
    }

    ctx.putImageData(new ImageData(new Uint8ClampedArray(data), 256, 240), 0, 0);
}

function drawPattern(canvas, i, palette) {
    let ctx = canvas.getContext('2d');
    let rawData = nes.ppu.getPatternTable(i, palette);
    let data = [];
    for (let x = 0; x < rawData.length; x++) {
        for (let y = 0; y < rawData[x].length; y++) {
            if (!rawData[x][y]) {
                continue;
            }

            let pixel = rawData[x][y];
            data.push(pixel.r, pixel.g, pixel.b, pixel.a * 255);
        }
    }

    ctx.putImageData(new ImageData(new Uint8ClampedArray(data), 128, 128), 0, 0);
}

