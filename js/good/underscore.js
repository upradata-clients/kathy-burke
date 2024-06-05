// @ts-check

/**
 * @typedef {import("gsap").gsap}
 */



/** @param {any} data */
const logThrottle = data => {
    if (logThrottle.__data.length === 0)
        setTimeout(() => requestAnimationFrame(logger), 500);

    logThrottle.__data.push(data);
};

logThrottle.__data = [];

const logger = () => {
    if (logThrottle.__data.length > 0)
        console.log(logThrottle.__data);

    logThrottle.__data = [];
};

/**
 * @param {DocumentReadyState} readyState
 * @returns {(cb: () => void) => void}
 */
const onReady = readyState => cb => {

    const getEventData = () => {
        switch (readyState) {
            case 'loading': return { element: document, event: 'DOMContentLoaded' };
            case 'interactive': return { element: document, event: 'DOMContentLoaded' };
            case 'complete': return { element: window, event: 'load' };
            default: return { element: window, event: 'load' };;
        }
    };


    const tryCall = () => {
        if (document.readyState === readyState) {
            cb();
            return true;
        }

        return false;
    };

    if (!tryCall()) {
        const { element, event } = getEventData();
        element.addEventListener(event, _ => tryCall(), { once: true, passive: true });
    }
};


/**
 * @param {string} event
 * @param {(event: CustomEvent) => void} fn
 * @param {Element | Window & typeof globalThis | undefined} el
 */
const onEvent = (event, fn, el = window) => el.addEventListener(event, /** @type {EventListener} */ (fn));

/**
 * @param {string} event
 * @param {any} detail
 * @param {Element | Window & typeof globalThis | undefined} el
 */
const dispatchEvent = (event, detail = undefined, el = window) => el.dispatchEvent(new CustomEvent(event, { detail }));

const EventNames = {
    gallery: {
        enter: 'gallery.enter',
        leave: 'gallery.leave',
        resize: 'gallery.resize'
    }
};

/**
 * Retrieves an element by its recid.
 * @param {string} recid - The recid of the element to retrieve.
 */
const getElementFromRecid = recid => _.queryThrow(`#rec${recid}`);

/**
 * Gets the bounding client rect of an element.
 * @param {HTMLElement} el - The element to get the bounding client rect of.
 */
const getRect = el => el.getBoundingClientRect();

/**
 * @param {HTMLElement | undefined} el - The element to modify.
 * @param {string} className - The class name to add or remove.
 * @returns {(action: string) => void}
 */
const setClassName = (el, className) => action => el?.classList[ action ](className);

/**
 * @param {gsap.EaseString | gsap.EaseFunction} ease
 * @returns {gsap.EaseFunction}
 */
const makeEaseSShape = ease => {
    const parsedEase = gsap.parseEase(ease);
    return t => t < 0.5 ? 0.5 * parsedEase(2 * t) : 1 - 0.5 * parsedEase(2 * (1 - t));
};

/**
 * @param {gsap.EaseString | gsap.EaseFunction} ease
 * @returns {gsap.EaseFunction}
 */
const makeEaseSymmetric = ease => {
    const parsedEase = gsap.parseEase(ease);
    return t => t < 0.5 ? parsedEase(2 * t) : parsedEase(2 * (1 - t));
};


/** @param {() => void | Record<string, any>} fn */
const define = fn => {
    const newStuff = fn();

    if (newStuff) {
        // @ts-ignore
        window._ = { ...(window._ || {}), ...newStuff };
    }
};


const _ = {
    define,
    logThrottle,
    onReady,
    onLoad: onReady('complete'),
    onDOMContentLoaded: onReady('interactive'),
    onEvent,
    dispatchEvent,
    EventNames,
    getElementFromRecid,
    getRect,
    setClassName,
    toArray: gsap.utils.toArray,
    queryAll: /** @type {(selector: string, el?: HTMLElement) => (HTMLElement|null)[]} */ (gsap.utils.toArray),
    queryAllThrow: /** @type {(selector: string, el?: HTMLElement) => HTMLElement[]} */ (selector, el) => {
        const elts = gsap.utils.toArray(selector, el);

        if (elts.some(el => el === null)) {
            throw new Error(`Could not find elements with selector "${selector}`);
        }

        return elts;
    },
    queryThrow: /** @type {(selector: string, el?: HTMLElement) => HTMLElement} */ (selector, el = document.documentElement) => {
        const elt = el.querySelector(selector);

        if (!elt) {
            throw new Error(`Could not find element with selector "${selector}`);
        }

        return /** @type {HTMLElement} */ (elt);
    },
    makeEaseSShape,
    makeEaseSymmetric
    // ...gsap.utils
};

// @ts-ignore
window._ = {
    // @ts-ignore
    ...window._,
    ..._
};


/** @typedef {typeof _} _Underscore */


/**
 * @typedef {Object} Underscore
 * @property {typeof import('./images-settings.js').getImagesSettings} getImagesSettings
 * @property {typeof import('./gallery/gallery-menu.js').galleryMenu} galleryMenu
 * @property {typeof import('./gallery/gallery-slider.js').GallerySlider} GallerySlider
 * @property {typeof import('./mouse-follow.js').createMouseFollower} createMouseFollower
 * @property {typeof import('./gallery/gallery-layout.js').createElements} createElements
 * @property {typeof import('./gallery/gallery-animation.js').createGalleryAnimation} createGalleryAnimation
 */



// workaround of to merge types
const _all = /** @type {Underscore & _Underscore} */(_);


export { _all as _ };
