import MultiKey from '../multikey';

export default class MatterPlayer {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = this.scene.matter.add.sprite(0, 0, 'igor', 0);

        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const { width, height } = this.sprite;

        const mainBody = Bodies.rectangle(0, 0, width * 0.6, height, {
            chamfer: { radius: 10 },
        });

        this.sensors = {
            bottom: Bodies.rectangle(0, height * 0.5, width * 0.25, 2, {
                isSensor: true,
            }),
            left: Bodies.rectangle(-width * 0.35, 0, 2, height * 0.5, {
                isSensor: true,
            }),
            right: Bodies.rectangle(width * 0.35, 0, 2, height * 0.5, {
                isSensor: true,
            }),
        };

        const compoundBody = Body.create({
            parts: [
                mainBody,
                this.sensors.bottom,
                this.sensors.left,
                this.sensors.right,
            ],
            frictionStatic: 0,
            frictionAir: 0.02,
            friction: 5,
        });

        this.sprite
            .setExistingBody(compoundBody)
            .setScale(1)
            .setFixedRotation()
            .setPosition(x, y);

        // Track the keys
        const {
            LEFT,
            RIGHT,
            UP,
            A,
            Q,
            D,
            W,
            Z,
        } = Phaser.Input.Keyboard.KeyCodes;
        this.leftInput = new MultiKey(scene, [LEFT, A, Q]);
        this.rightInput = new MultiKey(scene, [RIGHT, D]);
        this.jumpInput = new MultiKey(scene, [UP, W, Z]);

        this.scene.events.on('update', this.update, this);
    }

    update() {
        const sprite = this.sprite;
        const velocity = sprite.body.velocity;
        const isRightKeyDown = this.rightInput.isDown();
        const isLeftKeyDown = this.leftInput.isDown();
        const isJumpKeyDown = this.jumpInput.isDown();

        const moveForce = 0.01;

        if (isLeftKeyDown) {
            sprite.setFlipX(true);
            sprite.applyForce({ x: -moveForce, y: 0 });
        } else if (isRightKeyDown) {
            sprite.setFlipX(false);
            sprite.applyForce({ x: moveForce, y: 0 });
        }

        // Limit horizontal speed, without this the player's velocity would just keep increasing to
        // absurd speeds. We don't want to touch the vertical velocity though, so that we don't
        // interfere with gravity.
        if (velocity.x > 3) sprite.setVelocityX(3);
        else if (velocity.x < -3) sprite.setVelocityX(-3);

        if (isJumpKeyDown) {
            sprite.setVelocityY(-11);
        }
    }
}
