import 'phaser';
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
import MatterTest from './scenes/MatterScene';
import TitleScene from './scenes/TitleScene';

const config = {
    // For more settings see <https://github.com/photonstorm/phaser/blob/master/src/boot/Config.js>
    type: Phaser.WEBGL,
    pixelArt: true,
    roundPixels: true,
    parent: 'content',
    width: 720,
    height: 400,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'matter',
        matter: {
            debug: true,
            gravity: {
                x: 0,
                y: 5
            }
        }
    },
    plugins: {
        scene: [
          {
            plugin: PhaserMatterCollisionPlugin, // The plugin class
            key: "matterCollision", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
            mapping: "matterCollision" // Where to store in the Scene, e.g. scene.matterCollision
          }
        ]
    },
    scene: [
        MatterTest
        //BootScene,
        //TitleScene,
        //GameScene
    ]
};

const game = new Phaser.Game(config); // eslint-disable-line no-unused-vars