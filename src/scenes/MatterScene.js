var player;
var cursors;
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
            key: 'MatterScene',
            active: true
        });
    }

    /**
     * @memberof MatterScene
     */
    preload() {
        this.load.image('block', 'assets/images/base/wall.png');
        this.load.image('igor', 'assets/images/igor.png');
    }

    /**
     * @memberof MatterScene
     */
    create () {
        this.matter.world.setBounds(0, 0, 720, 400);
        player = this.matter.add.image(64, 300, 'igor');
        player.body.accelGround = 100;
        player.body.accelAir = 100;
        player.inertia = Infinity;
        player.body.jumpSpeed = 1000;

        
        player.sensor = this.matter.add.rectangle(100, 400, player.width, 10, { mass: Infinity, isStatic: false, isSensor: true, ignoreGravity: true });
    console.log(player, player.sensor)

        var bodyA = this.matter.add.image(100, 360, 'block');
        var bodyB = this.matter.add.image(100, 380, 'block');
        var bodyC = this.matter.add.image(100, 400, 'block');

        cursors = this.input.keyboard.createCursorKeys();
    }

    jump() {
        if (player.jumping) {
            return;
        }
        
        // TODO: review     
        // TODO: check that plugin and implement it here.
        if (player.grounded || true) {
            console.log('lets go')
            player.setVelocityY(-10);
        }
        if (!player.jumping) {
            player.jumpTimer = 600;
        }
        player.jumping = true;
    }

    /**
     * @param {*} time
     * @param {*} delta
     * @returns
     * @memberof MatterScene
     */
    update(time, delta) {
        player.sensor.position.x = player.x
        player.sensor.position.y = player.y + 32;
        player.jumpTimer -= delta;
        if (cursors.up.isDown && (!player.jumping || player.jumpTimer > 0)) {
            this.jump();
            console.log(player.body);
        }
        else if (!cursors.up.isDown) {
            player.jumpTimer = -1; // Don't resume jump if button is released, prevents mini double-jumps
        }

        if (player.body.velocity.y === 0 && player.jumping) {
            player.jumping = false;
        }

        var accel = player.body.standing ? player.body.accelGround : player.body.accelAir;

        if (cursors.left.isDown)
        {
            player.setVelocityX(-2);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(2);
        }
        else
        {
            player.setVelocityX(0);
        }
    }
}

export default MatterScene;
