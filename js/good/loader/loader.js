// @ts-check

/**
 * @typedef {import("gsap")} gsap
 */

/** @type {typeof import('../common/underscore.js')._} */
// const _ = /** @type {any} */ (window)._;

import { _ } from '../common/underscore.js';


document.body.classList.add('loading');

const loader =/** @type {HTMLElement} */(document.querySelector('.init-loader__wrapper'));

document.body.prepend(loader);
loader.classList.add('active');


/** @param {string} path */
const fromGsap = path => `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/${path}`;


const isLocal = [ 'localhost', '127.0.0.1' ].some(host => window.location.hostname === host);

if (!isLocal) {
    _.addScripts(
        fromGsap('gsap.js'),
        fromGsap('ScrollTrigger.js'),
        fromGsap('Flip.js'),
        fromGsap('ScrollToPlugin.js'),
        fromGsap('CustomEase.min.js'),
    ).then(() => {
        gsap.registerPlugin(Flip);
        gsap.registerPlugin(ScrollTrigger);
        gsap.registerPlugin(ScrollToPlugin);
        _.registerGsapPlugins();

        // create the scrollSmoother before your scrollTriggers
        ScrollSmoother.create({
            content: _.queryThrow('#allrecords'), // the element that scrolls
            smooth: 1, // how long (in seconds) it takes to "catch up" to the native scroll position
            effects: true, // looks for data-speed and data-lag attributes on elements
            smoothTouch: 0.1, // much shorter smoothing time on touch devices (default is NO smoothing on touch devices)
        });

        _.dispatchEvent(_.EventNames.ready.gsap);
    });
}

setTimeout(() => {
    _.queryThrow('.waiting-loader').classList.add('active');
}, 1500);

const removeLoader = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.classList.remove('loading');

    gsap.to(loader, {
        opacity: 0,
        duration: 0.7,
        ease: 'expo.out',
        onComplete: () => {
            loader.classList.remove('active');
        }
    });
};

setTimeout(() => {
    _.onEvent(_.EventNames.ready.gsap, () => {
        removeLoader();
    }, { isCold: true });
}, 6000);


_.onMultipleEvents([
    _.EventNames.ready.gsap,
    _.EventNames.ready.gallery
], () => {
    _.dispatchEvent(_.EventNames.ready.document);
}, { isCold: true });
