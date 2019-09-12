// An emitter for bricks when blocks are destroyed.
        /*this.blockEmitter = this.add.particles('mario-sprites');

        this.blockEmitter.createEmitter({
            frame: {
                frames: ['brick'],
                cycle: true
            },
            gravityY: 1000,
            lifespan: 2000,
            speed: 400,
            angle: {
                min: -90 - 25,
                max: -45 - 25
            },
            frequency: -1
        });*/



        // Add and play the music
        // this.music = this.sound.add('overworld');
        // this.music.play({
        //     loop: true
        // });

        // Set collision by property
        /*this.groundLayer.setCollisionByProperty({
            collide: true
        });*/

    // This group contains all enemies for collision and calling update-methods
    //    this.enemyGroup = this.add.group();


    // Populate enemyGroup, powerUps, pipes and destinations from object layers
    //this.parseObjectLayers();

    parseObjectLayers() {
        // The map has one object layer with enemies as stamped tiles,
        // each tile has properties containing info on what enemy it represents.
        this.map.getObjectLayer('enemies').objects.forEach(
            (enemy) => {
                let enemyObject;
                switch (this.tileset.tileProperties[enemy.gid - 1].name) {
                    case 'goomba':
                        enemyObject = new Goomba({
                            scene: this,
                            key: 'sprites16',
                            x: enemy.x,
                            y: enemy.y
                        });
                        break;
                    case 'turtle':
                        enemyObject = new Turtle({
                            scene: this,
                            key: 'mario-sprites',
                            x: enemy.x,
                            y: enemy.y
                        });
                        break;
                    default:
                        console.error('Unknown:', this.tileset.tileProperties[enemy.gid - 1]); // eslint-disable-line no-console
                        break;
                }
                this.enemyGroup.add(enemyObject);
            }
        );

        // The map has an object layer with 'modifiers' that do 'stuff', see below
        this.map.getObjectLayer('modifiers').objects.forEach((modifier) => {
            let tile, properties, type;

            // Get property stuff from the tile if present or just from the object layer directly
            if (typeof modifier.gid !== 'undefined') {
                properties = this.tileset.tileProperties[modifier.gid - 1];
                type = properties.type;
                if (properties.hasOwnProperty('powerUp')) {
                    type = 'powerUp';
                }
            } else {
                type = modifier.properties.type;
            }

            switch (type) {
                case 'powerUp':
                    // Modifies a questionmark below the modifier to contain something else than the default (coin)
                    tile = this.groundLayer.getTileAt(modifier.x / 16, modifier.y / 16 - 1);
                    tile.powerUp = properties.powerUp;
                    tile.properties.callback = 'questionMark';
                    if (!tile.collides) {
                        // Hidden block without a question mark
                        tile.setCollision(false, false, false, true);
                    }
                    break;
                case 'pipe':
                    // Adds info on where to go from a pipe under the modifier
                    tile = this.groundLayer.getTileAt(modifier.x / 16, modifier.y / 16);
                    tile.properties.dest = parseInt(modifier.properties.goto);
                    break;
                case 'dest':
                    // Adds a destination so that a pipe can find it
                    this.destinations[modifier.properties.id] = {
                        x: modifier.x + modifier.width / 2,
                        top: (modifier.y < 16)
                    };
                    break;
                case 'room':
                    // Adds a 'room' that is just info on bounds so that we can add sections below pipes
                    // in an level just using one tilemap.
                    this.rooms.push({
                        x: modifier.x,
                        width: modifier.width,
                        sky: modifier.properties.sky
                    });
                    break;
            }
        });
    }

    createHUD() {
        const hud = this.add.bitmapText(5 * 8, 8, 'font', 'MARIO                      TIME', 8);
        hud.setScrollFactor(0, 0);
        this.levelTimer = {
            textObject: this.add.bitmapText(36 * 8, 16, 'font', '255', 8),
            time: 150 * 1000,
            displayedTime: 255,
            hurry: false
        };
        this.levelTimer.textObject.setScrollFactor(0, 0);
        this.score = {
            pts: 0,
            textObject: this.add.bitmapText(5 * 8, 16, 'font', '000000', 8)
        };
        this.score.textObject.setScrollFactor(0, 0);

        if (this.attractMode) {
            hud.alpha = 0;
            this.levelTimer.textObject.alpha = 0;
            this.score.textObject.alpha = 0;
        }
    }

    updateScore(score) {
        this.score.pts += score;
        this.score.textObject.setText(('' + this.score.pts).padStart(6, '0'));
    }

    tileCollision(sprite, tile) {
        if (sprite.type === 'turtle') {
            if (tile.y > Math.round(sprite.y / 16)) {
                // Turtles ignore the ground
                return;
            }
        } else if (sprite.type === 'mario') {
            // Mario is bending on a pipe that leads somewhere:
            if (sprite.bending && tile.properties.pipe && tile.properties.dest) {
                sprite.enterPipe(tile.properties.dest, tile.rotation);
            }
        }

        // If it's Mario and the body isn't blocked up it can't hit question marks or break bricks
        // Otherwise Mario will break bricks he touch from the side while moving up.
        if (sprite.type === 'mario' && !sprite.body.blocked.up) {
            return;
        }

        // If the tile has a callback, lets fire it
        if (tile.properties.callback) {
            switch (tile.properties.callback) {
                case 'questionMark':
                    // Shift to a metallic block
                    tile.index = 44;

                    // Bounce it a bit
                    sprite.scene.bounceTile.restart(tile);

                    // The questionmark is no more
                    tile.properties.callback = null;

                    // Invincible blocks are only collidable from above, but everywhere once revealed
                    tile.setCollision(true);

                    // Check powerUp for what to do, make a coin if not defined
                    let powerUp = tile.powerUp ? tile.powerUp : 'coin';

                    // Make powerUp (including a coin)
                    (() => new PowerUp({
                        scene: sprite.scene,
                        key: 'sprites16',
                        x: tile.x * 16 + 8,
                        y: tile.y * 16 - 8,
                        type: powerUp
                    }))();

                    break;
                case 'breakable':
                    if (sprite.type === 'mario' && sprite.animSuffix === '') {
                        // Can't break it anyway. Bounce it a bit.
                        sprite.scene.bounceTile.restart(tile);
                        sprite.scene.sound.playAudioSprite('sfx', 'smb_bump');
                    } else {
                        // get points
                        sprite.scene.updateScore(50);
                        sprite.scene.map.removeTileAt(tile.x, tile.y, true, true, this.groundLayer);
                        sprite.scene.sound.playAudioSprite('sfx', 'smb_breakblock');
                        sprite.scene.blockEmitter.emitParticle(6, tile.x * 16, tile.y * 16);
                    }
                    break;
                case 'toggle16bit':
                    sprite.scene.eightBit = !sprite.scene.eightBit;
                    if (sprite.scene.eightBit) {
                        sprite.scene.tileset.setImage(sprite.scene.sys.textures.get('tiles'));
                    } else {
                        sprite.scene.tileset.setImage(sprite.scene.sys.textures.get('tiles-16bit'));
                    }
                    break;
                default:
                    sprite.scene.sound.playAudioSprite('sfx', 'smb_bump');
                    break;
            }
        } else {
            sprite.scene.sound.playAudioSprite('sfx', 'smb_bump');
        }
    }