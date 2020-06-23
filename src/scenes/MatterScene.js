var player;
var cursors;
import MatterPlayer from "../sprites/MatterPlayer.js";
import Slopes from 'phaser-slopes';
import TILEMAP_FORMATS from 'phaser/src/tilemaps/Formats'

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
        this.levelCoords = {
            x: 2,
            y: 0
        }
        this.currentLevel = null;
        this.levelObjects = [];
    }

    /**
     * @memberof MatterScene
     */
    preload() {
        this.load.image("block", "assets/images/base/wall.png");
        this.load.image("igor", "assets/images/igor.png");
        this.load.tilemapTiledJSON({key: "map", url: "assets/levels/level2_0.json"});
        this.load.scenePlugin('Slopes', Slopes);
        this.load.image(
            "ForgottenDungeonRecolor",
            "assets/gamedevmarket/5e2cbce57025549152274cf3a95ee676/ForgottenDungeonTILESET-recolor.png"
        );
    }

    async loadLevel() {
        const { x, y } = this.levelCoords;
        let levelData = await import(`../../assets/levels/level${x}_${y}.json`);
        let tiledata = {format: TILEMAP_FORMATS.TILED_JSON, data: levelData.default};

        this.cache.tilemap.add(`LEVEL_${x}_${y}`, tiledata);

        return true;
    }

    initLevel() {
        const {x, y} = this.levelCoords;

        if (this.currentLevel) {
            let tiles = this.currentLevel.getTilesWithin(0, 0, this.currentLevel.width, this.currentLevel.height, {isColliding: true}, 'Walls');
            tiles.forEach((tile) => {
                tile.physics.matterBody.destroy()
            });
            this.levelObjects.forEach((body) => {
                body.destroy()
            })
            this.currentLevel.destroy()
        }
        const map = this.make.tilemap({key: `LEVEL_${x}_${y}`});
        this.currentLevel = map;
        const tileset = map.addTilesetImage('ForgottenDungeonRecolor');
        const bgLayer = map.createDynamicLayer('Background', tileset, 0, 0);
        const wallsLayer = map.createDynamicLayer('Walls', tileset, 0, 0);

        bgLayer.setDepth(9);
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
            this.levelObjects.push(this.matter.add
                .image(x - width / 2, y - height / 2, "block")
                .setBody({
                    shape: "rectangle",
                    density: 1,
                    width: 16,
                    height: 16
                })
                .setFixedRotation()
                .setStatic(true)
                .setDepth(11)
            )
        });
        this.player && this.player.sprite.setDepth(900)
    }

    /**
     * @memberof MatterScene
     */
    async create() {
        //this.matter.world.setBounds(0, 0, 720, 400);

        await this.loadLevel();
        this.matter.world.setGravity(0, 0.8);
        this.initLevel();

        player = new MatterPlayer(this, 260, 180);
        this.player = player;

        this.unsubscribePlayerCollide = this.matterCollision.addOnCollideStart({
            objectA: player.sprite,
            callback: this.onPlayerCollide,
            context: this
        });

        cursors = this.input.keyboard.createCursorKeys();

        this.player.sprite.setDepth(900);

        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
            let walls = Object.entries(this.matter.world.walls);

            let wall = walls.find(([key, value])=> {
                return value === bodyA || value === bodyB
            });

            if (!wall) return;

            switch (wall[0]) {
                case 'top':
                    break;
                case 'bottom':
                    break;
                case 'left':
                    this.levelCoords.x--;
                    this.loadLevel().then(() => {
                        this.initLevel();
                        this.player.sprite.x = this.currentLevel.widthInPixels - this.player.sprite.width/2;
                    });
                    break;
                case 'right':
                    this.levelCoords.x++;
                    this.loadLevel().then(() => {
                        this.initLevel();
                        this.player.sprite.x = this.player.sprite.width/2;
                    });
                    break;
            }
        });
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
