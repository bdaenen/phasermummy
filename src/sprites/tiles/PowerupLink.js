import BaseTile from './BaseTile';
import Link from '../../abilities/Link';
import Push from '../../abilities/Push';

export default class PowerupLink extends BaseTile {
    static spriteKey = 'powerup_link';
    collides = false;

    onOverlap = (sprite, tile) => {
        let push = new Push(sprite.scene, sprite);
        push.addToSprite(sprite);

        let link = new Link(sprite.scene, sprite);
        link.addToSprite(sprite);
        this.disable();
        this.destroy();
        console.log(sprite);
    }

    disable() {
        this.sprite.setActive(false);
        this.sprite.setVisible(false);
    }
}