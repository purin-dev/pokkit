import {ComboDefinition} from "../ComboDefinition";


//todo: this doesn't scale very well :(
export default class ComboRegistry {
    private static instance: ComboRegistry;

    private registry: Map<String, ComboDefinition>

    public static getInstance(): ComboRegistry {
        if (!ComboRegistry.instance) {
            ComboRegistry.instance = new ComboRegistry();
        }

        return ComboRegistry.instance;
    }

    constructor() {
        this.registry = new Map();
    }

    public static register(comboDefinition: ComboDefinition) {
        if (this.getInstance().registry.has(comboDefinition.id)) {
            console.log("error: tried to load combo with duplicate id: ", comboDefinition)
        }

        this.getInstance().registry.set(comboDefinition.id, comboDefinition)
    }

    public static find(id1: string, id2: string): ComboDefinition | undefined {
        if (!this.getInstance().registry.size) {
            return undefined;
        }

        for (const combo of this.getInstance().registry.values()) {
            if ((combo.ingredientId1 == id1 && combo.ingredientId2 == id2) ||
                (combo.ingredientId1 == id2 && combo.ingredientId2 == id1)) {
                return combo
            }
        }

        return undefined
    }

}