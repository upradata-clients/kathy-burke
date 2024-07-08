import { _ } from './underscore.js';
import { gsapHelpers } from './gsap-helpers.js';
import * as gsapPlugins from './gsap-plugins.js';
import * as gsapPluginsAMD from './gsap-plugins.umd.js';
import { helpers } from './helpers.js';
import * as textSplit from './text-split.js';
import * as imagesSettings from './images-settings.js';
import * as mouseFollow from './mouse-follow.js';
import { registerGallery } from './gallery/register-gallery.js';
import { registerHero } from '../hero-new/register-hero.js';
import { gsap as _gsap } from '../../../node_modules/gsap/index.js';

const global_ = () => /** @type {UnderScore} */(/** @type {any} */(globalThis)._);



/** @param {string[]} urls */
const addScripts = async (...urls) => {

    await Promise.allSettled(
        urls.map(url => {
            const script = document.createElement('script');
            script.src = url;
            document.head.appendChild(script);

            return new Promise(resolve => {
                script.addEventListener('load', resolve, { once: true });
            });
        })
    );
};


/** @param {UnderScore} _ */
const createScrollSmoother = _ => {
    /* if (_.device.isMobile())
        return; */

    const getContentEl = () => {
        const allRecords = document.querySelector('#allrecords');

        if (allRecords)
            return allRecords;

        const template = document.createElement('template');
        template.innerHTML = `<div id="smooth-wrapper"><div id="smooth-content"></div></div>`;

        const wrapper = _.createElementFromTemplate(template);
        const content = _.queryThrow('#smooth-content', wrapper);

        content.append(...document.body.children);
        document.body.appendChild(wrapper);

        return content;

    };

    document.documentElement.classList.add('mt-scroller');

    // create the scrollSmoother before your scrollTriggers
    ScrollSmoother.create({
        content: getContentEl(), // the element that scrolls
        smooth: 1, // how long (in seconds) it takes to "catch up" to the native scroll position
        effects: true, // looks for data-speed and data-lag attributes on elements
        smoothTouch: 0.1, // much shorter smoothing time on touch devices (default is NO smoothing on touch devices)
    });
};

/**
 * @param {Object} [options]
 * @param {boolean} [options.isLocal]
 * 
 * @returns {Promise<UnderScore>}
 */
const registerUnderScore = async (options = {}) => {
    const { isLocal = [ 'localhost', '127.0.0.1' ].some(host => window.location.hostname === host) } = options;

    global_().define(() => helpers);
    global_().define(() => textSplit);
    global_().define(() => gsapHelpers);
    global_().define(() => imagesSettings);
    global_().define(() => mouseFollow);


    const finishRegister = () => {
        const deviceType = global_().device.isMobile() ? 'is-mobile' : 'is-desktop';
        document.body.classList.add(deviceType);

        createScrollSmoother(global_());

        registerHero(global_());
        registerGallery(global_());

        return global_();
    };

    if (!isLocal) {
        /** @param {string} path */
        const fromGsap = path => `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/${path}`;


        await addScripts(
            fromGsap('gsap.js'),
            fromGsap('ScrollTrigger.js'),
            fromGsap('Flip.js'),
            fromGsap('ScrollToPlugin.js'),
            fromGsap('CustomEase.min.js'),
        );

        gsapPlugins.registerGsapPlugins(/** @type {any} */(gsap));
        // @ts-ignore
        return finishRegister();

    }

    Object.assign(window, { gsap: _gsap });
    return gsapPluginsAMD.registerGsapPlugins(_gsap).then(() => finishRegister());
};


export { registerUnderScore };
