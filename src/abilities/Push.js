import Ability from './Ability';
import Link from './Link';

export default class Push extends Ability {
    static key = 'push';
    speed = 1;
    pushDistance = 2;
    maxDistanceToLive = 1000;
    distanceToLive = 1000;
    bulletSprite = null;
    active = false;

    constructor(scene) {
        super(scene);
        this.bulletSprite = this.createBullet();
        this.scene.matter.add.sprite(this.bulletSprite);
    }

    createBullet() {
        let bullet = this.scene.matter.add.sprite(-100, -100, 'base_powerup_push');
        bullet.body.allowGravity = false;
        //bullet.body.setSize(10, 10, true);
        //bullet.body.setImmovable();
        //bullet.disableBody(true, true);

        return bullet;
    }

    trigger() {
        this.active = true;
        this.distanceToLive = this.maxDistanceToLive;
        let pointer = this.scene.input.activePointer;
        let player = this.sprite;
        let angle = Math.atan2(pointer.y - player.y, pointer.x - player.x);

        this.bulletSprite.setPosition(player.x, player.y);

        this.bulletSprite.setVelocityX(Math.cos(angle)*this.speed);
        this.bulletSprite.setVelocityY(Math.sin(angle)*this.speed);

        return true;
    }

    disable() {
        this.active = false;
        this.bulletSprite.disableBody(true, true);
    }

    isReady() {
        return super.isReady()
            && !this.active
            && this.scene.input.activePointer.isDown
            && this.scene.input.activePointer.button === 0
        ;
    }

    update(delta) {
        super.update(delta);

        if (this.active) {
            //this.scene.matter.world.collide(this.bulletSprite, this.scene.currentLevel.spriteMap, this.handleBulletCollide);
            this.scene.matterCollision.addOnCollideStart({
                objectA: [this.bulletSprite],
                callback: this.handleBulletCollide,
                context: this
            });

            //this.distanceToLive -= this.bulletSprite.body.deltaAbsX() + this.bulletSprite.body.deltaAbsY();
            /*if (this.distanceToLive <= 0) {
                this.disable();
            }*/
        }
    }

    handleBulletCollide = ({gameObjectA: bulletSprite, gameObjectB: levelSprite}) => {
        let tile = levelSprite.getData('tile');
        if (tile.pushable) {
            let targets;
            let movement = bulletSprite.body.velocity.clone().normalize();

            if (tile.isAffectedBy(Link.key)) {
                targets = this.scene.currentLevel.getTilesAffectedBy(Link.key).map(t => t.sprite);
            } else {
                targets = [levelSprite];
            }

            targets.forEach((sprite) => {
                sprite.body.velocity.x = bulletSprite.body.velocity.x;
                sprite.body.velocity.y = bulletSprite.body.velocity.y;
            })
            this.scene.currentLevel.tileMap.forEach((t) => {
                t.unapplyAbility(this.key);
            })
            tile.applyAbility(this.key);
        }
        if (tile.collides) {
            this.disable();
        }
    }
}
