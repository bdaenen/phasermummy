// TODO: wrap a "map" abstraction around multiple levels.
// The level loader takes care of transitioning between levels on a map.
// The map loader takes care of loading entirely new maps.
/**
 * @export
 * @param {*} scene
 * @param {*} levelX
 * @param {*} levelY
 * @param {boolean} [transition=true]
 * @param {*} [transitionPosition=null]
 * @returns
 */
export default async function (
    scene,
    levelX,
    levelY,
    transition = true,
    transitionPosition = null
) {
    let level = null
    let previousLevel = scene.currentLevel
    import(`../../assets/levels/level${levelX}_${levelY}.json`).then(
        async (LevelClass) => {
            if (LevelClass.default) {
                LevelClass = LevelClass.default
            }

            level = new LevelClass(scene)
            level.preload(true).then(() => {
                console.log('loaded!')

                if (transition && !transitionPosition && previousLevel) {
                    transitionPosition = determineTransitionPosition(
                        scene.igor,
                        previousLevel,
                        level
                    )
                }

                if (previousLevel) {
                    destroyLevel(scene, previousLevel)
                }

                buildLevel(scene, level)

                if (transitionPosition) {
                    if (transitionPosition.x !== null) {
                        scene.igor.x = transitionPosition.x
                    }
                    if (transitionPosition.y !== null) {
                        scene.igor.y = transitionPosition.y
                    }
                }
                console.log(transitionPosition, scene.igor.x, scene.igor.y)

                resolve(level)
            })
        }
    )
}

/**
 * @param {*} scene
 * @param {*} level
 */
function buildLevel(scene, level) {
    scene.backgroundGroup.add(
        scene.add.tileSprite(
            scene.game.config.width / 2,
            scene.game.config.height / 2,
            scene.game.config.width,
            scene.game.config.height,
            level.getBackgroundTile()
        )
    )
    let tileset = level.tileset
    level.map.forEach((el, i) => {
        if (el === 0) {
            return
        }
        let x = level.tileWidth * (i % level.width) + level.tileWidth / 2
        let y =
            level.tileHeight * Math.floor(i / level.width) +
            level.tileHeight / 2
        let SpriteClass = level.getSpriteClassForIndex(el)
        let block = new SpriteClass({ scene, x, y, tileset })
        level.spriteMap.push(block.sprite)
        level.tileMap.push(block)
        scene.foregroundGroup.add(block.sprite)
    })

    // scene.levelGroup.setDepth(-level.spriteMap.length, 1);
}

/**
 * @param scene
 * @param level
 */
function destroyLevel(scene, level) {
    scene.events.emit('level.destroy')
    level.tileMap.forEach(function (block) {
        block.destroy()
    })
    level.destroy()
}

/**
 * @param {*} player
 * @param {*} levelFrom
 * @param {*} levelTo
 * @returns
 */
function determineTransitionPosition(player, levelFrom, levelTo) {
    var position = {
        x: null,
        y: null,
    }

    if (levelFrom.x < levelTo.x) {
        position.x = player.width / 2
    } else if (levelFrom.x > levelTo.x) {
        position.x = levelTo.width * levelTo.tileWidth
    } else if (levelFrom.y < levelTo.y) {
        position.y =
            levelTo.height * levelTo.tileHeight - levelTo.tileHeight * 2
    } else if (levelFrom.y > levelTo.y) {
        position.y = player.height / 2 + 1
    }

    return position
}
