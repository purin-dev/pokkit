import * as Phaser from 'phaser';
import GameScene from "./scenes/game-scene";



const config = {
    type: Phaser.AUTO,
    backgroundColor: '#0a2b39',

    scene: GameScene
};

const game = new Phaser.Game(config);
