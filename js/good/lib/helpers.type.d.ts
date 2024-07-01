import { helpers } from './helpers';

declare global {
    export type Helpers = typeof helpers;
    export interface UnderScore extends Helpers { }
}
