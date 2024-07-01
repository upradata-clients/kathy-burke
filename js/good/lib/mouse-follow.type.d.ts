import * as mouseFollow from './mouse-follow';

declare global {
    export type MouseFollow = typeof mouseFollow;
    export interface UnderScore extends MouseFollow { }
}
