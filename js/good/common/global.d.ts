declare global {
    export type InferArray<T extends readonly any[]> = T extends readonly (infer U)[] ? U : never;
}

export { };
