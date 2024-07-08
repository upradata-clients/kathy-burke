// @ts-check
import { registerUnderScore } from '../lib/register-underscore.js';

/**
 * @typedef {import("gsap")} gsap
 */


const _ = await registerUnderScore({ isLocal: true });



document.body.classList.add('loading');

const loader =/** @type {HTMLElement} */(document.querySelector('.init-loader__wrapper'));

document.body.prepend(loader);
document.body.classList.add('mt-loading');
loader.classList.add('active');



setTimeout(() => {
    _.queryThrow('.waiting-loader').classList.add('active');
}, 500);


const removeLoader = () => {
    // window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.classList.remove('loading');

    gsap.to(loader, {
        opacity: 0,
        duration: 0.7,
        ease: 'expo.out',
        onComplete: () => {
            loader.classList.remove('active');
            document.body.classList.remove('mt-loading');
        }
    });
};

_.onEvent(_.EventNames.ready.gsap, () => {
    removeLoader();
}, { isCold: true });


/* _.onMultipleEvents([
    _.EventNames.ready.gsap,
    _.EventNames.ready.gallery
], () => {
    _.dispatchEvent(_.EventNames.ready.document);
}, { isCold: true });
 */
