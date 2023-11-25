import {ItemInstance} from "./ItemInstance";
import PokkitEngine from "./PokkitEngine";

export interface ItemDefinition {
    name: string,
    id: string,
    imageKey: string
    tick: (i: ItemInstance, e: PokkitEngine) => void
}