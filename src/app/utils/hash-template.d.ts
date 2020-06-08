/**
 * @template T
 * @param {HTMLTemplateElement|TemplateStringsArray} node
 * @param {any[]} args
 * @returns {(o?: Partial<T>) => Template<T>}
 */
export default function template<T, S>(node: TemplateStringsArray | HTMLTemplateElement, ...args: any[]): (o?: Partial<T>) => Template<T, S>;
/**
 * @template T
 */
export class Template<T, S> {
    /**
     * @param {Node} node
     * @param {HashTemplate.Paths} paths
     * @param {Partial<T>} [o]
     */
    constructor(node: Node, paths: HashTemplate.Paths, o?: Partial<T>);
    _refPaths: HashTemplate.Paths;
    root: HTMLElement;
    _nodes: HashTemplate.Nodes;
    /**
     * @param {Partial<T>} o
     * @returns {Partial<HashTemplate.Nodes>}
     */
    getNodes<K extends keyof S>(o: K[]): { [R in K]: S[K] };
    /**
     * @param {Partial<T>} o
     */
    update(o: Partial<T>): void;
}
export {};
