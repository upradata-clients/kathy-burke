import * as textSplit from './text-split';

declare global {
    export type TextSplit = typeof textSplit;
    export interface UnderScore extends TextSplit { }
}
