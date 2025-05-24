// Melissa Rosales
// Created: 4/14/2024
// Phaser: 3.70.0
//
// Seasons Greetings
//
"use strict"
const SCALE = parseInt((window.innerWidth-50) / 720);
console.log(SCALE); 

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    scale: {
        //mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    width: 720 * SCALE,
    height: 360*SCALE,
    scene: [Load, Platformer, End],

    plugins: {
        scene: [
            {
                key: 'AnimatedTiles',
                plugin: window.AnimatedTiles, // must match how it's loaded
                mapping: 'animatedTiles'
            }
        ]
    }
};

var cursors;

var my = {sprite: {}, text: {}, vfx: {}};

const game = new Phaser.Game(config);