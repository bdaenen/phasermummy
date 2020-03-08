var player;
var cursors;
/**
 * @class ImpactScene
 * @extends {Phaser.Scene}
 */
class ImpactScene extends Phaser.Scene {


    /**
     * Creates an instance of ImpactScene.
     * @param {*} test
     * @memberof ImpactScene
     */
    constructor(test) {
        super({
            key: 'ImpactScene',
            active: true
        });
    }

    /**
     * @memberof ImpactScene
     */
    preload() {
        this.load.image('block', 'assets/images/base/wall.png');
        this.load.image('igor', 'assets/images/igor.png');
    }

    /**
     * @memberof ImpactScene
     */
    create () {
        this.impact.world.setBounds(0, 0, 720, 400, false, false, false, true);
        player = this.impact.add.image(64, 300, 'igor');
        player.setMaxVelocity(500, 400).setFriction(800, 0);
        player.body.accelGround = 100;
        player.body.accelAir = 100;
        player.body.jumpSpeed = 1000;
        var bodyA = this.impact.add.image(100, 360, 'block');
        var bodyB = this.impact.add.image(100, 380, 'block');
        var bodyC = this.impact.add.image(100, 400, 'block');

        bodyA.body.gravityFactor = 0;
        bodyB.body.gravityFactor = 0;
        bodyC.body.gravityFactor = 0;

        player.setTypeA().setCheckAgainstB().setActiveCollision().setMaxVelocity(300);
        bodyA.setTypeB().setCheckAgainstA().setFixedCollision();
        bodyB.setTypeB().setCheckAgainstA().setFixedCollision();
        bodyC.setTypeB().setCheckAgainstA().setFixedCollision();

        this.impact.world.setActive([player ]);
        cursors = this.input.keyboard.createCursorKeys();
    }

    /**
     * @param {*} time
     * @param {*} delta
     * @returns
     * @memberof ImpactScene
     */
    update(time, delta) {
        var accel = player.body.standing ? player.body.accelGround : player.body.accelAir;

        if (cursors.left.isDown)
        {
            player.setAccelerationX(-accel);
        }
        else if (cursors.right.isDown)
        {
            player.setAccelerationX(accel);
        }
        else
        {
            player.setAccelerationX(0);
        }

        if (cursors.up.isDown && player.body.standing)
        {
            player.setVelocityY(-player.body.jumpSpeed);
        }
    }
}

export default ImpactScene;
