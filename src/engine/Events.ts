import {Entity} from "./Entity";

enum Events {
    CRAFTED_ITEM = "crafted",
    SWAPPED_ITEM = "swapped",
    CREATED_ITEM = "created",
}

interface CraftedItemParams {
    recipeId: string
    itemInstance: Entity
}

interface SwappedItemParams {
    sourceItem: Entity
    destItem: Entity
}


export {Events};
export type {CraftedItemParams, SwappedItemParams};
