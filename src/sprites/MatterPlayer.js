import MultiKey from '../multikey';

export default class MatterPlayer {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = this.scene.matter.add.sprite(0, 0, 'igor', 0);
        this.isTouching = {left: false, right: false, ground: false};
        // TODO: grace period for allowing jumps
        this.sinceGroundTouching = 0;
        this.didJump = false;

        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const { width, height } = this.sprite;

        const mainBody = Bodies.rectangle((width/2), height/2, width * 0.6, height, {
            rectangle: { width: 10, height: 10 },
        });

        this.sensors = {
            bottom: Bodies.rectangle(width/2, height, 8, 2, {
                isSensor: true,
            }),
            left: Bodies.rectangle(width/4, height/2, 4, height * 0.5, {
                isSensor: true,
            }),
            right: Bodies.rectangle(width/4*3, height/2, 4, height * 0.5, {
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
            frictionStatic: 1,
            frictionAir: 0.03,
            friction: 0.2,
        });

        this.sprite
            .setExistingBody(compoundBody)
            .setScale(1)
            .setFixedRotation()
            .setMass(2.1)
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


        // Before matter's update, reset our record of what surfaces the player is touching.
        scene.matter.world.on('beforeupdate', this.resetTouching, this);

        // If a sensor just started colliding with something, or it continues to collide with something,
        // call onSensorCollide
        scene.matterCollision.addOnCollideStart({
            objectA: [this.sensors.bottom, this.sensors.left, this.sensors.right],
            callback: this.onSensorCollide,
            context: this
        });
        scene.matterCollision.addOnCollideActive({
            objectA: [this.sensors.bottom, this.sensors.left, this.sensors.right],
            callback: this.onSensorCollide,
            context: this
        });

        this.scene.events.on('update', this.update, this);
    }

    onSensorCollide({bodyA, bodyB, pair}) {
        if (bodyB.isSensor) return; // We only care about collisions with physical objects
        if (bodyA === this.sensors.left) {
            this.isTouching.left = true;
            // This fixes 90% of the "sticky wall" situations
            this.sprite.setVelocityX(0);
            if (pair.separation >= 0.5) this.sprite.x += pair.separation - 0.5;
        } else if (bodyA === this.sensors.right) {
            this.isTouching.right = true;
            // This fixes 90% of the "sticky wall" situations
            this.sprite.setVelocityX(0);
            if (pair.separation >= 0.5) this.sprite.x -= pair.separation - 0.5;
        } else if (bodyA === this.sensors.bottom) {
            this.isTouching.ground = true;
            this.didJump = false;
        }
    }

    resetTouching() {
        this.isTouching.left = false;
        this.isTouching.right = false;
        this.isTouching.ground = false;
    }

    freeze() {
        this.sprite.setStatic(true);
    }

    update() {
        if (this.destroyed) {
            return;
        }

        const sprite = this.sprite;
        const velocity = sprite.body.velocity;
        const isRightKeyDown = this.rightInput.isDown();
        const isLeftKeyDown = this.leftInput.isDown();
        const isJumpKeyDown = this.jumpInput.isDown();
        let forceToApply = {x: 0, y: 0};

        if (isLeftKeyDown) {
            sprite.setFlipX(true);
            // Only move left if we're grounded, or not touching a wall. The grounded check is necessary to make slopes work.
            if (!this.isTouching.left) {
                forceToApply.x = this.isTouching.ground ? -0.01 : -0.005;
            }
        } else if (isRightKeyDown) {
            sprite.setFlipX(false);
            // Only move left if we're grounded, or not touching a wall. The grounded check is necessary to make slopes work.
            if (!this.isTouching.right) {
                forceToApply.x = this.isTouching.ground ? 0.01 : 0.005
            }
        }

        // TODO: check if thiis is still needed. Might interfere with strongly pushing the player back.
        if (velocity.x > 2) sprite.setVelocityX(2);
        else if (velocity.x < -2) sprite.setVelocityX(-2);

        if (this.didJump) {
            if (velocity.x >= 2) {
            //    forceToApply.x = -0.005
                //sprite.applyForce({x: -0.005, y: 0});
            }
            if (velocity.x <= -2) {
            //    forceToApply.x = 0.005
                //sprite.applyForce({x: 0.005, y: 0});
            }
        }

        if (isJumpKeyDown && this.isTouching.ground) {
            sprite.setVelocityY(-7);
            this.didJump = true;
        }

        if (this.isTouching.ground && velocity.y > 0) {
            sprite.setVelocityY(0);
            forceToApply.y = 0;
        }

        sprite.applyForce(forceToApply)

        // TODO: experiment with this.jumpInput.isDown() + this.didJump + this.jumpInput.timeOdwn so we can jump higher when holding up longer.
    }

    destroy() {
        this.destroyed = true;

        // Event listeners
        this.scene.events.off('update', this.update, this);
        this.scene.events.off('shutdown', this.destroy, this);
        this.scene.events.off('destroy', this.destroy, this);
        if (this.scene.matter.world) {
            this.scene.matter.world.off('beforeupdate', this.resetTouching, this);
        }

        // Matter collision plugin
        const sensors = [this.sensors.bottom, this.sensors.left, this.sensors.right];
        this.scene.matterCollision.removeOnCollideStart({
            objectA: sensors
        });
        this.scene.matterCollision.removeOnCollideActive({
            objectA: sensors
        });

        this.sprite.destroy();
    }
}
