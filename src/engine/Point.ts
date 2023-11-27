export interface Point {
    x: number
    y: number

}

export function* adjacentPoints(p: Point) {
    yield northOf(p);
    yield northEastOf(p);
    yield eastOf(p)
    yield southEastOf(p);
    yield southOf(p);
    yield southWestOf(p)
    yield westOf(p)
    yield northWestOf(p);
}


export function northOf(p: Point) {
    return {x: p.x, y: p.y - 1}
}

export function northEastOf(p: Point) {
    return {x: p.x + 1, y: p.y - 1}
}

export function northWestOf(p: Point) {
    return {x: p.x - 1, y: p.y - 1}
}

export function southOf(p: Point) {
    return {x: p.x, y: p.y + 1}
}

export function southEastOf(p: Point) {
    return {x: p.x + 1, y: p.y + 1}
}

export function southWestOf(p: Point) {
    return {x: p.x - 1, y: p.y + 1}
}

export function eastOf(p: Point) {
    return {x: p.x + 1, y: p.y}
}

export function westOf(p: Point) {
    return {x: p.x - 1, y: p.y}
}


