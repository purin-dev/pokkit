import GameScene from "./game-scene";

export default class UiScene extends Phaser.Scene {

    private tickTimer: Phaser.Time.TimerEvent


    private tickProgress: Phaser.GameObjects.NineSlice

    constructor() {
        super({key: 'UIScene', active: true});
    }

    preload() {
        this.load.atlas('ui', 'assets/ui/nine-slice.png', 'assets/ui/nine-slice.json');

    }

    create() {

        this.tickProgress = this.add.nineslice(0, 0, 'ui', 'ButtonOrangeFill1', 13, 39, 6, 6);

        this.tickProgress.setOrigin(0, 0.5);
        //  Our Text object to display the Score

        //  Grab a reference to the Game Scene
        console.log(this.scene.manager.keys)
        const ourGame = this.scene.get('MainScene') as GameScene;
        this.tickTimer = ourGame.tickTimer

    }


    update(time: number, delta: number) {
        super.update(time, delta);
        let progress = this.tickTimer?.getProgress()


        if (progress <= 0.07) {
            // Timer reset

            // Track current width
            let currentWidth = this.tickProgress.width;

            // Decrement width each frame until 0
            this.tickProgress.width = currentWidth - (currentWidth * delta / (this.tickTimer.delay * 0.03));


        } else {
            this.tickProgress.width = 228 * progress;
        }

    }
}