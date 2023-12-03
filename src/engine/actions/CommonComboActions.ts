import {ComboAction} from "../ComboDefinition";


export function CraftItem(craftedItemId: string): ComboAction {
    return (source, dest, e) => {
        e.destroyItemAt(source)
        e.changeDefinitionAt(dest, craftedItemId)
    }
}