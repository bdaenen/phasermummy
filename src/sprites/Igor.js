import Link from '../abilities/Link';
export default class Igor extends Phaser.GameObjects.Sprite {
    static preload(preloader) {
        preloader.image('igor', 'assets/images/igor.png')
    }
    constructor(config) {
        super(config.scene, config.x, config.y, 'igor');
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.setDataEnabled();
        this.setData('abilities', {});
        this.acceleration = 2000;
        this.body.maxVelocity.x = 120;
        this.body.maxVelocity.y = 400;
        this.body.setDrag(3000, 0);
        this.body.setSize(8, 15, true);
        this.body.setOffset(this.body.offset.x, 6);
        this.body.setMass(100);
        this.wasHurt = -1;
        this.flashToggle = false;
        this.enteringPipe = false;
        this.anims.play('stand');
        this.alive = true;
        this.type = 'igor';
        this.jumpTimer = 0;
        this.jumping = false;
        this.fireCoolDown = 0;
        this.standingOnLinkedTile = false;
        console.log(this.body);

        this.on('animationcomplete', () => {
            if (this.anims.currentAnim.key === 'grow' || this.anims.currentAnim.key === 's(hrink') {
                this.scene.physics.world.resume();
            }
        }, this);
    }
    
    onCollide = (tile) => {
        if (tile.isAffectedBy(Link.key) && tile.sprite.y > this.y) {
            this.body.setGravityY(10000);
        }
    }

    update(keys, delta) {
        let abilities = this.getData('abilities');
        Object.keys(this.getData('abilities')).forEach(function(abilityKey) {
            abilities[abilityKey].update(delta);
        }, this);

        if (!this.body.touching.down) {
            this.body.setGravityY(0);
        }

        this.fireCoolDown -= delta;

        // Just run callbacks when hitting something from below or trying to enter it
        // if (this.body.velocity.y < 0) {
        //     this.scene.physics.world.collide(this, this.scene.groundLayer, this.scene.tileCollision);
        // } else {
        //     this.scene.physics.world.collide(this, this.scene.groundLayer);
        // }

/*         if (this.wasHurt > 0) {
            this.wasHurt -= delta;
            this.flashToggle = !this.flashToggle;
            this.alpha = this.flashToggle ? 0.2 : 1;
            if (this.wasHurt <= 0) {
                this.alpha = 1;
            }
        } */

        let input = {
            left: keys.left.isDown,
            right: keys.right.isDown,
            down: keys.down.isDown,
            jump: keys.jump.isDown
        };

        // this.angle++
        //  console.log(this.body.velocity.y);
        if (this.body.velocity.y > 0) {
            this.hasFalled = true;
        }

        this.jumpTimer -= delta;

        if (input.left) {
            if (this.body.velocity.y === 0) {
                this.run(-this.acceleration);
            } else {
                this.run(-this.acceleration / 3);
            }
            this.flipX = true;
        } else if (input.right) {
            if (this.body.velocity.y === 0) {
                this.run(this.acceleration);
            } else {
                this.run(this.acceleration / 3);
            }
            this.flipX = false;
        } else if (this.body.blocked.down) {
            console.log('blocked down');
            if (Math.abs(this.body.velocity.x) < 10) {
                this.body.setVelocityX(0);
                this.run(0);
            } else {
                this.run(((this.body.velocity.x > 0) ? -1 : 1) * this.acceleration / 2);
            }
        } else if (!this.body.blocked.down) {
            this.run(0);
        }

        if (input.jump && (!this.jumping || this.jumpTimer > 0)) {
            this.jump();
        } else if (!input.jump) {
            this.jumpTimer = -1; // Don't resume jump if button is released, prevents mini double-jumps
            if (this.body.blocked.down) {
                this.jumping = false;
            }
        }

        let anim = null;
        if (this.body.velocity.y !== 0) {
            anim = 'jump';
        } else if (this.body.velocity.x !== 0) {
            anim = 'run';
        } else {
            anim = 'stand';
        }

        /* anim += this.animSuffix;
        if (this.anims.currentAnim.key !== anim && !this.scene.physics.world.isPaused) {
            this.anims.play(anim);
        } */

        this.physicsCheck = true;

        if (this.body.velocity.y === 0 && this.jumping) {
            this.jumping = false;
        }
    }

    run(vel) {
        this.body.setAccelerationX(vel);
    }

    jump() {
        if (this.jumping) {
            return;
        }
        if (!this.jumping) {
            this.body.setGravityY(0);
            //this.scene.sound.playAudioSprite('sfx', 'smb_jump-small');
        }
        
        if (this.body.velocity.y === 0) {
            this.body.setVelocityY(-555);
        }
        if (!this.jumping) {
            this.jumpTimer = 600;
        }
        this.jumping = true;
    }

    hurtBy(enemy) {
        if (!this.alive) {
            return;
        }
        if (this.wasHurt < 1) {
            if (this.animSuffix !== '') {
                this.resize(false);
                this.scene.sound.playAudioSprite('sfx', 'smb_pipe');

                this.wasHurt = 2000;
            } else {
                this.die();
            }
        }
    }

    die() {
        this.scene.music.pause();
        this.play('death');
        this.scene.sound.playAudioSprite('sfx', 'smb_mariodie');
        this.body.setAcceleration(0);
        this.body.setVelocity(0, -300);
        this.alive = false;
    }

    destroy() {
        let abilities = this.getData('abilities');
        Object.keys(abilities).forEach(function(key) {
            abilities[key].destroy();
        });
        this.setData('abilities', null);
        super.destroy();
    }
}
