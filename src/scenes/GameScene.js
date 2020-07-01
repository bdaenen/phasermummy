import Igor from "../sprites/Igor";
import levelLoader from "../levels/LevelLoader";
import controllable from "../decorators/controllable";
import TILEMAP_FORMATS from 'phaser/src/tilemaps/Formats'


/**
 * @class GameScene
 * @extends {Phaser.Scene}
 */
class GameScene extends Phaser.Scene {
    currentLevel = null;
    backgroundGroup = null;
    middleGroup = null;
    foregroundGroup = null;
    levelCoords = {x: 2, y: 0};
    levelObjects = [];
    levelCollider = null;
    created = false;

    /**
     * Creates an instance of GameScene.
     * @param {*} test
     * @memberof GameScene
     */
    constructor(test) {
        super({
            key: "GameScene",
            active: false
        });
    }

    /**
     * @memberof GameScene
     */
    preload() {
        //this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
        const progress = this.add.graphics();

        // Register a load progress event to show a load bar
        this.load.on("progress", value => {
            progress.clear();
            progress.fillStyle(0xffffff, 1);
            progress.fillRect(
                0,
                this.sys.game.config.height / 2,
                this.sys.game.config.width * value,
                60
            );
        });

        // Register a load complete event to launch the title screen when all files are loaded
        this.load.on("complete", () => {
            // prepare all animations, defined in a separate file
            // makeAnimations(this);
            progress.destroy();
        });

        Igor.preload(this.load);
        //this.load.image("block", "assets/images/base/wall.png");
        //this.load.image("igor", "assets/images/igor.png");
        //this.load.image("base_powerup_link", "assets/images/abilities/link.png");
        //this.load.image("powerup_link", "assets/images/abilities/link.png");
        //this.load.image("link", "assets/images/abilities/link.png");
        //this.load.image("base_powerup_push", "assets/images/abilities/push.png");
        //this.load.image("powerup_push", "assets/images/abilities/push.png");
        //this.load.image("push", "assets/images/abilities/push.png");
        //this.load.tilemapTiledJSON({key: "map", url: "assets/levels/level2_0.json"});
        // this.load.scenePlugin('Slopes', Slopes);
        this.load.image(
            "ForgottenDungeonRecolor",
            "assets/gamedevmarket/5e2cbce57025549152274cf3a95ee676/ForgottenDungeonTILESET-recolor.png"
        );
    }

    async loadLevel(x, y) {
        console.log('importing ' + x + ', ' + y);
        let levelData = await import(`../../assets/levels/level${x}_${y}.json`);
        let tiledata = {format: TILEMAP_FORMATS.TILED_JSON, data: levelData.default};

        this.cache.tilemap.add(`LEVEL_${x}_${y}`, tiledata);
console.log('added to cache');
        return true;
    }

    initLevel = () => {
        const {x, y} = this.levelCoords;
        this.physics.world.pause();

        if (this.currentLevel) {
            this.levelObjects.forEach((body) => {
                body.destroy()
            });
            this.levelCollider.destroy();
            this.levelCollider = null;
            this.currentLevel.destroy();
        }
        const map = this.make.tilemap({key: `LEVEL_${x}_${y}`});
        this.currentLevel = map;
        const tileset = map.addTilesetImage('ForgottenDungeonRecolor');
        const bgLayer = map.createDynamicLayer('Background', tileset, 0, 0);
        const wallsLayer = map.createDynamicLayer('Walls', tileset, 0, 0);
        this.backgroundGroup.add(bgLayer);
        this.foregroundGroup.add(wallsLayer);

        // Set colliding tiles before converting the layer to Matter bodies
        wallsLayer.setCollisionByProperty({collides: true});

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        map.getObjectLayer("Boxes").objects.forEach(box => {
            const {x, y, width, height, properties} = box;
            const key = properties ? properties.find(prop => prop.name === 'key').value : 'block';
            // Tiled origin for coordinate system is (0, 1), but we want (0.5, 0.5)
            this.levelObjects.push(this.physics.add
                .image(x - width / 2, y - height / 2, key)
                .setDepth(11)
            )
        });

        if (this.igor) {
            this.levelCollider = this.physics.add.collider(this.igor, wallsLayer);
        }

        this.physics.world.resume();
    }


    /**
     * @memberof GameScene
     */
    async create() {
        this.backgroundGroup = this.add.group();
        this.middleGroup = this.add.group();
        this.foregroundGroup = this.add.group();
        await this.loadLevel(this.levelCoords.x, this.levelCoords.y);

        this.initLevel();


        // A group powerUps to update
        this.powerUps = this.add.group();

        // If the game ended while physics was disabled
        this.physics.world.resume();

        // CREATE IGOR!!!
        this.igor = new Igor({
            scene: this,
            x: 500,
            y: 110
        });

        this.igor = controllable(this, this.igor, {
            left: ['LEFT', 'A', 'Q'],
            right: ['RIGHT', 'D'],
            up: ['UP', 'W', 'Z'],
            jump: ['X'],
            down: ['S']
        });

        this.middleGroup.add(this.igor);

        // this.fireballs = this.add.group({
        //     classType: Fire,
        //     maxSize: 10,
        //     runChildUpdate: false // Due to https://github.com/photonstorm/phaser/issues/3724
        // });

        if (!this.levelCollider) {
            debugger;
            this.levelCollider = this.physics.add.collider(this.igor, this.currentLevel.getLayer('Walls').tilemapLayer);
        }
        this.created = true;
    }

    /**
     * @param {*} time
     * @param {*} delta
     * @returns
     * @memberof GameScene
     */
    update(time, delta) {
        // this.fireballs.children.forEach((fire)=>{
        //    fire.update(time, delta);
        // })

        if (!this.created || this.physics.world.isPaused) {
            return;
        }

        this.updateInput();
        this.updateCollisions();
        this.checkLevelTransition();
    }

    /**
     * Update user input
     *
     * @memberof GameScene
     */
    updateInput() {
        let pointer = this.input.activePointer;
        //this.keys.firePush = pointer.isDown;
        //this.keys.fireLink = pointer.rightButtonDown();
    }

    /**
     * This was refactored to colliders. See initLevel.
     *
     * @memberof GameScene
     */
    updateCollisions() {
        if (this.currentLevel && !this.physics.world.isPaused) {
        }
    }

    /**
     * Check and load a different level if we've crossed a boundary
     *
     * @memberof GameScene
     */
    checkLevelTransition() {
        if (this.igor.y < this.igor.height / 2) {
            this.loadLevel(this.levelCoords.x, ++this.levelCoords.y).then(() => {
                this.initLevel();
                this.igor.y = this.currentLevel.heightInPixels - this.igor.height;
            })
        } else if (this.igor.x < this.igor.width / 2) {
            this.loadLevel(--this.levelCoords.x, this.levelCoords.y).then(() => {
                this.initLevel();
                this.igor.x = this.currentLevel.widthInPixels - this.igor.width;
            })
        } else if (this.igor.x > this.currentLevel.widthInPixels) {
            this.loadLevel(++this.levelCoords.x, this.levelCoords.y).then(() => {
                this.initLevel();
                this.igor.x = this.igor.width;
            })
        } else if (this.igor.y > this.currentLevel.heightInPixels) {
            this.loadLevel(this.levelCoords.x, --this.levelCoords.y ).then(() => {
                this.initLevel();
                this.igor.y = this.igor.height;
            })
        }
    }
}

export default GameScene;
