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
const onEvent = (event, fn, el = window) => el.addEventListener(event, /** @type {EventListener} */(fn));

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
 * @returns {(action: 'add' | 'remove') => void}
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


/**
 * @param {gsap.core.Timeline | gsap.core.Tween} timeline
 * @returns {Promise<void>}
 */
const promisifyTimeline = timeline => new Promise(resolve => {
    timeline.eventCallback('onComplete', resolve);
    timeline.eventCallback('onReverseComplete', resolve);
});
// new Promise(resolve => timeline.then(() => { resolve(); }));

/**
 * @template T
 * @template {never} U
 * @template {(instance : T, createParams?: U) => T} C
 * @param {(instance : T | undefined, createParams?: U) => T} create
 * @returns {{ get: (createParams?: U) => T; resetImmediate: (createParams?: U) => void; reset: () => void}}
 */


/**
 * @template {(createParams?: any) => any} C
 * @param {C} create
 */
const lazyFactory = create => {
    let instance = undefined;

    /**
     * @template T
     * @typedef {{ instance: () => T | undefined; reset: () => void}} CommonR
     */

    /**
     * @template T
     * @template U
     * @typedef {U extends never| undefined ?
     * CommonR<T> & { get: () => T; resetImmediate: () => void; } :
     * CommonR<T> & { get: (createParams: U) => T; resetImmediate: (createParams: U) => void;}
     * } R
     */


    /**
     * @template {(instance : ReturnType<C>) => void} D
     * @param {{ destroy?: D; isParamsEqual?: (p1: Parameters<C>[0], p2: Parameters<C>[0]) => boolean; }} params
     * @returns {R<ReturnType<C>, Parameters<C>[0]>}
     */
    return ({ destroy, isParamsEqual = Object.is }) => {
        let lastParams = undefined;

        const reset = () => {
            if (instance)
                destroy?.(instance);

            instance = undefined;
        };

        const factory =/** @type {R<T, U>}*/({
            instance: () => instance,
            get: createParams => {
                if (instance && !isParamsEqual(lastParams, createParams))
                    reset();

                instance = instance || create(createParams);
                lastParams = createParams;

                return instance;
            },
            resetImmediate: createParams => {
                reset();
                instance = create(createParams);
            },
            reset: () => {
                if (instance)
                    destroy?.(instance);

                instance = undefined;
            }
        });


        return (/** @type {any} */(factory));
    };
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
    lazyFactory,
    promisifyTimeline,
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
const _all = /** @type {Underscore & _Underscore} */(/** @type {any} */ (window)._);


export { _all as _ };
