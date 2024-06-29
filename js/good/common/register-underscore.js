import { _ } from './underscore.js';
import { gsapHelpers } from './gsap-helpers.js';
import * as gsapPlugins from './gsap-plugins.js';
import * as gsapPluginsAMD from './gsap-plugins.umd.js';
import { helpers } from './helpers.js';
import * as textSplit from './text-split.js';
import * as imagesSettings from './images-settings.js';
import * as mouseFollow from './mouse-follow.js';
import { registerGallery } from './../gallery/register-gallery.js';
import { gsap as _gsap } from '../../../node_modules/gsap/index.js';



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

    const global_ = () => /** @type {UnderScore} */(/** @type {any} */(globalThis)._);

    global_().define(() => helpers);
    global_().define(() => textSplit);
    global_().define(() => gsapHelpers);
    global_().define(() => imagesSettings);
    global_().define(() => mouseFollow);

    registerGallery(global_());

    if (!isLocal) {
        gsapPlugins.registerGsapPlugins();
        // @ts-ignore
        return global_();

    }

    Object.assign(window, { gsap: _gsap });
    // @ts-ignore
    return gsapPluginsAMD.registerGsapPlugins().then(() => global_());
};


export { registerUnderScore };
