import * as Phaser from 'phaser';
import GameScene from "./scenes/game-scene";



const config = {
    type: Phaser.AUTO,
    backgroundColor: '#071b25',
    pixelArt: true,
    scene: GameScene
};

//@ts-ignore
const game = new Phaser.Game(config);
