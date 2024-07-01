import { _ } from './underscore.js';
import { gsapHelpers } from './gsap-helpers.js';
import * as gsapPlugins from './gsap-plugins.js';
import * as gsapPluginsAMD from './gsap-plugins.umd.js';
import { helpers } from './helpers.js';
import * as textSplit from './text-split.js';
import * as imagesSettings from './images-settings.js';
import * as mouseFollow from './mouse-follow.js';
import { registerGallery } from '../gallery/register-gallery.js';
import { gsap as _gsap } from 'gsap/index.js';

const global_ = () => /** @type {UnderScore} */(/** @type {any} */(globalThis)._);


const createScrollSmoother = () => {
    // create the scrollSmoother before your scrollTriggers
    ScrollSmoother.create({
        content: document.querySelector('#allrecords') || document.querySelector('body'), // global_().queryThrow('#allrecords'), // the element that scrolls
        smooth: 1, // how long (in seconds) it takes to "catch up" to the native scroll position
        effects: true, // looks for data-speed and data-lag attributes on elements
        smoothTouch: 0.1, // much shorter smoothing time on touch devices (default is NO smoothing on touch devices)
    });
};

/**
 * @template {boolean} [T=false]
 * 
 * @param {Object} [options]
 * @param {T} [options.isLocal]
 * 
 * @returns {T extends true ? Promise<UnderScore> : UnderScore}
 */
const registerUnderScore = (options = {}) => {
    const { isLocal = false } = options;

    global_().define(() => helpers);
    global_().define(() => textSplit);
    global_().define(() => gsapHelpers);
    global_().define(() => imagesSettings);
    global_().define(() => mouseFollow);

    registerGallery(global_());

    const finishRegister = () => {
        createScrollSmoother();
        return global_();
    };

    if (!isLocal) {
        gsapPlugins.registerGsapPlugins();
        // @ts-ignore
        return finishRegister();

    }

    Object.assign(window, { gsap: _gsap });
    // @ts-ignore
    return gsapPluginsAMD.registerGsapPlugins().then(() => finishRegister());
};


export { registerUnderScore };
