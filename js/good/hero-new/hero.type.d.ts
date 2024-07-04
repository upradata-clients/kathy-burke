import * as hero from './hero';

declare global {
    export type Hero = typeof hero;
    export interface UnderScore {
        hero: Hero;
    }

    interface EventNames {
        hero: {
            firstScrubDone: 'hero:first-scrub-done';
        };
    }
}

export { };
