import * as Phaser from 'phaser';
import ItemSlot from "./ItemSlot";
import GameScene from "../scenes/game-scene";
import {Entity} from "../engine/Entity";


export default class ItemTile extends Phaser.GameObjects.Image {
    public type = "ItemTile"
    public slot: ItemSlot | undefined = undefined
    public entity: Entity
    private tileSize: number
    public readonly id: string

    constructor(scene: GameScene, entity: Entity, tileSize: number) {
        super(scene, entity.x * tileSize, entity.y * tileSize, scene.engine.itemDefinitions.get(entity.itemDefinitionId)?.imageKey)
        this.tileSize = tileSize
        this.entity = entity

        this.setDisplaySize(tileSize, tileSize)
        this.setInteractive()
        this.scene.add.existing(this);

        this.entity.onUpdate = this.update.bind(this)
        this.entity.onDestroy = this.destroy.bind(this, false)


        this.on('drag', this.handleDrag)
        this.on('drop', this.handleDrop, this)
        this.on('dragend', this.handleDragEnd, this)
        this.update()
    }

    public update() {
        let itemDef = (this.scene as GameScene).engine.itemDefinitions.get(this.entity.itemDefinitionId)
        this.setTexture(itemDef.imageKey)


        this.scene?.tweens.add({
            targets: this,
            x: this.entity.x * this.tileSize,
            y: this.entity.y * this.tileSize,
            ease: 'Power1',
            duration: 100
        })


    }


    public handleDrag(_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
        this.scene.children.bringToTop(this);

        this.scene.registry.set("dragging", true)
        this.x = dragX;
        this.y = dragY;
    }

    public handleDragEnd() {
        this.scene.registry.set("dragging", false)
        console.log("drag end")
        this.update()
    }

    public handleDrop(pointer: Phaser.Input.Pointer, dropZone: Phaser.GameObjects.GameObject) {
        console.log("drop")

        this.scene.registry.set("dragging", false)

        console.log("drop!!", pointer, dropZone);

        if (dropZone.parentContainer?.type == ItemSlot.TYPE) {
            if (this.slot) {
                this.slot.removedItem(this)
            }
            (dropZone.parentContainer as ItemSlot)?.droppedItem(this);
        }

        if (!dropZone) {
            this.update()
        }
    }


}