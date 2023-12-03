import * as Phaser from 'phaser';
import ItemTile from "../objects/ItemTile";
import ItemSlot from "../objects/ItemSlot";
import PokkitEngine, {Phase} from "../engine/PokkitEngine";
import {Events} from "../engine/Events";
import {Entity} from "../engine/Entity";
import ItemRegistry from "../engine/registries/ItemRegistry";
import ComboRegistry from "../engine/registries/ComboRegistry";
import {CraftItem} from "../engine/actions/CommonComboActions";

export default class GameScene extends Phaser.Scene {

    public engine: PokkitEngine
    public worldSize = 640;
    public tileSize = this.worldSize / 10;
    public slots: ItemSlot[][] = [[]]
    public items: ItemTile[] = []

    preload() {
        ItemRegistry.register({
            id: "0_0", tick: (_i, e) => {
                console.log("i ticked!", e)
            }, name: "Acorn", imageKey: "tree_0"
        })
        ItemRegistry.register({
            id: "0_1", tick: (_i, e) => {
                console.log("im a sapling and I ticked!", e)
            }, name: "Sapling", imageKey: "tree_1"
        })
        ItemRegistry.register({
            id: "0_2", tick: (i, e) => {
                let hasSpawned = false;
                let trySpawn = () => {
                    if (!hasSpawned) {
                        let freeSpace = e.getFreeSpaceAroundPoint({x: i.x, y: i.y})
                        if (freeSpace) {
                            if (e.createItemAt("0_0", freeSpace.x, freeSpace.y)) {
                                hasSpawned = true
                            }
                        }
                    }
                }
                e.onPhase(Phase.SPAWN_1, trySpawn)
                e.onPhase(Phase.SPAWN_2, trySpawn)

            }, name: "Tree", imageKey: "tree_2"
        })

        ComboRegistry.register({
            id: "0",
            name: "upgrade acorn",
            ingredientId1: "0_0",
            ingredientId2: "0_0",
            action: CraftItem("0_1")
        })
        ComboRegistry.register({
            id: "1",
            name: "upgrade acorn",
            ingredientId1: "0_1",
            ingredientId2: "0_1",
            action: CraftItem("0_2")
        })

        this.engine = new PokkitEngine(this.worldSize / this.tileSize)
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