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

const windowAny =/** @type {any} */(window);

const isMobileDevice = () => {
    if (isMobileDevice.state.hasBeenChecked)
        return isMobileDevice.state.value;

    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || windowAny.opera);

    isMobileDevice.state = { value: check, hasBeenChecked: true };
    return check;
};

isMobileDevice.state = {
    value: false,
    hasBeenChecked: false
};

const isMobileAndTabletDevice = () => {
    if (isMobileAndTabletDevice.state.hasBeenChecked)
        return isMobileAndTabletDevice.state.value;

    let check = false;

    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || windowAny.opera);

    isMobileAndTabletDevice.state = { value: check, hasBeenChecked: true };
    return check;
};

isMobileAndTabletDevice.state = {
    value: false,
    hasBeenChecked: false
};

const device = {
    isMobile: isMobileDevice,
    isMobileAndTablet: isMobileAndTabletDevice
};


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
    isLocal, getNavigator, device,
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
