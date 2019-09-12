import Ability from './Ability';
import Push from './Push';

/**
 * @export
 * @class Link
 * @extends {Push}
 */
export default class Link extends Push {
    static key = 'link';
    targets = [];
    minLinks = 2;
    maxLinks = 2;
    graphics = null;

    /**
     *Creates an instance of Link.
     * @param {*} scene
     * @memberof Link
     */
    constructor(scene) {
        super(scene);
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(Infinity);
        scene.input.mouse.disableContextMenu();
    }

    /**
     * @returns
     * @memberof Link
     */
    createBullet() {
        let bullet = this.scene.physics.add.sprite(-100, -100, 'base_powerup_link');
        bullet.body.allowGravity = false;
        bullet.body.setSize(10, 10, true);
        bullet.body.setImmovable();
        bullet.disableBody(true, true);

        return bullet;
    }

    /**
     * @returns
     * @memberof Link
     */
    isReady() {
        return this.cooldown <= 0 && !this.active && this.scene.input.activePointer.rightButtonDown();
    }

    /**
     * @memberof Link
     */
    trigger() {
        if (this.targets.length !== this.maxLinks) {
            super.trigger();
        }
        else {
            this.targets.forEach((tar) => {
                tar.getData('tile').unapplyAbility(this.key);
            });
            this.targets = [];
        }
    }

    /**
     * @memberof Link
     */
    handleBulletCollide = (bulletSprite, levelSprite) => {
        let tile = levelSprite.getData('tile');
        if (tile.collides) {
            // Destroy the bullet
            this.disable();

            // Add the sprite as a target
            this.targets.push(levelSprite);
            tile.applyAbility(this.key);
        }
    }

    /**
     * @param {*} delta
     * @memberof Link
     */
    update(delta) {
        super.update(delta);
        this.updateTargetBorders();
    }

    /**
     * @memberof Link
     */
    updateTargetBorders() {
        this.graphics.clear();
        this.graphics.lineStyle(2, 0x00ff00, 0.5);
        this.targets.forEach((tar, i) => {
            this.graphics.strokeRect(tar.x - tar.width/2, tar.y - tar.height/2, tar.displayWidth-1, tar.displayHeight-1);
            if (i > 0) {
                let prevTar = this.targets[i-1];
                this.graphics.lineBetween(tar.x, tar.y, prevTar.x, prevTar.y);
            }
        });
    }
}