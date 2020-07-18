import Link from '../abilities/Link'
export default class Igor extends Phaser.GameObjects.Sprite {
    static preload(preloader) {
        preloader.image('igor', 'assets/images/igor.png')
    }
    constructor(config) {
        super(config.scene, config.x, config.y, 'igor')
        config.scene.physics.world.enable(this)
        config.scene.add.existing(this)
        this.setDataEnabled()
        this.setData('abilities', {})
        this.setData('abilityData', {})
        this.acceleration = 2000
        this.body.maxVelocity.x = 120
        this.body.maxVelocity.y = 400
        this.body.setDrag(3000, 0)
        this.body.setSize(8, 15, true)
        this.body.setOffset(this.body.offset.x, 6)
        this.body.setMass(100)
        this.wasHurt = -1
        this.flashToggle = false
        this.enteringPipe = false
        this.anims.play('stand')
        this.alive = true
        this.type = 'igor'
        this.jumpTimer = 0
        this.jumpCooldown = 100
        this.jumping = false
        this.fireCoolDown = 0
        this.touching = { left: false, right: false }
        this.standingOnLinkedTile = false

        this.sensors = [
            this.createSensor({ x: -4, y: 0 }),
            this.createSensor({ x: 8, y: 0 }),
        ]

        this.on(
            'animationcomplete',
            () => {
                if (
                    this.anims.currentAnim.key === 'grow' ||
                    this.anims.currentAnim.key === 's(hrink'
                ) {
                    this.scene.physics.world.resume()
                }
            },
            this
        )

        this.scene.events.on('preupdate', this.preupdate, this)
        this.scene.events.on('update', this.update, this)
    }

    preupdate() {
        if (this.scene.currentLevel) {
            this.touching.left = this.scene.physics.overlap(
                this.sensors[0],
                this.scene.currentLevel.spriteMap,
                undefined,
                (a, b) => {
                    let tile = b.data && b.data.get('tile')
                    return tile && tile.collides
                }
            )
            this.touching.right = this.scene.physics.overlap(
                this.sensors[1],
                this.scene.currentLevel.spriteMap,
                undefined,
                (a, b) => {
                    let tile = b.data && b.data.get('tile')
                    return tile && tile.collides
                }
            )
        }
    }

    createSensor(offset) {
        let sensor = this.scene.physics.add.image()
        sensor.body.setSize(4, 10)
        sensor.setDebugBodyColor(0x0055ff)
        sensor.body.setOffset(
            offset.x + this.width / 2,
            offset.y + this.height / 2
        )
        sensor.body.setAllowGravity(false)
        sensor.setPosition(this.x, this.y)

        return sensor
    }

    onCollide = (tile) => {
        if (tile.isAffectedBy(Link.key) && tile.sprite.y > this.y) {
            this.body.setGravityY(10000)
        }
    }

    onSensorCollide = (sensor, sprite) => {
        let tile = sprite.data && sprite.getData('tile')

        if (!tile) {
            return
        }

        if (tile.collides) {
            // Left
            if (sensor === this.sensors[0]) {
                this.touching.left = true
            }

            // Right
            if (sensor === this.sensors[1]) {
                this.touching.right = true
            }
        }
    }

    update(time, delta) {
        let abilities = this.getData('abilities')
        Object.keys(this.getData('abilities')).forEach(function (abilityKey) {
            abilities[abilityKey].update(delta)
        }, this)

        if (!this.body.touching.down) {
            this.body.setGravityY(0)
        }

        this.fireCoolDown -= delta

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
        // this.angle++
        //  console.log(this.body.velocity.y);
        if (this.body.velocity.y > 0) {
            this.hasFalled = true
        }

        this.jumpTimer -= delta

        if (this.isControllable) {
            let input = {
                left: this.controls.left.isDown(),
                right: this.controls.right.isDown(),
                up: this.controls.up.isDown(),
                down: this.controls.down.isDown(),
                jump: this.controls.jump.isDown(),
            }

            if (input.left && !this.touching.left) {
                if (this.body.velocity.y === 0) {
                    this.run(-this.acceleration)
                } else {
                    this.run(-this.acceleration / 3)
                }
                this.flipX = true
            } else if (input.right && !this.touching.right) {
                if (this.body.velocity.y === 0) {
                    this.run(this.acceleration)
                } else {
                    this.run(this.acceleration / 3)
                }
                this.flipX = false
            } else if (this.body.blocked.down) {
                // Stop moving if we're grounded
                if (Math.abs(this.body.velocity.x) < 10) {
                    this.body.setVelocityX(0)
                    this.run(0)
                } else {
                    this.run(
                        ((this.body.velocity.x > 0 ? -1 : 1) *
                            this.acceleration) /
                            2
                    )
                }
            } else if (!this.body.blocked.down) {
                // In the air, just set the x accel to 0
                this.run(0)
            }

            if (input.jump && !this.jumping && this.jumpTimer < 0) {
                this.jump()
            } else if (!input.jump) {
                this.jumpTimer = -1 // Don't resume jump if button is released, prevents mini double-jumps
                if (this.body.blocked.down) {
                    this.jumping = false
                }
            }
        }

        if (this.body.velocity.y === 0 && this.jumping) {
            this.jumping = false
            this.jumpTimer = this.jumpCooldown
        }

        if (this.touching.left || this.touching.right) {
            this.body.setVelocityX(0)
        }

        this.sensors.forEach((sensor) => {
            sensor.setPosition(this.x, this.y)
        })
    }

    run(vel) {
        this.body.setAccelerationX(vel)
    }

    jump() {
        if (this.jumping) {
            return
        }
        if (!this.jumping) {
            this.body.setGravityY(0)
            //this.scene.sound.playAudioSprite('sfx', 'smb_jump-small');
        }

        if (this.body.velocity.y === 0) {
            this.body.setVelocityY(-555)
        }

        this.jumping = true
    }

    hurtBy(enemy) {
        if (!this.alive) {
            return
        }
        if (this.wasHurt < 1) {
            if (this.animSuffix !== '') {
                this.resize(false)
                this.scene.sound.playAudioSprite('sfx', 'smb_pipe')

                this.wasHurt = 2000
            } else {
                this.die()
            }
        }
    }

    die() {
        this.scene.music.pause()
        this.play('death')
        this.scene.sound.playAudioSprite('sfx', 'smb_mariodie')
        this.body.setAcceleration(0)
        this.body.setVelocity(0, -300)
        this.alive = false
    }

    destroy() {
        let abilities = this.getData('abilities')
        Object.keys(abilities).forEach(function (key) {
            abilities[key].destroy()
        })
        this.setData('abilities', null)
        super.destroy()
    }
}
