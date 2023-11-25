import {ItemInstance} from "./ItemInstance";

enum Events {
    CRAFTED_ITEM = "crafted",
    SWAPPED_ITEM = "swapped"
}
interface CraftedItemParams {
    recipeId: string
    itemInstance: ItemInstance
}

interface SwappedItemParams {
    sourceItem: ItemInstance
    destItem: ItemInstance
}


export {Events, CraftedItemParams, SwappedItemParams}