import * as Phaser from 'phaser';
import ItemSlot from "./ItemSlot";
import GameScene from "../scenes/game-scene";
import {ItemInstance} from "../engine/ItemInstance";
import DeepCopy = Phaser.Utils.Objects.DeepCopy;


export default class ItemTile extends Phaser.GameObjects.Image {
    public type = "ItemTile"
    public slot: ItemSlot | undefined = undefined
    public itemInstance: ItemInstance
    private lastSnapshot: ItemInstance
    private tileSize: number
    public readonly id: string

    constructor(scene: GameScene, x: number, y: number, instance: ItemInstance, tileSize: number) {
        //todo: get def from instance
        super(scene, x, y, scene.engine.itemDefinitions.get(instance.itemDefinitionId)?.imageKey)

        this.setDisplaySize(tileSize, tileSize)
        this.setInteractive()
        this.scene.add.existing(this);
        this.itemInstance = instance
        this.lastSnapshot = DeepCopy(instance) as ItemInstance


        this.tileSize = tileSize
        this.on('drag', this.handleDrag)
        this.on('drop', this.handleDrop, this)
        this.on('dragend', this.handleDragEnd, this)


    }

    public update() {
        if (this.lastSnapshot.itemDefinitionId != this.itemInstance.itemDefinitionId) {
            let itemDef = (this.scene as GameScene).engine.itemDefinitions.get(this.itemInstance.itemDefinitionId)
            this.setTexture(itemDef.imageKey)
        }

        this.scene?.tweens.add({
            targets: this,
            x: this.itemInstance.x * this.tileSize,
            y: this.itemInstance.y * this.tileSize,
            ease: 'Power1',
            duration: 100
        })


        this.itemInstance.dirty = false
        console.log("refreshed", this.itemInstance, this.lastSnapshot)

        this.lastSnapshot = DeepCopy(this.itemInstance) as ItemInstance

    }


    public handleDrag(_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
        this.scene.children.bringToTop(this);

        this.scene.registry.set("dragging", true)
        this.x = dragX;
        this.y = dragY;
    }

    public handleDragEnd() {
        this.scene.registry.set("dragging", false)

    }

    public handleDrop(pointer: Phaser.Input.Pointer, dropZone: Phaser.GameObjects.GameObject) {
        this.scene.registry.set("dragging", false)

        console.log("drop!!", pointer, dropZone);

        if (dropZone.parentContainer?.type == ItemSlot.TYPE) {
            if (this.slot) {
                this.slot.removedItem(this)
            }
            (dropZone.parentContainer as ItemSlot)?.droppedItem(this);
        }

    }


}