import Push from './Push'

/**
 * @export
 * @class Link
 * @extends {Push}
 */
export default class Link extends Push {
    static key = 'link'
    targets = []
    minLinks = 2
    maxLinks = 3
    graphics = null

    /**
     *Creates an instance of Link.
     * @param {*} scene
     * @memberof Link
     */
    constructor(scene) {
        super(scene)
        this.graphics = scene.add.graphics()
        this.graphics.setDepth(Infinity)
        scene.input.mouse.disableContextMenu()
        scene.events.on('level.destroy', this.handleLevelDestruction, this)
        this.keySpace = scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        )
    }

    /**
     * @returns
     * @memberof Link
     */
    createBullet() {
        let bullet = this.scene.physics.add.sprite(
            -100,
            -100,
            'base_powerup_link'
        )
        bullet.body.allowGravity = false
        bullet.body.setSize(10, 10, true)
        bullet.body.setImmovable()
        bullet.disableBody(true, true)

        return bullet
    }

    /**
     * @returns
     * @memberof Link
     */
    isReady() {
        return (
            this.cooldown <= 0 &&
            !this.active &&
            this.scene.input.activePointer.rightButtonDown()
        )
    }

    /**
     * @memberof Link
     */
    trigger() {
        if (this.targets.length !== this.maxLinks) {
            super.trigger()
        } else {
            this.clearLinks()
        }
    }

    clearLinks() {
        this.targets.forEach((target) => {
            // Clear the visual effect
        })
        this.targets = []
    }

    /**
     * @memberof Link
     */
    handleBulletCollide = (bulletSprite, tile) => {
        const { pushable, linkable, collides } = tile.properties
        if (collides) {
            // Destroy the bullet
            this.disable()

            // Add the sprite as a target
            if (linkable && !this.targets.includes(tile)) {
                this.targets.push(tile)
                let data = this.sprite.getData('abilityData')[Link.key]
                data.linkedTiles = this.targets
                this.sprite.setData('abilityData', data)
                // Add the visual effect
            }
        }
    }

    /**
     *
     */
    handleLevelDestruction() {
        this.clearLinks()
    }

    /**
     * @param {*} delta
     * @memberof Link
     */
    update(delta) {
        super.update(delta)
        if (this.keySpace.isDown) {
            this.clearLinks()
        }
        this.updateTargetBorders()
    }

    /**
     * @memberof Link
     */
    updateTargetBorders() {
        this.graphics.clear()
        this.graphics.lineStyle(2, 0x00ff00, 0.5)
        this.targets.forEach((tar, i) => {
            this.graphics.strokeRect(
                tar.x - tar.width / 2,
                tar.y - tar.height / 2,
                tar.displayWidth - 1,
                tar.displayHeight - 1
            )
            if (i > 0) {
                let prevTar = this.targets[i - 1]
                this.graphics.lineBetween(tar.x, tar.y, prevTar.x, prevTar.y)
            }
        })
    }
}
