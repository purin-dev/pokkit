import * as Phaser from 'phaser';
import GameScene from "./scenes/game-scene";
import UiScene from "./scenes/ui-scene";


const config = {
    type: Phaser.AUTO,
    backgroundColor: '#071b25',
    pixelArt: true,
    scene: [GameScene, UiScene]
};

//@ts-ignore
const game = new Phaser.Game(config);
