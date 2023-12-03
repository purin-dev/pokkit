import {Entity} from "./Entity";
import PokkitEngine from "./PokkitEngine";

export type ComboAction = (source: Entity, dest: Entity, e: PokkitEngine) => void;

export interface ComboDefinition {
    name: string,
    id: string,
    ingredientId1: string
    ingredientId2: string
    action: ComboAction
}