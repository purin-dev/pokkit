import {Item} from "./Item";

export interface Recipe {
    id: string,
    name: string,
    ingredientId1: string
    ingredientId2: string
    result: string // Item ID
}