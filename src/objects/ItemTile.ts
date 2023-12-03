import * as Phaser from 'phaser';
import {Scene} from 'phaser';
import ItemSlot from "./ItemSlot";
import {Entity} from "../engine/Entity";
import ItemRegistry from "../engine/registries/ItemRegistry";


export default class ItemTile extends Phaser.GameObjects.Image {
    public type = "ItemTile"
    public slot: ItemSlot | undefined = undefined
    public entity: Entity
    private tileSize: number
    public readonly id: string

    constructor(scene: Scene, entity: Entity, tileSize: number) {
        super(scene, entity.x * tileSize, entity.y * tileSize, ItemRegistry.get(entity.itemDefinitionId)?.imageKey)
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
        let itemDef = ItemRegistry.get(this.entity.itemDefinitionId)
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
        this.update()
    }

    public handleDrop(_pointer: Phaser.Input.Pointer, dropZone: Phaser.GameObjects.GameObject) {
        this.scene.registry.set("dragging", false)

        if (dropZone.parentContainer?.type == ItemSlot.TYPE) {
            if (this.slot) {
                this.slot.removedItem(this)
            }
            (dropZone.parentContainer as ItemSlot)?.droppedItem(this);
        }
    }


}