import { gsapHelpers } from './gsap-helpers';

declare global {
    export type GsapHelpers = typeof gsapHelpers;
    export interface UnderScore extends GsapHelpers { }
}
