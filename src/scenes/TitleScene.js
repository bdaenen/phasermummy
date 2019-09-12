class TitleScene extends Phaser.Scene {
    constructor(test) {
        super({
            key: 'TitleScene'
        });
    }
    preload() {
        this.load.image('intro', 'assets/images/intro.png');
    }
    create() {
        let gameWidth = this.sys.game.config.width;
        let gameHeight = this.sys.game.config.height;
        this.title = this.add.sprite(gameWidth / 2, gameHeight / 2, 'intro');
        this.scene.bringToTop();

        let sh = window.screen.availHeight;
        let sw = window.screen.availWidth;

        // let ch = 0;
        // let cw = 0;
        let multiplier = 1;
        if (sh / sw > 0.6) {
            // Portrait, fit width
            multiplier = sw / gameWidth;
        } else {
            multiplier = sh / gameHeight;
        }
        multiplier = Math.floor(multiplier);
        let el = document.getElementsByTagName('canvas')[0];
        el.style.width = gameWidth * multiplier + 'px';
        el.style.height = gameHeight * multiplier + 'px';

        // this.pressX = this.add.bitmapText(16 * 8 + 4, 8 * 16, 'font', 'PRESS X TO START', 8);
        // this.blink = 1000;

        // this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        this.input.on('pointerdown', () => {
            this.startGame();
        });

        // Ensure we fill the window.
        this.scale.refresh();
    }

    update(time, delta) {
        // this.blink -= delta;
        // if (this.blink < 0) {
        //     this.pressX.alpha = this.pressX.alpha === 1 ? 0 : 1;
        //     this.blink = 500;
        // }

        // if (this.startKey.isDown) {
        //     this.startGame();
        // }
    }

    startGame() {
        this.scene.start('GameScene');
    }
}

export default TitleScene;
