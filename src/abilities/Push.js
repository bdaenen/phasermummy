import Ability from './Ability'
import Link from './Link'

export default class Push extends Ability {
    static key = 'push'
    speed = 400
    pushDistance = 2
    maxDistanceToLive = 1000
    distanceToLive = 1000
    bulletSprite = null
    active = false
    wallSprites = []

    constructor(scene) {
        super(scene)
        this.bulletSprite = this.createBullet()
        this.scene.middleGroup.add(this.bulletSprite)
        this.scene.events.on('level.destroy', this.destroySprites, this)
    }

    createBullet() {
        let bullet = this.scene.physics.add.sprite(
            -100,
            -100,
            'base_powerup_push'
        )
        bullet.body.allowGravity = false
        bullet.body.setSize(10, 10, true)
        bullet.body.setImmovable()
        bullet.disableBody(true, true)

        return bullet
    }

    trigger() {
        this.active = true
        this.distanceToLive = this.maxDistanceToLive
        let pointer = this.scene.input.activePointer
        let player = this.sprite
        let angle = Math.atan2(pointer.y - player.y, pointer.x - player.x)

        this.bulletSprite.enableBody(true, player.x, player.y, true, true)
        this.bulletSprite.body.setVelocityX(Math.cos(angle) * this.speed)
        this.bulletSprite.body.setVelocityY(Math.sin(angle) * this.speed)

        return true
    }

    disable() {
        this.active = false
        this.bulletSprite.disableBody(true, true)
    }

    isReady() {
        return (
            super.isReady() &&
            !this.active &&
            this.scene.input.activePointer.isDown &&
            this.scene.input.activePointer.button === 0
        )
    }

    destroySprites() {
        this.disable()
        this.wallSprites.forEach((sprite) => {
            sprite.destroy()
        })

        this.wallSprites = []
    }

    update(delta) {
        super.update(delta)

        if (!this.active) {
            return
        }

        this.scene.physics.world.overlap(
            this.bulletSprite,
            this.scene.currentLevel.getLayer('Walls').tilemapLayer,
            this.handleBulletTilemapCollide
        )

        this.scene.physics.world.overlap(
            this.bulletSprite,
            this.scene.levelObjects
        )

        this.distanceToLive -=
            this.bulletSprite.body.deltaAbsX() +
            this.bulletSprite.body.deltaAbsY()
        if (this.distanceToLive <= 0) {
            this.disable()
        }
    }

    handleBulletTilemapCollide = (bulletSprite, tile) => {
        const {
            properties: { pushable, linkable, collides },
            pixelX,
            pixelY,
            tileset,
            index,
        } = tile
        if (pushable) {
            const { x: texX, y: texY } = tileset.getTileTextureCoordinates(
                index
            )
            this.scene.currentLevel
                .getLayer('Walls')
                .tilemapLayer.removeTileAt(tile.x, tile.y)
            let newSprite = this.scene.physics.add.sprite(
                pixelX + tileset.tileWidth,
                pixelY + tileset.tileHeight,
                `${tileset.image.key}Sprite`,
                index - tileset.firstgid
            )
            newSprite.body.allowGravity = false
            newSprite.setDrag(2300, 2300)
            newSprite.setImmovable(true)
            this.scene.middleGroup.add(newSprite)

            this.scene.physics.add.overlap(
                this.bulletSprite,
                newSprite,
                (bulletSprite, newSprite) => {
                    this.handleBulletSpriteCollide(bulletSprite, newSprite)
                }
            )

            this.scene.physics.add.collider(this.scene.igor, newSprite)
        }
    }

    handleBulletSpriteCollide = (bulletSprite, sprite) => {
        let targets
        let movement = bulletSprite.body.velocity.clone().normalize()
        let abilityData = this.sprite.getData('abilityData')

        //if (linkable && abilityData[Link.key]?.linkedTiles?.length) {
        //                targets = abilityData[Link.key].linkedTiles;
        //          } else {
        targets = [sprite]
        //          }

        targets.forEach((sprite) => {
            // This can't work as the tile doesn't seem to have a body... :(
            sprite.body.velocity.x = bulletSprite.body.velocity.x
            sprite.body.velocity.y = bulletSprite.body.velocity.y
        })

        this.disable()
    }
}
