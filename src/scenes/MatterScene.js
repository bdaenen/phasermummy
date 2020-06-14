var player;
var cursors;
import MatterPlayer from "../sprites/MatterPlayer.js";
import Slopes from 'phaser-slopes';
import levelJson from '../levels/level2_0.';

/**
 * @class MatterScene
 * @extends {Phaser.Scene}
 */
class MatterScene extends Phaser.Scene {
    /**
     * Creates an instance of MatterScene.
     * @param {*} test
     * @memberof MatterScene
     */
    constructor(test) {
        super({
            key: "MatterScene",
            active: true
        });
    }

    /**
     * @memberof MatterScene
     */
    preload() {
        this.load.image("block", "assets/images/base/wall.png");
        this.load.image("igor", "assets/images/igor.png");
        this.load.tilemapTiledJSON("map", levelJson);
        this.load.scenePlugin('Slopes', Slopes);
        this.load.image(
            "ForgottenDungeonRecolor",
            "assets/gamedevmarket/5e2cbce57025549152274cf3a95ee676/ForgottenDungeonTILESET-recolor.png"
        );
    }

    /**
     * @memberof MatterScene
     */
    create() {
        //this.matter.world.setBounds(0, 0, 720, 400);

        this.matter.world.setGravity(0, 0.8);
        const map = this.make.tilemap({key: 'map'});
        const tileset = map.addTilesetImage('ForgottenDungeonRecolor');
        map.createDynamicLayer('Background', tileset, 0, 0);
        const wallsLayer = map.createDynamicLayer('Walls', tileset, 0, 0);

        wallsLayer.setDepth(10);

        // Set colliding tiles before converting the layer to Matter bodies
        wallsLayer.setCollisionByProperty({collides: true});

        // Get the layers registered with Matter. Any colliding tiles will be given a Matter body. We
        // haven't mapped our collision shapes in Tiled so each colliding tile will get a default
        // rectangle body (similar to AP).
        this.matter.world.convertTilemapLayer(wallsLayer);

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        map.getObjectLayer("Boxes").objects.forEach(box => {
            const {x, y, width, height} = box;

            // Tiled origin for coordinate system is (0, 1), but we want (0.5, 0.5)
            this.matter.add
                .image(x + width / 2, y - height / 2, "block")
                .setBody({shape: "rectangle", density: 0.001});
        });

        player = new MatterPlayer(this, 260, 180);
        this.player = player;

        this.unsubscribePlayerCollide = this.matterCollision.addOnCollideStart({
            objectA: player.sprite,
            callback: this.onPlayerCollide,
            context: this
        });

        cursors = this.input.keyboard.createCursorKeys();
    }

    onPlayerCollide({gameObjectB}) {
        if (!gameObjectB || !(gameObjectB instanceof Phaser.Tilemaps.Tile)) return;

        const tile = gameObjectB;

        // Check the tile property set in Tiled (you could also just check the index if you aren't using
        // Tiled in your game)
        if (tile.properties.lethal) {
            // Unsubscribe from collision events so that this logic is run only once
            this.unsubscribePlayerCollide();

            this.player.freeze();
            const cam = this.cameras.main;
            cam.fade(250, 0, 0, 0);
            cam.once("camerafadeoutcomplete", () => this.scene.restart());
        }
    }

    /**
     * @param {*} time
     * @param {*} delta
     * @returns
     * @memberof MatterScene
     */
    update(time, delta) {

    }
}

export default MatterScene;
