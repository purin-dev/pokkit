import * as Phaser from 'phaser';
import ItemTile from "../objects/ItemTile";
import ItemSlot from "../objects/ItemSlot";
import PokkitEngine from "../engine/PokkitEngine";
import {Recipe} from "../model/Recipe";
import {ItemDefinition} from "../engine/ItemDefinition";
import {Events} from "../engine/Events";
import {Entity} from "../engine/Entity";

export default class GameScene extends Phaser.Scene {

    public engine: PokkitEngine
    public worldSize = 640;
    public tileSize = this.worldSize / 10;
    public slots: ItemSlot[][] = [[]]
    public items: ItemTile[] = []

    preload() {
        let itemDefs = new Map<String, ItemDefinition>()
        itemDefs.set("0_0", {
            id: "0_0", tick: (_i, e) => {
                console.log("i ticked!", e)
            }, name: "Acorn", imageKey: "tree_0"
        })
        itemDefs.set("0_1", {
            id: "0_1", tick: (_i, e) => {
                console.log("im a sapling and I ticked!", e)
            }, name: "Sapling", imageKey: "tree_1"
        })
        itemDefs.set("0_2", {
            id: "0_2", tick: (i, e) => {
                let freeSpace = e.getFreeSpaceAroundPoint({x: i.x, y: i.y})
                if (freeSpace) {
                    e.createItemAt("0_0", freeSpace.x, freeSpace.y)
                }
            }, name: "Tree", imageKey: "tree_2"
        })
        let recipes: Recipe[] = [
            {
                id: "0",
                name: "upgrade acorn",
                result: "0_1",
                ingredientId1: "0_0",
                ingredientId2: "0_0"
            },
            {
                id: "0",
                name: "upgrade sapling",
                result: "0_2",
                ingredientId1: "0_1",
                ingredientId2: "0_1"
            }
        ]
        this.engine = new PokkitEngine(this.worldSize / this.tileSize, itemDefs, recipes)
        this.load.pack('preload', './assets/assets.json', 'preload')
    }

    create() {

        for (let x = 0; x < this.worldSize / this.tileSize; x++) {
            for (let y = 0; y < this.worldSize / this.tileSize; y++) {
                if (!this.slots[x]) this.slots[x] = []
                this.slots[x][y] = new ItemSlot(this, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize, x, y)
            }
        }


        this.cameras.main.setBounds(-100, -100, this.worldSize + 100, this.worldSize + 100)
        let gKey = this.input.keyboard.addKey("G")
        gKey.on('up', () => {
            this.slots.forEach((x) => {
                x.forEach((s) => {
                    s.toggleOutline()
                })
            })
        })

        let tKey = this.input.keyboard.addKey("T")
        tKey.on('up', () => {
            this.engine.tick()
        })

        let rKey = this.input.keyboard.addKey("R")
        rKey.on('up', () => {
            this.engine.createItemAt("0_0", 0, 0)
        })

        this.events.on("item_dropped", (evt) => {
            this.engine.swapItems(evt.oldPos, evt.newPos)
        })

        this.engine.events.on(Events.CREATED_ITEM, (item: Entity) => {
            this.createObjectForEntity(item)
        })
    }

    createObjectForEntity(entity: Entity): ItemTile {
        let itemTile = new ItemTile(this, entity, this.tileSize)
        this.input.setDraggable(itemTile)
        this.items.push(itemTile)
        return itemTile
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        // Camera Panning
        if (this.input.activePointer.isDown && !this.registry.get("dragging")) {
            let ppos = (this.input.activePointer.prevPosition)
            let npos = this.input.activePointer.position
            this.cameras.main.scrollY -= (ppos.y - npos.y) / this.cameras.main.zoom
            this.cameras.main.scrollX -= (ppos.x - npos.x) / this.cameras.main.zoom
        }
    }

    constructor() {
        super({
            key: "MainScene"
        });
    }


}