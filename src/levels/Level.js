import * as Tiles from '../sprites/tiles';

export default class Level {
    x = null;
    y = null;

    /**
     * Contains the integers representing the level data.
     * @memberof Level
     */
    map = [];
    width = 36;
    height = 20;
    tileWidth = 20;
    tileHeight = 20;
    spriteMap = [];
    tileMap = [];
    destructables = [];
    tileset = 'base';
    indexSpriteMap = {
        1: Tiles.Wall,
        2: Tiles.WallHard,
        3: Tiles.WallDestructable,
        4: Tiles.Spike,
        5: Tiles.WallKey,
        6: Tiles.Key,
        7: Tiles.Portal,
        13: Tiles.Switch,
        // Should only be a wall after switches were pressed.
        // Just make a different level?
        8: Tiles.Wall,
        9: Tiles.PowerupPush,
        10: Tiles.PowerupLink,
        11: Tiles.PowerupSprint,
        12: Tiles.PowerupTime
    }

    constructor(scene) {
        this.scene = scene;
    }

    preload(makePromise = false) {
        let returnVal;
        let preloader = this.scene.load;
        preloader.image(`${this.tileset}_background`, `assets/images/${this.tileset}/bg.png`);

        Object.keys(this.indexSpriteMap).forEach((index, i, arr) => {
            preloader.image(`${this.tileset}_${this.indexSpriteMap[index].spriteKey}`, `assets/images/${this.tileset}/${this.indexSpriteMap[index].spriteKey}.png`);
        });

        if (makePromise) {
            returnVal = new Promise(function(resolve){
                preloader.once('complete', function() {
                    console.log(preloader.isReady());
                    resolve();
                });
            });
        }

        if (!preloader.isLoading()) {
            preloader.start();
        }

        return returnVal;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @memberof Level
     */
    getAt = (x, y) => {
        x = Math.floor(x/this.tileWidth);
        y = Math.floor(y/this.tileHeight);
        return this.getAtTile(x, y);
    };

    /**
     * @param {integer} x
     * @param {integer} y
     * @returns {number}
     */
    getAtTile = (x, y) => {
        return this.map[this.indexFromTileXY(x, y)];
    };

    /**
     * @param {integer} x
     * @param {integer} y
     * @returns {number}
     */
    indexFromTileXY = (x, y) => {
        return x+(y*this.width);
    };

    /**
     * @memberof Level
     */
    getSpriteClassForIndex = (index) => {
        return this.indexSpriteMap[index];
    };

    getBackgroundTile = () => {
        return `${this.tileset}_background`;
    }

    destroy = () => {
        this.indexSpriteMap = null;
        this.tileMap = null;
        this.destructables = null;
        this.spriteMap = null;
    }

    getTilesAffectedBy = (abilityKey) => {
        return this.tileMap.filter((tile) => {
            return tile.isAffectedBy(abilityKey);
        });
    }
}

/*level1.findFirstIndex = function(index, startX, startY, direction) {
    startX = startX || 0;
    startY = startY || 0;
    direction = 1 || -1;

    for (var x = startX; x < this.width; x+=direction) {
        for (var y = startY; y < this.height; y+=direction) {
            if (this.getAtTile(x, y) === index) {
                return this.indexFromTileXY(x, y);
            }
        }
    }
};
*/