// @ts-check


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




/** @typedef {{
 *      element?: Element | Window & typeof globalThis;
 *      eventListenerOptions?: AddEventListenerOptions;
 *      isCold?: boolean;
 * }} OnEventOptions
 */

/**
 * @template {string} T
 * 
 * @param {T} event
 * @param {(event: CustomEvent<EventData<T>>) => void} fn
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
 * @template {string} E
 * @template {readonly E[]} Events
 * @param {Events} events
 * @param {(events: Record<E, CustomEvent>) => void} fn
 * @param {OnEventOptions} [options]
 */
const onMultipleEvents = (events, fn, options) => {

    let eventsDispatched = /** @type {Record<E,boolean>} */({});

    const stops = events.map(event => onEvent(event, () => {
        eventsDispatched[ event ] = true;
        const allEventsDispatched = events.every(event => !!eventsDispatched[ event ]);

        if (allEventsDispatched) {
            eventsDispatched = /** @type {Record<E,boolean>} */({});
            fn(events.reduce((acc, event) => ({ ...acc, [ event ]: dispatchEvent.events[ event ] }), /** @type {Record<E, CustomEvent>} */({})));
        }

    }, options));


    return () => stops.forEach(stop => stop());
};

/**
 * @template {string} T
 * 
 * @param {T} event
 * @param {EventData<T>} detail
 * @param {Object} [options]
 * @param {Element | Window & typeof globalThis | undefined} [options.element]
 */
const dispatchEvent = (event, detail, { element = window } = {}) => {
    const customEvent = new CustomEvent(event, { detail });
    dispatchEvent.events[ event ] = customEvent;

    return element.dispatchEvent(customEvent);
};

/** @type {Record<string, CustomEvent>} */
dispatchEvent.events = {};


/**
 * @param {string} event
 * @param {any} [detail]
 * @param {Object} [options]
 * @param {Element | Window & typeof globalThis | undefined} [options.element]
 */
const createDispatchEventOnce = (event, detail, options) => {
    let isDispatched = false;

    return () => {
        if (isDispatched)
            return;

        isDispatched = true;
        return dispatchEvent(event, detail, options);
    };
};



const EventNames =/** @type {EventNames} */ (/** @type {GlobalEventNames} */({
    ready: {
        document: 'document:ready',
        gsap: 'gsap:ready',
        gallery: 'gallery:ready'
    },
    resize: 'resize',
}));



/**
 * Retrieves an element by its recid.
 * @param {string} recid - The recid of the element to retrieve.
 */
const getElementFromRecid = recid => queryThrow(`#rec${recid}`);

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
 * @template {(createParams?: any) => any} C
 * @param {C} create
 */
const createLazySingleton = create => {
    let instance = undefined;

    /**
     * @template T
     * @template U
     * @typedef {{ instance: () => T | undefined; reset: () => R<T,U>}} CommonR
     */

    /**
     * @template T
     * @template U
     * @typedef {[U] extends [never | undefined] ?
     * CommonR<T, U> & { get: () => T; resetImmediate: () => R<T, U>; } :
     * CommonR<T, U> & { get: (createParams: U) => T; resetImmediate: (createParams: U) => R<T, U>;}
     * } R
     */


    /**
     * @template {(instance: ReturnType<C>) => void} D
     * @param {{ destroy?: D; isParamsEqual?: (p1: Parameters<C>[0], p2: Parameters<C>[0]) => boolean; }} [params]
     * @returns {R<ReturnType<C>, Parameters<C>[0]>}
     */
    return ({ destroy, isParamsEqual = Object.is } = {}) => {
        let lastParams = undefined;

        const reset = () => {
            if (instance)
                destroy?.(instance);

            instance = undefined;
        };

        const lazySingleton =/** @satisfies {R<ReturnType<C>, Parameters<C>[0]>}*/({
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
                return lazySingleton;
            },
            reset: () => {
                if (instance)
                    destroy?.(instance);

                instance = undefined;
                return lazySingleton;
            }
        });


        return (/** @type {any} */(lazySingleton));
    };
};


/** @param {(string|HTMLElement)[]} queries */
const svgImageToInline = async (...queries) => {

    const images = queries.flatMap(query => typeof query === 'string' ? queryAllThrow(query) : query);

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


/**
 * @param {string | SVGSVGElement} svgTarget
 * @param {Record<'x' | 'y', number>} position
 */
const setSvgPosition = (svgTarget, position) => {
    const svg =/** @type {SVGSVGElement} */(typeof svgTarget === 'string' ? queryThrow(svgTarget) : svgTarget);

    const setPosition = () => {
        // preserveAspectRatio="xMinYMin slice"
        svg.preserveAspectRatio.baseVal.align = SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMIN;
        svg.preserveAspectRatio.baseVal.meetOrSlice = SVGPreserveAspectRatio.SVG_MEETORSLICE_SLICE;

        const rectHTLM = svg.getBoundingClientRect();
        const rectSvg = svg.viewBox.baseVal;

        const diff = {
            x: Math.max(rectSvg.width - rectHTLM.width, 0),
            y: Math.max(rectSvg.height - rectHTLM.height, 0)
        };

        /** @param {'x' | 'y'} X */
        const getPosition = X => Math.round(position[ X ] * diff[ X ]);

        svg.setAttribute('viewBox', `${getPosition('x')} ${getPosition('y')} ${rectSvg.width} ${rectSvg.height}`);
    };


    onEvent(EventNames.resize, createMultipleSetTimeoutCalls(setPosition, [ 0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 ]));
    setPosition();
};


/**
 * @param {() => any} fn
 * @param {readonly number[]} times
 */
const createMultipleSetTimeoutCalls = (fn, times) => {
    return () => {
        times.forEach(time => setTimeout(fn, time));
        fn();
    };
};

/**
 * @param {() => any} f 
 * @param {number} time 
 */
const debounce = (f, time) => {
    let isCalled = false;

    return () => {
        if (isCalled)
            return;

        isCalled = true;

        setTimeout(() => {
            f();
            isCalled = false;
        }, time);
    };
};


/**
 * @param {() => any} f 
 * @param {number} time 
 */
const debounceRestart = (f, time) => {
    let timeout = undefined;

    return () => {
        if (timeout)
            clearTimeout(timeout);

        timeout = setTimeout(() => {
            f();
            timeout = undefined;
        }, time);
    };
};




const isLocal = [ 'localhost', '127.0.0.1' ].some(host => window.location.hostname === host);



/** @type {(selector: string, el?: Element | DocumentFragment) => (HTMLElement | null)[]} */
const queryAll = (...args) => gsap.utils.toArray(...args);

/**
 * @template {string} K
 * @typedef {K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K]:
 *  K extends 'svg' ? SVGSVGElement : 
 *  K extends `svg.${string}` ? SVGSVGElement : 
 *  K extends 'path' ? SVGPathElement:
 *  K extends `${string} path` ? SVGPathElement:
 *  HTMLElement} HTMLElementByKey
 */

/**
 * @template {string} K
 * @param {K} selector
 * @param {Element | DocumentFragment} [el]
 * 
 * @returns {HTMLElementByKey<K>[]}
 */
const queryAllThrow = (selector, el) => {
    const elts = gsap.utils.toArray(selector, el);

    if (elts.some(el => el === null)) {
        throw new Error(`Could not find elements with selector "${selector}`);
    }

    return elts;
};



/**
 * @template {string} K
 * @param {K} selector
 * @param {Element | DocumentFragment} [el]
 * 
 * @returns {HTMLElementByKey<K>}
 */
const queryThrow = (selector, el = document.documentElement) => {
    const elt = el.querySelector(selector);

    if (!elt) {
        throw new Error(`Could not find element with selector "${selector}`);
    }

    return /** @type {any} */ (elt);
};

/**
 * @template {Node} T
 * @param {T} el
 * @param {boolean} [deep]
 * @returns {T}
 */
const cloneElement = (el, deep = true) =>/** @type {T} */(el.cloneNode(deep));

/**
 * @template {string} Type
 * 
 * @param {HTMLTemplateElement} template
 * @param {Type} [type]
 * @returns {HTMLElementByKey<Type>}
 */
const createElementFromTemplate = (template, type) =>/** @type {HTMLElementByKey<Type>} */(cloneElement(template).content.firstElementChild);


/**
 * @param {number} nb
 * @param {number} [precision]
 */
const round2Decimals = (nb, precision = 0) => Math.round(nb * Math.pow(10, precision)) / Math.pow(10, precision);



const getNavigator = () => {

    if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1)
        return 'Opera';

    if (navigator.userAgent.indexOf("Edg") != -1)
        return 'Edge';

    if (navigator.userAgent.indexOf("Chrome") != -1)
        return 'Chrome';

    if (navigator.userAgent.indexOf("Safari") != -1)
        return 'Safari';

    if (navigator.userAgent.indexOf("Firefox") != -1)
        return 'Firefox';

    if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!/** @type {any} */(document).documentMode == true)) //IF IE > 10
        return 'IE';

    return 'unknown';
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

const helpers = {
    isLocal,
    getNavigator,
    addScripts,
    createLazySingleton: createLazySingleton,
    logThrottle,
    createMultipleSetTimeoutCalls,
    queryAll, queryAllThrow, queryThrow, cloneElement, createElementFromTemplate,
    debounce, debounceRestart,
    round2Decimals,
    onReady, onLoad: onReady('complete'), onDOMContentLoaded: onReady('interactive'),
    onEvent, onMultipleEvents, dispatchEvent, createDispatchEventOnce, EventNames,
    getElementFromRecid,
    svgImageToInline, setSvgPosition,
    getRect,
    setClassName,
    makeEaseSShape, makeEaseSymmetric
};


export { helpers };
