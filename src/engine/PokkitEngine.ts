import Vector2 = Phaser.Math.Vector2;
import UUID = Phaser.Utils.String.UUID;
import * as Phaser from 'phaser';
import {Recipe} from "../model/Recipe";
import {ItemInstance} from "./ItemInstance";
import {ItemDefinition} from "./ItemDefinition";
import {CraftedItemParams, Events} from "./Events";


//TODO: This package should have no dependencies on phaser libs

export default class PokkitEngine {
    public itemDefinitions: Map<String, ItemDefinition> = new Map<String, ItemDefinition>()
    public recipes: Recipe[] = []
    // WorldState is [x][y] indexed state of each tile in the world
    private worldState: (ItemInstance | undefined)[][] = [[]]
    private size: number
    public events: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter()



    public constructor(size: number, itemDefinitions: Map<String, ItemDefinition>, recipes: Recipe[]) {
        this.recipes = recipes
        this.size = size
        this.itemDefinitions = itemDefinitions
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                if(this.worldState[x] == undefined) this.worldState[x] = []
                this.worldState[x][y] = undefined
            }
        }
    }

    public tick(){
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                if(this.worldState[x][y]){
                    this.itemDefinitions.get(this.worldState[x][y].itemDefinitionId)?.tick(this.worldState[x][y], this)

                }
            }
        }
    }

    public createItemAt(definitionId: string, x: number, y: number): ItemInstance | undefined{
        if(!this.itemDefinitions.has(definitionId)) {
            return
        }
        if(this.getItemAt(x, y) != undefined){
            return
        }

        this.worldState[x][y] = this.instantiateItem(definitionId, x, y)
        return this.worldState[x][y]
    }

    public swapItems(a: Vector2, b: Vector2){
        if(a.x == b.x && a.y == b.y){
            return
        }

        if(this.worldState[a.x][a.y] == undefined){
            // that isn't supposed to happen
            return
        }

        if(this.worldState[b.x][b.y] == undefined){
            //we moving
            this.worldState[b.x][b.y] = this.worldState[a.x][a.y]
            this.worldState[a.x][a.y] = undefined

            this.worldState[b.x][b.y].x = b.x
            this.worldState[b.x][b.y].y = b.y
            this.worldState[b.x][b.y].dirty = true
            return;
        }
        let recipe = this.getRecipeForItems(this.worldState[a.x][a.y].itemDefinitionId, this.worldState[b.x][b.y].itemDefinitionId)
        if(recipe != undefined){
            console.log(`crafted recipe ${recipe.name}`)
            this.worldState[a.x][a.y] = undefined
            this.worldState[b.x][b.y].itemDefinitionId = recipe.result

            this.events.emit(Events.CRAFTED_ITEM, {recipeId: recipe.id, itemInstance: this.worldState[b.x][b.y]})
            return;
        }


        // we swappin
        const swap = this.worldState[b.x][b.y]
        this.worldState[b.x][b.y] = this.worldState[a.x][a.y]
        this.worldState[a.x][a.y] = swap


        this.worldState[b.x][b.y].x = b.x
        this.worldState[b.x][b.y].y = b.y
        this.worldState[a.x][a.y].x = a.x
        this.worldState[a.x][a.y].y = a.y

        this.worldState[b.x][b.y].dirty = true
        this.worldState[a.x][a.y].dirty = true

        this.events.emit(Events.SWAPPED_ITEM, {sourceItem: this.worldState[b.x][b.y], destItem: this.worldState[a.x][a.y]})

        return;
    }

    public getRecipeForItems(itemId1: string, itemId2: string): Recipe | undefined {
        return this.recipes.find((r)=>{
            return (r.ingredientId1 == itemId1 && r.ingredientId2 == itemId2) ||
                (r.ingredientId2 == itemId1 && r.ingredientId1 == itemId2)
        })
    }


    public getItemAt(x: number, y: number): ItemInstance | undefined {
        return this.worldState[x][y]
    }

    public getWorldState(): (ItemInstance | undefined)[][] {
        return this.worldState
    }


    private instantiateItem(definitionId: string, x: number, y: number):ItemInstance{
        return {
            itemDefinitionId: definitionId,
            uuid: UUID(),
            x: x,
            y: y,
            customData: {},
            dirty: true
        }
    }


    // Tick iterates elements and processes each items logic

    // Update 2d array with changes

}