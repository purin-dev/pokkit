import {Entity} from "./Entity";
import PokkitEngine from "./PokkitEngine";

export type Action = (i: Entity, e: PokkitEngine) => void;

export interface ItemDefinition {
    name: string,
    id: string,
    imageKey: string
    tick: Action
}