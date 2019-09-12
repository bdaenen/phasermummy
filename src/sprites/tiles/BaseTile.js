export default class BaseTile {
    static spriteKey = 'wall';
    allowGravity = false;
    immovable = true;
    sprite = null;
    pushable = false;
    collides = true;
    affectedBy = {};
    constructor(config) {
        if (this.collides) {
            this.sprite = config.scene.physics.add.sprite(
                config.x,
                config.y,
                `${config.tileset}_${this.constructor.spriteKey}`
            );
            this.sprite.body.setDrag(2300, 2300);
            if (this.immovable) {
                this.sprite.body.setImmovable();
            }
            this.sprite.body.allowGravity = this.allowGravity;
        }
        else {
            this.sprite = config.scene.add.sprite(
                config.x,
                config.y,
                `${config.tileset}_${this.constructor.spriteKey}`
            );
        }
        this.sprite.setDataEnabled();
        this.sprite.setData('tile', this);
    }
    destroy() {
        this.sprite.destroy();
    }
    applyAbility(key) {
        this.affectedBy[key] = true;
    }
    unapplyAbility(key) {
        delete this.affectedBy[key];
    }
    isAffectedBy(key) {
        return !!this.affectedBy[key];
    }
}