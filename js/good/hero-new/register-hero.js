// @ts-check

import * as hero from './hero.js';

/** @param {UnderScore} _ */
const registerHero = _ => {

    _.EventNames.hero = /** @type {EventNames['hero']} */({
        firstScrubDone: 'hero:first-scrub-done'
    });

    _.define(() => ({
        hero
    }));

    return _;
};


export { registerHero };
