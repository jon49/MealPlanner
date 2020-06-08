declare module HashTemplate {
    interface HashTreeWalker extends TreeWalker {
        roll: (n: number) => Node;
    }

    interface Nodes {
        [key: number]: Node
    }

    interface Refs {
        [key: number]: PropertyAttributes
    }

    interface Names {
        [key: string]: number[]
    }

    interface Paths {
        refs: Refs
        names: Names
        indices: {idx: number, id: number}[]
    }

    interface PropertyAttributes {
        [name: string]: string[]
    }

    interface Update<T> {
        (o: Partial<T>): void
    }
}
