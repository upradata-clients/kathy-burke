declare global {
    export type InferArray<T extends readonly any[]> = T extends readonly (infer U)[] ? U : never;
    export type ListOrElement<T> = T | T[];
    export type ReadonlyListOrElement<T> = T | readonly T[];
}

export { };
