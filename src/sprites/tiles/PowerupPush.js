import BaseTile from './BaseTile';
import Push from '../../abilities/Push';

export default class PowerupPush extends BaseTile {
    static spriteKey = 'powerup_push';
    collides = false;

    onOverlap = (sprite, tile) => {
        console.log(sprite);
        let push = new Push(sprite.scene, sprite);
        push.addToSprite(sprite);
        this.disable();
        this.destroy();
    }

    disable() {
        this.sprite.setActive(false);
        this.sprite.setVisible(false);
    }
}
