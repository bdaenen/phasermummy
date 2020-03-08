var player;
var cursors;
import MatterPlayer from "../sprites/MatterPlayer.js";

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
    }

    /**
     * @memberof MatterScene
     */
    create() {
        this.matter.world.setBounds(0, 0, 720, 400);
        player = new MatterPlayer(this, 64, 300);

        var bodyA = this.matter.add.image(100, 360, "block");
        var bodyB = this.matter.add.image(100, 380, "block");
        var bodyC = this.matter.add.image(100, 400, "block");

        cursors = this.input.keyboard.createCursorKeys();
    }

    jump() {

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
