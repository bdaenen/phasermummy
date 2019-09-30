export default class Ability {
    static key = '';
    key = this.constructor.key;
    cooldownTime = 500;
    cooldown = 500;
    sprite = null;

    constructor(scene) {
        this.scene = scene;
    }

    addToSprite(sprite) {
        this.sprite = sprite;
        let abilities = sprite.getData('abilities');

        if (!abilities) {
            console.warn('This entity has no ability data, thus it cannot get an ability!');
            return null;
        }

        console.log(this);
        abilities[this.key] = this;
        sprite.setData('abilities', abilities);
    }

    trigger() {
    }

    isReady() {
        if (this.cooldown <= 0) {
            return true;
        }

        return false;
    }

    update(delta) {
        this.cooldown -= delta;

        if (this.isReady()) {
            this.trigger();
            this.cooldown = this.cooldownTime;
        }
    }
}
