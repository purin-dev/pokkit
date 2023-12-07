import * as Phaser from 'phaser';
import {Entity} from "./Entity";
import {Events} from "./Events";
import {adjacentPoints, Point} from "./Point";
import ItemRegistry from "./registries/ItemRegistry";
import ComboRegistry from "./registries/ComboRegistry";
import Vector2 = Phaser.Math.Vector2;
import UUID = Phaser.Utils.String.UUID;


//TODO: This package should have no dependencies on phaser libs


export enum Phase {
    TICK,
    SPAWN_1,
    CONSUME,
    SPAWN_2,
    DONE
}

export default class PokkitEngine {
    // WorldState is [x][y] indexed state of each tile in the world
    private worldState: (Entity | undefined)[][] = [[]]
    private size: number
    public events: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter()

    public constructor(size: number) {
        this.size = size
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                if (this.worldState[x] == undefined) this.worldState[x] = []
                this.worldState[x][y] = undefined
            }
        }
    }

    private currentPhase = Phase.TICK
    private actionStacks = new Map<Phase, (() => void)[]>()


    public tick() {
        this.events.emit("tick")
        this.currentPhase = Phase.TICK

        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (this.worldState[x][y]) {
                    ItemRegistry.get(this.worldState[x][y].itemDefinitionId)?.tick(this.worldState[x][y], this)
                }
            }
        }

        const phaseOrder = [Phase.SPAWN_1, Phase.CONSUME, Phase.SPAWN_2]
        for (const phase of phaseOrder) {
            console.log(`tick phase ${phase}`)
            this.currentPhase = phase
            if (this.actionStacks.get(phase)) {
                while (this.actionStacks.get(phase).length) {
                    this.actionStacks.get(phase).pop()()
                }
            }
        }

        this.currentPhase = Phase.DONE
    }

    public onPhase(phase: Phase, action: () => void) {
        if (this.currentPhase > phase) {
            console.log("error: tried to enqueue an action for a phase that has already processed")
            return
        }

        if (this.actionStacks.get(phase) == undefined) {
            this.actionStacks.set(phase, [])
        }

        this.actionStacks.get(phase).push(action)
    }

    public createItemAt(definitionId: string, x: number, y: number): Entity | undefined {
        if (!ItemRegistry.get(definitionId)) {
            return undefined
        }
        if (this.getItemAt({x: x, y: y}) != undefined) {
            return undefined
        }

        this.worldState[x][y] = this.instantiateItem(definitionId, x, y)
        this.events.emit(Events.CREATED_ITEM, this.worldState[x][y])
        return this.worldState[x][y]
    }

    public swapItems(a: Vector2, b: Vector2) {
        if (a.x < 0 || a.x >= this.size || a.y < 0 || a.y >= this.size) {
            return;
        }

        if (a.x == b.x && a.y == b.y) {
            this.worldState[a.x][a.y].onUpdate()
            return
        }

        if (this.worldState[a.x][a.y] == undefined) {
            // that isn't supposed to happen
            return
        }

        if (this.worldState[b.x][b.y] == undefined) {
            //we moving
            console.log(`moving from ${a.x}, ${a.y} to ${b.x}, ${b.y}`)
            this.worldState[b.x][b.y] = this.worldState[a.x][a.y]
            this.worldState[a.x][a.y] = undefined

            this.worldState[b.x][b.y].x = b.x
            this.worldState[b.x][b.y].y = b.y
            this.worldState[b.x][b.y].onUpdate()

            return;
        }

        let combo = ComboRegistry.find(this.worldState[a.x][a.y].itemDefinitionId, this.worldState[b.x][b.y].itemDefinitionId)
        if (combo != undefined) {
            combo.action(this.worldState[a.x][a.y], this.worldState[b.x][b.y], this)
            console.log(`performed combo ${combo.name}`)


            return;
        }


        // we swappin
        console.log(`swapping ${a.x}, ${a.y} with ${b.x}, ${b.y}`)

        const swap = this.worldState[b.x][b.y]
        this.worldState[b.x][b.y] = this.worldState[a.x][a.y]
        this.worldState[a.x][a.y] = swap


        this.worldState[b.x][b.y].x = b.x
        this.worldState[b.x][b.y].y = b.y
        this.worldState[a.x][a.y].x = a.x
        this.worldState[a.x][a.y].y = a.y


        this.events.emit(Events.SWAPPED_ITEM, {
            sourceItem: this.worldState[b.x][b.y],
            destItem: this.worldState[a.x][a.y]
        })

        this.worldState[b.x][b.y].onUpdate()
        this.worldState[a.x][a.y].onUpdate()


        return;
    }


    public getItemAt(p: Point): Entity | undefined {
        if (p.x < 0 || p.x >= this.size) {
            return undefined
        }
        if (p.y < 0 || p.y >= this.size) {
            return undefined
        }

        return this.worldState[p.x][p.y]
    }

    public destroyItemAt(p: Point) {
        this.worldState[p.x][p.y].onDestroy()
        this.worldState[p.x][p.y] = undefined
    }

    public changeDefinitionAt(p: Point, definitionId: string) {
        this.worldState[p.x][p.y].itemDefinitionId = definitionId
        this.worldState[p.x][p.y].onUpdate()
    }

    public getFreeSpaceAroundPoint(p: Point): Point | null {
        for (const point of adjacentPoints(p)) {
            if (this.pointIsInBounds(point) && this.getItemAt(point) == undefined) {
                return point
            }
        }
        return undefined
    }

    public getWorldState(): (Entity | undefined)[][] {
        return this.worldState
    }

    public pointIsInBounds(p: Point) {
        if (p.x < 0 || p.x >= this.size) {
            return false
        }
        if (p.y < 0 || p.y >= this.size) {
            return false
        }
        return true
    }


    private instantiateItem(definitionId: string, x: number, y: number): Entity {
        return {
            itemDefinitionId: definitionId,
            uuid: UUID(),
            x: x,
            y: y,
            customData: {},
            onUpdate: () => {
            },
            onDestroy: () => {
            }
        }
    }
}