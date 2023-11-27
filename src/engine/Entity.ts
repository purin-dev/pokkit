export interface Entity {
    itemDefinitionId: string
    uuid: string
    x: number
    y: number
    customData: any
    onUpdate: () => void
    onDestroy: () => void
}
