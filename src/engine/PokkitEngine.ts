import * as Phaser from 'phaser';
import {Recipe} from "../model/Recipe";
import {Entity} from "./Entity";
import {ItemDefinition} from "./ItemDefinition";
import {Events} from "./Events";
import {adjacentPoints, Point} from "./Point";
import Vector2 = Phaser.Math.Vector2;
import UUID = Phaser.Utils.String.UUID;


//TODO: This package should have no dependencies on phaser libs

//TODO: Maybe instead of using references to ItemInstances in the game, it can instead be callback driven
// I.e., when a space is updated - notify the game scene about it
export default class PokkitEngine {
    public itemDefinitions: Map<String, ItemDefinition> = new Map<String, ItemDefinition>()
    public recipes: Recipe[] = []
    // WorldState is [x][y] indexed state of each tile in the world
    private worldState: (Entity | undefined)[][] = [[]]
    private size: number
    public events: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter()


    public constructor(size: number, itemDefinitions: Map<String, ItemDefinition>, recipes: Recipe[]) {
        this.recipes = recipes
        this.size = size
        this.itemDefinitions = itemDefinitions
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                if (this.worldState[x] == undefined) this.worldState[x] = []
                this.worldState[x][y] = undefined
            }
        }
    }

    public tick() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if (this.worldState[x][y]) {
                    this.itemDefinitions.get(this.worldState[x][y].itemDefinitionId)?.tick(this.worldState[x][y], this)

                }
            }
        }
    }

    public createItemAt(definitionId: string, x: number, y: number): Entity | undefined {
        if (!this.itemDefinitions.has(definitionId)) {
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

        let recipe = this.getRecipeForItems(this.worldState[a.x][a.y].itemDefinitionId, this.worldState[b.x][b.y].itemDefinitionId)
        if (recipe != undefined) {
            console.log(`crafted recipe ${recipe.name}`)
            this.worldState[a.x][a.y].onDestroy()
            this.worldState[a.x][a.y] = undefined
            this.worldState[b.x][b.y].itemDefinitionId = recipe.result

            this.worldState[b.x][b.y].onUpdate()
            this.events.emit(Events.CRAFTED_ITEM, {recipeId: recipe.id, itemInstance: this.worldState[b.x][b.y]})
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

    public getRecipeForItems(itemId1: string, itemId2: string): Recipe | undefined {
        return this.recipes.find((r) => {
            return (r.ingredientId1 == itemId1 && r.ingredientId2 == itemId2) ||
                (r.ingredientId2 == itemId1 && r.ingredientId1 == itemId2)
        })
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


    // Tick iterates elements and processes each items logic

    // Update 2d array with changes

}