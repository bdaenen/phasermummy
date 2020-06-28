export default class BaseTile {
    static spriteKey = 'wall';
    allowGravity = false;
    sprite = null;
    pushable = false;
    collides = true;
    affectedBy = null;
    constructor(config) {
        console.log(`${config.tileset}_${this.constructor.spriteKey}`
        );
        if (this.collides) {
            this.sprite = config.scene.matter.add.sprite(
                config.x,
                config.y,
                `${config.tileset}_${this.constructor.spriteKey}`
            );
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
        this.affectedBy = {};
    }
    destroy() {
        this.sprite.destroy();
        this.affectedBy = {};
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
