import Ability from './Ability';
import Link from './Link';

export default class Push extends Ability {
    static key = 'push';
    speed = 400;
    pushDistance = 2;
    maxDistanceToLive = 500;
    distanceToLive = 500;
    bulletSprite = null;
    active = false;

    constructor(scene) {
        super(scene);
        this.bulletSprite = this.createBullet();
        this.scene.foregroundGroup.add(this.bulletSprite);
    }

    createBullet() {
        let bullet = this.scene.physics.add.sprite(-100, -100, 'base_powerup_push');
        bullet.body.allowGravity = false;
        bullet.body.setSize(10, 10, true);
        bullet.body.setImmovable();
        bullet.disableBody(true, true);

        return bullet;
    }

    trigger() {
        this.active = true;
        this.distanceToLive = this.maxDistanceToLive;
        let pointer = this.scene.input.activePointer;
        let player = this.sprite;
        let angle = Math.atan2(pointer.y - player.y, pointer.x - player.x);

        this.bulletSprite.enableBody(true, player.x, player.y, true, true);
        this.bulletSprite.body.setVelocityX(Math.cos(angle)*this.speed);
        this.bulletSprite.body.setVelocityY(Math.sin(angle)*this.speed);

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
            this.scene.physics.world.collide(this.bulletSprite, this.scene.currentLevel.spriteMap, this.handleBulletCollide);

            this.distanceToLive -= this.bulletSprite.body.deltaAbsX() + this.bulletSprite.body.deltaAbsY();
            if (this.distanceToLive <= 0) {
                this.disable();
            }
        }
    }

    handleBulletCollide = (bulletSprite, levelSprite) => {
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