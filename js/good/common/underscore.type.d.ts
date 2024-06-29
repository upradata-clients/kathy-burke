import { _ as underscore } from './underscore';

declare global {
    export type _ = typeof underscore;
    export interface UnderScore extends _ { }

    export const _: UnderScore;
}
