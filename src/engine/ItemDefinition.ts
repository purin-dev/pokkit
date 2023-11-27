import {Entity} from "./Entity";
import PokkitEngine from "./PokkitEngine";

export interface ItemDefinition {
    name: string,
    id: string,
    imageKey: string
    tick: (i: Entity, e: PokkitEngine) => void
}