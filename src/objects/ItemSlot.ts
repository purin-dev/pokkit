import * as Phaser from 'phaser';
import ItemTile from "./ItemTile";
import GameScene from "../scenes/game-scene";

export default class ItemSlot extends Phaser.GameObjects.Container {

    static TYPE = "ItemSlot"
    public type = ItemSlot.TYPE

    private gameX: number
    private gameY: number
    private dropZone: Phaser.GameObjects.Zone
    private graphics: Phaser.GameObjects.Graphics;
    private showOutline = false;

    constructor(scene: GameScene, x: number, y: number, h: number, w: number, gameX: number, gameY: number) {
        super(scene, x, y, [])
        this.width = w
        this.height = h
        this.setDepth(-1)

        this.dropZone = new Phaser.GameObjects.Zone(this.scene, 0, 0, h, w)
        this.dropZone.setRectangleDropZone(h, w)
        this.add(this.dropZone)

        this.gameX = gameX
        this.gameY = gameY
        this.scene.add.existing(this)

    }

    public toggleOutline() {
        if (!this.graphics) {
            this.graphics = this.scene.add.graphics({
                lineStyle: {width: 2, color: 0xffff00, alpha: 0.5}
            })

        }
        if (this.showOutline) {
            this.graphics.clear()
            this.showOutline = false;
        } else {
            this.graphics.strokeRect(this.x - this.width / 2, this.y - this.dropZone.input.hitArea.height / 2, this.dropZone.input.hitArea.width, this.dropZone.input.hitArea.height)
            this.showOutline = true;
        }

    }

    public droppedItem(item: ItemTile) {
        console.log("hi from drop zone! {}", item)

        item.slot = this;

        this.scene.events.emit("item_dropped", {
            oldPos: {x: item.entity.x, y: item.entity.y},
            newPos: {x: this.gameX, y: this.gameY}
        })

    }

    public removedItem(item: ItemTile) {
        console.log("bye from drop zone! {}", item)
        item.slot = undefined;
    }


}