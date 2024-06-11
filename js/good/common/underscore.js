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
            default: return { element: window, event: 'load' };
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


const uuidv4 = () => {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[ 0 ] & 15 >> +c / 4).toString(16)
    );
};

/** @typedef {{
 *      element?: Element | Window & typeof globalThis;
 *      eventListenerOptions?: AddEventListenerOptions;
 *      isCold?: boolean;
 * }} OnEventOptions
 */

/**
 * @param {string} event
 * @param {(event: CustomEvent) => void} fn
 * @param {OnEventOptions} [options]
 */
const onEvent = (event, fn, { element = window, isCold = false, eventListenerOptions = { passive: true } } = {}) => {

    if (isCold) {
        if (dispatchEvent.events[ event ]) {
            fn(dispatchEvent.events[ event ]);
            return () => {};
        }
    }

    element.addEventListener(event, /** @type {EventListener} */(fn), eventListenerOptions);

    return () => element.removeEventListener(event, /** @type {EventListener} */(fn), eventListenerOptions);
};



/**
 * @param {string[]} events
 * @param {(events: Record<string, CustomEvent>) => void} fn
 * @param {OnEventOptions} [options]
 */
const onMultipleEvents = (events, fn, options) => {

    const stops = events.map(event => onEvent(event, () => {

        const allEventsDispatched = events.every(event => !!dispatchEvent.events[ event ]);

        if (allEventsDispatched)
            fn(events.reduce((acc, event) => ({ ...acc, [ event ]: dispatchEvent.events[ event ] }), {}));

    }, options));


    return () => stops.forEach(stop => stop());
};


/**
 * @param {string} event
 * @param {any} detail
 * @param {Element | Window & typeof globalThis | undefined} el
 */
const dispatchEvent = (event, detail = undefined, el = window) => {
    const customEvent = new CustomEvent(event, { detail });
    dispatchEvent.events[ event ] = customEvent;

    return el.dispatchEvent(customEvent);
};

/** @type {Record<string, CustomEvent>} */
dispatchEvent.events = {};



const EventNames = {
    ready: {
        document: 'document:ready',
        gsap: 'gsap:ready',
        gallery: 'gallery:ready'
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
    /** @param {number} t */
    return t => t < 0.5 ? 0.5 * parsedEase(2 * t) : 1 - 0.5 * parsedEase(2 * (1 - t));
};

/**
 * @param {gsap.EaseString | gsap.EaseFunction} ease
 * @returns {gsap.EaseFunction}
 */
const makeEaseSymmetric = ease => {
    const parsedEase = gsap.parseEase(ease);
    /** @param {number} t */
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


/** @param {(string|HTMLElement)[]} queries */
const svgImageToInline = async (...queries) => {

    const images = queries.flatMap(query => typeof query === 'string' ? _.queryAllThrow(query) : query);

    await Promise.allSettled(images.map(async img => {
        try {
            const image =/** @type {HTMLImageElement} */(img);

            const data = await fetch(image.src).then(res => res.text());

            const parser = new DOMParser();
            const svg = parser.parseFromString(data, 'image/svg+xml').querySelector('svg');

            if (!svg)
                throw new Error('Could not parse SVG');

            if (image.id)
                svg.id = image.id;

            if (image.className)
                svg.classList.add(...image.classList);

            /** @type {Element} */(image.parentNode).replaceChild(svg, image);
        } catch (e) {
            console.error(e);
        }
    }));
};


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
    addScripts,
    lazyFactory,
    promisifyTimeline,
    logThrottle,
    onReady,
    onLoad: onReady('complete'),
    onDOMContentLoaded: onReady('interactive'),
    onEvent,
    onMultipleEvents,
    dispatchEvent,
    EventNames,
    getElementFromRecid,
    svgImageToInline,
    getRect,
    setClassName,
    queryAll: /** @type {(selector: string, el?: HTMLElement) => (HTMLElement|null)[]} */ ((...args) => gsap.utils.toArray(...args)),
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
 * @property {typeof import('../gallery/gallery-menu.js').galleryMenu} galleryMenu
 * @property {typeof import('../gallery/gallery-slider.js').GallerySlider} GallerySlider
 * @property {typeof import('./mouse-follow.js').createMouseFollower} createMouseFollower
 * @property {typeof import('../gallery/gallery-layout.js').createElements} createElements
 * @property {typeof import('../gallery/gallery-animation.js').createGalleryAnimation} createGalleryAnimation
 * @property {typeof import('../common/gsap.plugins.js').registerGsapPlugins} registerGsapPlugins
 */



// workaround of to merge types
const _all = /** @type {Underscore & _Underscore} */(/** @type {any} */ (window)._);


export { _all as _ };
