export interface HashTreeWalker extends TreeWalker {
    roll: (n: number) => Node;
}

export interface Nodes {
    [key: number]: Node
}

export interface Refs {
    [key: number]: PropertyAttributes
}

export interface Names {
    [key: string]: number[]
}

export interface Paths {
    refs: Refs
    names: Names
    indices: {idx: number, id: number}[]
}

export interface PropertyAttributes {
    [name: string]: string[]
}

export interface Update<T> {
    (o: Partial<T>): void
}

export namespace Test {
    export interface Test2 {
        a: string
    }
}
