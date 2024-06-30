// @ts-check
import { registerUnderScore } from '../lib/register-underscore.js';

/**
 * @typedef {import("gsap")} gsap
 */


const _ = await registerUnderScore({ isLocal: true });



document.body.classList.add('loading');

const loader =/** @type {HTMLElement} */(document.querySelector('.init-loader__wrapper'));

document.body.prepend(loader);
loader.classList.add('active');


/** @param {string} path */
const fromGsap = path => `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/${path}`;



if (!_.isLocal) {
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
