import Igor from '../sprites/Igor';
import levelLoader from '../levels/LevelLoader';

/**
 * @class GameScene
 * @extends {Phaser.Scene}
 */
class GameScene extends Phaser.Scene {
    currentLevel = null;
    backgroundGroup = null;
    middleGroup = null;
    foregroundGroup = null;

    /**
     * Creates an instance of GameScene.
     * @param {*} test
     * @memberof GameScene
     */
    constructor(test) {
        super({
            key: 'GameScene',
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
        this.load.on('progress', (value) => {
            progress.clear();
            progress.fillStyle(0xffffff, 1);
            progress.fillRect(0, this.sys.game.config.height / 2, this.sys.game.config.width * value, 60);
        });

        // Register a load complete event to launch the title screen when all files are loaded
        this.load.on('complete', () => {
            // prepare all animations, defined in a separate file
            // makeAnimations(this);
            progress.destroy();
        });

        Igor.preload(this.load);
    }

    /**
     * @memberof GameScene
     */
    create () {
        this.backgroundGroup = this.add.group();
        this.middleGroup = this.add.group();
        this.foregroundGroup = this.add.group();
        levelLoader(this, 5, 0).then(this.initLevel);

        // A group powerUps to update
        this.powerUps = this.add.group();

        // this.keys will contain all we need to control Mario.
        // Any key could just replace the default (like this.key.jump)
        this.keys = {
            jump: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
        };

        // If the game ended while physics was disabled
        this.physics.world.resume();

        // CREATE IGOR!!!
        this.igor = new Igor({
            scene: this,
            x: 500,
            y: 110
        });

        this.middleGroup.add(this.igor);

        // this.fireballs = this.add.group({
        //     classType: Fire,
        //     maxSize: 10,
        //     runChildUpdate: false // Due to https://github.com/photonstorm/phaser/issues/3724
        // });
    }

    /**
     * Initialize after loading a new level
     * @memberof GameScene
     */
    initLevel = (lvl) => {
        this.currentLevel = lvl;

        // Depth sorting
        this.backgroundGroup.setDepth(0);
        this.middleGroup.setDepth(500);
        this.foregroundGroup.setDepth(1000);

        this.physics.add.collider(this.currentLevel.spriteMap, this.igor, (sprite, igor) => {
            let tile = sprite.getData('tile');
            if (tile.onCollide) {
                tile.onCollide(igor);
            }
            if (igor.onCollide) {
                igor.onCollide(tile);
            }
        }, (sprite, igor) => {
            return sprite.getData('tile').collides;
        });

        this.physics.add.overlap(this.currentLevel.spriteMap, this.igor, (sprite, igor) => {
            let tile = sprite.getData('tile');
            if (tile.onOverlap) {
                tile.onOverlap(igor);
            }

            if (igor.onOverlap) {
                igor.onOverlap(tile);
            }
        });

        // Resume physics and update loop
        this.physics.world.resume();
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

        if (this.physics.world.isPaused) {
            return;
        }

        this.updateInput();
        this.updateCollisions();
        this.updateEntities(delta);
        this.checkLevelTransition();

        // Run the update method of all enemies
        /*if (this.enemyGroup.children.length) {
            this.enemyGroup.children.entries.forEach(
                (sprite) => {
                    sprite.update(time, delta);
                }
            );
        }

        // Run the update method of non-enemy sprites
        if (this.powerUps.children.length) {
            this.powerUps.children.entries.forEach(
                (sprite) => {
                    sprite.update(time, delta);
                }
            );
        }*/
    }

    /**
     * Update user input
     *
     * @memberof GameScene
     */
    updateInput() {
        let pointer = this.input.activePointer;
        //this.keys.firePush = pointer.isDown;
        this.keys.fireLink = pointer.rightButtonDown();
    }

    /**
     * This was refactored to colliders. See initLevel.
     *
     * @memberof GameScene
     */
    updateCollisions() {
        if (this.currentLevel) {
        }
    }

    /**
     * Update entities within the scene
     *
     * @memberof GameScene
     */
    updateEntities(delta) {
        this.igor.update(this.keys, delta);
    }

    /**
     * Check and load a different level if we've crossed a boundary
     *
     * @memberof GameScene
     */
    checkLevelTransition() {
        if (this.igor.y < this.igor.height / 2) {
            this.physics.world.pause();
            levelLoader(this, this.currentLevel.x, this.currentLevel.y+1).then(this.initLevel);
        }
        else if (this.igor.x < this.igor.width / 2) {
            this.physics.world.pause();
            levelLoader(this, this.currentLevel.x - 1, this.currentLevel.y).then(this.initLevel);
        }
        else if (this.igor.x > this.sys.game.config.width) {
            this.physics.world.pause();
            levelLoader(this, this.currentLevel.x + 1, this.currentLevel.y).then(this.initLevel);
        }
        else if (this.igor.y > this.sys.game.config.height) {
            this.physics.world.pause();
            levelLoader(this, this.currentLevel.x, this.currentLevel.y - 1).then(this.initLevel);
        }
    }

    /**
     * @memberof GameScene
     */
    cleanUp() {
        // Never called since 3.10 update (I called it from create before). If Everything is fine, I'll remove this method.
        // Scenes isn't properly destroyed yet.
        let ignore = ['sys', 'anims', 'cache', 'registry', 'sound', 'textures', 'events', 'cameras', 'make', 'add', 'scene', 'children', 'cameras3d', 'time', 'data', 'input', 'load', 'tweens', 'lights', 'physics'];
        let whatThisHad = ['sys', 'anims', 'cache', 'registry', 'sound', 'textures', 'events', 'cameras', 'make', 'add', 'scene', 'children', 'cameras3d', 'time', 'data', 'input', 'load', 'tweens', 'lights', 'physics', 'attractMode', 'destinations', 'rooms', 'eightBit', 'music', 'map', 'tileset', 'groundLayer', 'mario', 'enemyGroup', 'powerUps', 'keys', 'blockEmitter', 'bounceTile', 'levelTimer', 'score', 'finishLine', 'touchControls'];
        whatThisHad.forEach(key => {
            if (ignore.indexOf(key) === -1 && this[key]) {
                switch (key) {
                    case 'enemyGroup':
                    case 'music':
                    case 'map':
                        this[key].destroy();
                        break;
                }
                this[key] = null;
            }
        });
    }
}

export default GameScene;
