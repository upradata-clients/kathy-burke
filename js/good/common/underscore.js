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
 * @param {string} event
 * @param {any} [detail]
 * @param {Object} [options]
 * @param {Element | Window & typeof globalThis | undefined} [options.element]
 */
const dispatchEvent = (event, detail = undefined, { element = window } = {}) => {
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
        return _.dispatchEvent(event, detail, options);
    };
};



const EventNames = {
    ready: {
        document: 'document:ready',
        gsap: 'gsap:ready',
        gallery: 'gallery:ready'
    },
    resize: 'resize',
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

/**
 * @param {string | SVGSVGElement} svgTarget
 * @param {Record<'x' | 'y', number>} position
 */
const setSvgPosition = (svgTarget, position) => {
    const svg =/** @type {SVGSVGElement} */(typeof svgTarget === 'string' ? _.queryThrow(svgTarget) : svgTarget);

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


    _.onEvent(_.EventNames.resize, createMultipleSetTimeoutCalls(setPosition, [ 0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 ]));
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
 * @template {Record<string, gsap.TweenTarget>} T
 * @typedef {(keyof T) & string | gsap.core.Timeline | gsap.core.Tween | object} AddToTimelineTarget
 */


/**

 * @template {readonly any[]} Elts
 * @typedef {Object} _AddToTimelineOption
 
 * @property {gsap.Position} [start]
 * @property {number} [duration]
 * @property {gsap.core.Timeline} [timeline]
 * @property {CreateTimelinesOptions & { ease?: gsap.EaseString | gsap.EaseFunction; createAnimation: (params: { element: InferArray<Elts>, index: number, globalTimeline: gsap.core.Timeline; }) => AddToTimelineOptions; elements: Elts; }} [timelines] 
 * @property {AddToTimelineTarget<{}>} [target]
 */


/**
 * @typedef {Partial<Record<'from' | 'to' | 'set', gsap.TweenVars>> & { fromTo?: Record<'from' | 'to', gsap.TweenVars>; }} _AddToTimelineOptionActions
 */

/**
 * @template {readonly any[]} [Elts=readonly any[]]
 * @typedef {_AddToTimelineOption<Elts> & _AddToTimelineOptionActions } AddToTimelineOption
 */

/**
 * @template {readonly any[]} [Elts=readonly any[]]
 * @typedef {AddToTimelineOption<Elts> | AddToTimelineOption<Elts>[]} AddToTimelineOptions
 */


/**
 * @template T
 * @template {readonly T[]} Elts
 * @param {readonly AddToTimelineOption<Elts>[]} listOfOptions
 */
const addToTimeline = (...listOfOptions) => {

    /**
     * @param {gsap.core.Timeline} timeline
     * @param {gsap.core.Timeline | gsap.core.Tween} tl
     * @param {gsap.Position | undefined} start
     * @param {gsap.TweenVars | undefined} options
     */
    const addTimeline = (timeline, tl, start, options) => {
        timeline.add(tl, start);

        const opts = Object.entries(options || {}).reduce((opts, [ k, v ]) => typeof v === 'undefined' ? opts : { ...opts, [ k ]: v }, {});

        if (Object.keys(opts).length === 0)
            return timeline;

        tl.paused(true);
        return timeline.to(tl, opts, start);
    };


    listOfOptions.forEach(options => {
        const { start, timeline = gsap, timelines, duration, from, to, fromTo, set, target } = options;

        if (timelines) {

            const { createAnimation, ease, ...timelinesOptions } = timelines;

            const { timeline: tl, duration } = createTimelines(timelines.elements, (tl, element, index, globalTimeline) => {
                const newOptions = createAnimation({ element, index, globalTimeline });
                const listOfOptions = (Array.isArray(newOptions) ? newOptions : [ newOptions ]).map(opts => ({ ...opts, timeline: tl }));
               
                addToTimeline(...listOfOptions);
            }, timelinesOptions);

            if (timelinesOptions.withScrub)
                return timeline.fromTo(tl, { time: 0 }, { time: duration, duration, ease }, start);

            if (!options.timeline)
                throw new Error('timeline is not defined in options');


            return options.timeline.add(tl, start);
        }

        const getTweenOptions = () => {
            if (fromTo) return /** @type {const} */({ options: fromTo, type: 'fromTo' });
            if (from) return /** @type {const} */({ options: from, type: 'from' });
            if (to) return /** @type {const} */({ options: to, type: 'to' });
            if (set) return /** @type {const} */({ options: set, type: 'set' });
            return {};
        };

        const tweenOpts = getTweenOptions();

        /** @param {gsap.TweenVars | undefined} opts */
        const tweenOptions = opts => ({ duration, ...opts });

        if (target instanceof gsap.core.Timeline || target instanceof gsap.core.Tween) {
            if (!options.timeline)
                throw new Error('timeline is not defined in options');

            return addTimeline(options.timeline, target, start, tweenOptions(tweenOpts.options));
        }

        if (!target)
            throw new Error('target is not defined in options');

        if (tweenOpts.type === undefined)
            throw new Error('animation type (set, from, to, fromTo) is not defined in options');

        if (tweenOpts.type === 'fromTo')
            return timeline.fromTo(target, tweenOpts.options.from, tweenOptions(tweenOpts.options.to), start);

        return timeline[ tweenOpts.type ](target, tweenOptions(tweenOpts.options), start);
    });
};


/**
 * @template T
 * @template {readonly T[]} Elts
 * @param {AddToTimelineOption<Elts>} options
 */
const bindAddToTimeline = options => {
    /** @param {readonly AddToTimelineOption<Elts>[]} opts */
    return (...opts) => addToTimeline(...opts.map(option => ({ ...options, ...option })));
};

/**
 * @template T
 * @typedef {T extends readonly (infer U)[] ? U : never} InferArray
 */


/**
 * @typedef {Object} CreateTimelinesOptions
 * 
 * @property {number} [start]
 * @property {number} [stagger]
 * @property {(i: number, start: number, stagger: number) => gsap.Position} [time]
 * @property {boolean} [withScrub]
 * @property {() => gsap.core.Timeline} [createTimeline]
 */

/**
 * @template {readonly any[]} [Elts=readonly any[]]
 * @typedef {(tl: gsap.core.Timeline, element: InferArray<Elts>, index: number, globalTimeline: gsap.core.Timeline) => void} CreateAnimation
 */

/**
 * @template T
 * @template {readonly T[]} Elts
 * 
 * @param {Elts} elements
 * @param {CreateAnimation<Elts>} createAnimation
 * @param {CreateTimelinesOptions} [options]
 */
const createTimelines = (elements, createAnimation, options = {}) => {
    const {
        start = 0,
        stagger = 0,
        withScrub = false,
        createTimeline = () => gsap.timeline({ paused: withScrub, id: 'createTimelines-tl' })
    } = options;

    const time = options.time || ((i, start = 0, stagger = 0) => start + i * stagger);

    const globalTL = createTimeline();

    elements.forEach((element, i) => {
        const timeline = gsap.timeline({ paused: true /* withScrub */, id: `createTimelines-tl-${i}` });

        createAnimation(timeline, /** @type {InferArray<Elts>} */(element), i, globalTL);
        const position = time(i, start, stagger);

        globalTL.add(timeline, position);
        globalTL.to(timeline, { time: timeline.duration(), duration: timeline.duration() }, position);

        // timeline.eventCallback('onStart', () => { console.log('start', i); });
        // timeline.eventCallback('onComplete', () => { console.log('complete', i); });
    });

    // if (withScrub)
    //     tl.to(tl, { time: duration, duration });

    return { timeline: globalTL, duration: globalTL.duration() };
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


/**
 * @typedef {Object} TextSplit
 * @property {HTMLElement} container
 * @property {HTMLElement[]} groups
 * @property {HTMLElement[]} words
 * @property {HTMLElement[]} chars
 * @property {{ group: HTMLElement; words: { word: HTMLElement; chars: HTMLElement[] }[]; chars: HTMLElement[] }[] } all
 */

/**
 * @param {HTMLElement} element
 * @param {Object} [gsapOptions]
 * @param {Partial<Record<'char' | 'word' | 'group', string | RegExp>>} [gsapOptions.separator]
 * @param {Partial<Record<'char' | 'word' | 'group' | 'groups', string>>} [gsapOptions.cssClass]
 * @param {{ 
 *      group?: (options: { groupI: number; words: HTMLElement[]}) => HTMLElement;
 *      word?: (options: { groupI: number; wordI: number; chars: HTMLElement[] }) => HTMLElement;
 *      char?: (options: { groupI: number; wordI: number;  charI: number, char: string }) => HTMLElement;}
 * } [gsapOptions.createElement]
 * 
 * @returns {TextSplit}
 */
const createTextSplit = (element, options = {}) => {
    const {
        group: groupSeparator,
        word: wordSeparator = /\s+/,
        char: charSeparator = ''
    } = options.separator || {};

    const {
        groups: groupsCssClass = 'groups',
        group: groupCssClass = 'group',
        word: wordCssClass = 'word',
        char: charCssClass = 'char'
    } = options.cssClass || {};

    const {
        char: createChar = ({ charI = 0, char }) => {
            const el = document.createElement('span');
            el.append(char);
            el.classList.add(charCssClass, `${charCssClass}-${charI}`);
            return el;
        },
        word: createWord = ({ wordI, chars }) => {
            const el = document.createElement('div');
            el.classList.add(wordCssClass, `${wordCssClass}-${wordI}`);
            el.append(...chars);
            return el;
        },
        group: createGroup = ({ groupI, words }) => {
            const el = document.createElement('div');
            el.classList.add(groupCssClass, `${groupCssClass}-${groupI}`);
            el.append(...words);
            return el;
        }
    } = options.createElement || {};


    const content = element.textContent;

    if (!content)
        return { all: [], groups: [], words: [], chars: [], container: element };


    /**
     * @param {string} content
     * @param {number} groupI
     * @param {HTMLElement} container
     */
    const createWords = (content, groupI, container) => {

        const words = content.split(wordSeparator).map(w => w.trim()).filter(w => w);

        const wordsElts = words.map((w, i) => {
            const chars = w.split(charSeparator);

            const charsElts = chars.map((c, j) => createChar({ groupI, wordI: i, charI: j, char: c }));
            const wordElt = createWord({ groupI, wordI: i, chars: charsElts });

            return wordElt;
        });

        container.append(...wordsElts);

        const wordsData = wordsElts.map(word => ({
            word,
            chars: /** @type {HTMLElement[]} */([ ...word.children ])
        }));

        return {
            words: wordsData,
            chars: wordsData.flatMap(({ chars }) => chars)
        };
    };

    const createGroups = () => {
        const groups = groupSeparator ? content.split(groupSeparator).map(w => w.trim()).filter(w => w) : [ content ];

        return groups.map((groupStr, i) => {
            const wordsDiv = document.createElement('div');
            wordsDiv.classList.add('words');

            const { words, chars } = createWords(groupStr, i, wordsDiv);
            const group = createGroup({ groupI: i, words: words.map(({ word }) => word) });

            return { group, words, chars };
        });
    };

    const createSplit = () => {
        const groups = createGroups();

        if (groups.length === 1) {
            element.replaceWith(groups[ 0 ].group);
            return { groups, container: groups[ 0 ].group };
        }

        {
            const groupsDiv = document.createElement('div');
            groupsDiv.classList.add(groupsCssClass);

            groupsDiv.append(...groups.map(({ group }) => group));
            element.replaceWith(groupsDiv);

            return { groups, container: groupsDiv };
        }
    };

    const { groups, container } = createSplit();
    container.style.cssText += element.style.cssText;
    container.classList.add(...element.classList);

    return {
        container,
        all: groups,
        groups: groups.map(({ group }) => group),
        words: groups.flatMap(({ words }) => words.map(({ word }) => word)),
        chars: groups.flatMap(({ words }) => words.flatMap(({ chars }) => chars)),
    };
};


/** @type {(selector: string, el?: Element) => (HTMLElement | null)[]} */
const queryAll = (...args) => gsap.utils.toArray(...args);

/**
 * @template {string} K
 * @typedef {K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K]:
 *  K extends 'svg' ? SVGSVGElement : 
 *  K extends 'svg path' ? SVGPathElement: 
 *  HTMLElement} HTMLElementByKey
 */

/**
 * @template {string} K
 * @param {K} selector
 * @param {Element} [el]
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
 * @param {Element} [el]
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

const _ = {
    define,
    addScripts,
    createTextSplit,
    createLazySingleton: createLazySingleton,
    promisifyTimeline, createTimelines, addToTimeline, bindAddToTimeline,
    logThrottle,
    createMultipleSetTimeoutCalls,
    queryAll, queryAllThrow, queryThrow,
    onReady, onLoad: onReady('complete'), onDOMContentLoaded: onReady('interactive'),
    onEvent, onMultipleEvents, dispatchEvent, createDispatchEventOnce, EventNames,
    getElementFromRecid,
    svgImageToInline, setSvgPosition,
    getRect,
    setClassName,
    makeEaseSShape, makeEaseSymmetric
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
