import {ItemDefinition} from "../ItemDefinition";

export default class ItemRegistry {
    private static instance: ItemRegistry;
    private registry: Map<String, ItemDefinition>

    public static getInstance(): ItemRegistry {
        if (!ItemRegistry.instance) {
            ItemRegistry.instance = new ItemRegistry();
        }

        return ItemRegistry.instance;
    }

    constructor() {
        this.registry = new Map();
    }

    public static register(itemDefinition: ItemDefinition) {
        if (this.getInstance().registry.has(itemDefinition.id)) {
            console.log("error: tried to load item with duplicate id: ", itemDefinition)
        }

        this.getInstance().registry.set(itemDefinition.id, itemDefinition)
    }

    public static get(id: string): ItemDefinition | undefined {
        return this.getInstance().registry.get(id)
    }

}