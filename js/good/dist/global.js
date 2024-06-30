// common/underscore.js
(() => {
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
                case 'loading':
                    return {
                        element: document, event: 'DOMContentLoaded'
                    };
                case 'interactive':
                    return {
                        element: document, event: 'DOMContentLoaded'
                    };
                case 'complete':
                    return {
                        element: window, event: 'load'
                    };
                default:
                    return {
                        element: window, event: 'load'
                    };
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
            const {
                element,
                event
            } = getEventData();
            element.addEventListener(event, _ => tryCall(), {
                once: true,
                passive: true
            });
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
    const onEvent = (event, fn, {
        element = window,
        isCold = false,
        eventListenerOptions = {
            passive: true
        }
    } = {}) => {

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
                fn(events.reduce((acc, event) => ({
                    ...acc,
                    [ event ]: dispatchEvent.events[ event ]
                }), {}));

        }, options));


        return () => stops.forEach(stop => stop());
    };


    /**
     * @param {string} event
     * @param {any} detail
     * @param {Element | Window & typeof globalThis | undefined} el
     */
    const dispatchEvent = (event, detail = undefined, el = window) => {
        const customEvent = new CustomEvent(event, {
            detail
        });
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
        return ({
            destroy,
            isParamsEqual = Object.is
        }) => {
            let lastParams = undefined;

            const reset = () => {
                if (instance)
                    destroy?.(instance);

                instance = undefined;
            };

            const factory = /** @type {R<T, U>}*/ ({
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


            return ( /** @type {any} */ (factory));
        };
    };


    /** @param {(string|HTMLElement)[]} queries */
    const svgImageToInline = async (...queries) => {

        const images = queries.flatMap(query => typeof query === 'string' ? _.queryAllThrow(query) : query);

        await Promise.allSettled(images.map(async img => {
            try {
                const image = /** @type {HTMLImageElement} */ (img);

                const data = await fetch(image.src).then(res => res.text());

                const parser = new DOMParser();
                const svg = parser.parseFromString(data, 'image/svg+xml').querySelector('svg');

                if (!svg)
                    throw new Error('Could not parse SVG');

                if (image.id)
                    svg.id = image.id;

                if (image.className)
                    svg.classList.add(...image.classList);

                /** @type {Element} */
                (image.parentNode).replaceChild(svg, image);
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
                    script.addEventListener('load', resolve, {
                        once: true
                    });
                });
            })
        );
    };


    /** @param {() => void | Record<string, any>} fn */
    const define = fn => {
        const newStuff = fn();

        if (newStuff) {
            // @ts-ignore
            window._ = {
                ...(window._ || {}),
                ...newStuff
            };
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
     * @property {typeof import('../gallery/gallery-menu.js').galleryMenu} galleryMenu
     * @property {typeof import('../gallery/gallery-slider.js').GallerySlider} GallerySlider
     * @property {typeof import('./mouse-follow.js').createMouseFollower} createMouseFollower
     * @property {typeof import('../gallery/gallery-layout.local.js/index.js').createElements} createElements
     * @property {typeof import('../gallery/gallery-animation.js').createGalleryAnimation} createGalleryAnimation
     */



    // workaround of to merge types
    const _all = /** @type {Underscore & _Underscore} */ ( /** @type {any} */ (window)._);


    return {
        _: _all
    };

})();

// common/gsap.plugins.js
(() => {

    const addDrawSvgPlugin = () => {
        ! function (e, t) {
            "object" == typeof exports && "undefined" != typeof module ? t(exports) : "function" == typeof define && define.amd ? define([ "exports" ], t) : t((e = e || self).window = e.window || {});
        }(this, function (e) {
            "use strict";

            function l() {
                return "undefined" != typeof window;
            }

            function m() {
                return o || l() && (o = window.gsap) && o.registerPlugin && o;
            }

            function p(e) {
                return Math.round(1e4 * e) / 1e4;
            }

            function q(e) {
                return parseFloat(e) || 0;
            }

            function r(e, t) {
                var n = q(e);
                return ~e.indexOf("%") ? n / 100 * t : n;
            }

            function s(e, t) {
                return q(e.getAttribute(t));
            }

            function u(e, t, n, r, i, o) {
                return M(Math.pow((q(n) - q(e)) * i, 2) + Math.pow((q(r) - q(t)) * o, 2));
            }

            function v(e) {
                return console.warn(e);
            }

            function w(e) {
                return "non-scaling-stroke" === e.getAttribute("vector-effect");
            }

            function z() {
                return String.fromCharCode.apply(null, arguments);
            }

            function F(e) {
                if (!(e = x(e)[ 0 ]))
                    return 0;
                var t, n, r, i, o, a, f, d = e.tagName.toLowerCase(),
                    l = e.style,
                    h = 1,
                    c = 1;
                w(e) && (c = e.getScreenCTM(),
                    h = M(c.a * c.a + c.b * c.b),
                    c = M(c.d * c.d + c.c * c.c));
                try {
                    n = e.getBBox();
                } catch (e) {
                    v("Some browsers won't measure invisible elements (like display:none or masks inside defs).");
                }
                var g = n || {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                },
                    z = g.x,
                    y = g.y,
                    _ = g.width,
                    m = g.height;
                if (n && (_ || m) || !P[ d ] || (_ = s(e, P[ d ][ 0 ]),
                    m = s(e, P[ d ][ 1 ]),
                    "rect" !== d && "line" !== d && (_ *= 2,
                        m *= 2),
                    "line" === d && (z = s(e, "x1"),
                        y = s(e, "y1"),
                        _ = Math.abs(_ - z),
                        m = Math.abs(m - y))),
                    "path" === d)
                    i = l.strokeDasharray,
                        l.strokeDasharray = "none",
                        t = e.getTotalLength() || 0,
                        p(h) !== p(c) && !k && (k = 1) && v("Warning: <path> length cannot be measured when vector-effect is non-scaling-stroke and the element isn't proportionally scaled."),
                        t *= (h + c) / 2,
                        l.strokeDasharray = i;
                else if ("rect" === d)
                    t = 2 * _ * h + 2 * m * c;
                else if ("line" === d)
                    t = u(z, y, z + _, y + m, h, c);
                else if ("polyline" === d || "polygon" === d)
                    for (r = e.getAttribute("points").match(b) || [],
                        "polygon" === d && r.push(r[ 0 ], r[ 1 ]),
                        t = 0,
                        o = 2; o < r.length; o += 2)
                        t += u(r[ o - 2 ], r[ o - 1 ], r[ o ], r[ o + 1 ], h, c) || 0;
                else
                    "circle" !== d && "ellipse" !== d || (a = _ / 2 * h,
                        f = m / 2 * c,
                        t = Math.PI * (3 * (a + f) - M((3 * a + f) * (a + 3 * f))));
                return t || 0;
            }

            function G(e, t) {
                if (!(e = x(e)[ 0 ]))
                    return [ 0, 0 ];
                t = t || F(e) + 1;
                var n = f.getComputedStyle(e),
                    r = n.strokeDasharray || "",
                    i = q(n.strokeDashoffset),
                    o = r.indexOf(",");
                return o < 0 && (o = r.indexOf(" ")),
                    t < (r = o < 0 ? t : q(r.substr(0, o))) && (r = t),
                    [ -i || 0, r - i || 0 ];
            }

            function H() {
                l() && (f = window,
                    h = o = m(),
                    x = o.utils.toArray,
                    c = o.core.getStyleSaver,
                    g = o.core.reverting || function () {},
                    d = -1 !== ((f.navigator || {}).userAgent || "").indexOf("Edge"));
            }
            var o, x, f, d, h, k, c, g, b = /[-+=\.]*\d+[\.e\-\+]*\d*[e\-\+]*\d*/gi,
                P = {
                    rect: [ "width", "height" ],
                    circle: [ "r", "r" ],
                    ellipse: [ "rx", "ry" ],
                    line: [ "x2", "y2" ]
                },
                M = Math.sqrt,
                a = "DrawSVGPlugin",
                y = z(103, 114, 101, 101, 110, 115, 111, 99, 107, 46, 99, 111, 109),
                _ = z(103, 115, 97, 112, 46, 99, 111, 109),
                S = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}:?\d*$/,
                t = {
                    version: "3.12.3",
                    name: "drawSVG",
                    register: function register(e) {
                        o = e,
                            H();
                    },
                    init: function init(e, t, n) {
                        if (!e.getBBox)
                            return !1;
                        h || H();
                        var i, o, s, a = F(e);
                        return this.styles = c && c(e, "strokeDashoffset,strokeDasharray,strokeMiterlimit"),
                            this.tween = n,
                            this._style = e.style,
                            this._target = e,
                            t + "" == "true" ? t = "0 100%" : t ? -1 === (t + "").indexOf(" ") && (t = "0 " + t) : t = "0 0",
                            o = function _parse(e, t, n) {
                                var i, o, s = e.indexOf(" ");
                                return o = s < 0 ? (i = void 0 !== n ? n + "" : e,
                                    e) : (i = e.substr(0, s),
                                        e.substr(s + 1)),
                                    i = r(i, t),
                                    (o = r(o, t)) < i ? [ o, i ] : [ i, o ];
                            }(t, a, (i = G(e, a))[ 0 ]),
                            this._length = p(a),
                            this._dash = p(i[ 1 ] - i[ 0 ]),
                            this._offset = p(-i[ 0 ]),
                            this._dashPT = this.add(this, "_dash", this._dash, p(o[ 1 ] - o[ 0 ]), 0, 0, 0, 0, 0, 1),
                            this._offsetPT = this.add(this, "_offset", this._offset, p(-o[ 0 ]), 0, 0, 0, 0, 0, 1),
                            d && (s = f.getComputedStyle(e)).strokeLinecap !== s.strokeLinejoin && (o = q(s.strokeMiterlimit),
                                this.add(e.style, "strokeMiterlimit", o, o + .01)),
                            this._live = w(e) || ~(t + "").indexOf("live"),
                            this._nowrap = ~(t + "").indexOf("nowrap"),
                            this._props.push("drawSVG");
                        /*,
                                                    O;*/
                    },
                    render: function render(e, t) {
                        if (t.tween._time || !g()) {
                            var n, r, i, o, s = t._pt,
                                a = t._style;
                            if (s) {
                                for (t._live && (n = F(t._target)) !== t._length && (r = n / t._length,
                                    t._length = n,
                                    t._offsetPT && (t._offsetPT.s *= r,
                                        t._offsetPT.c *= r),
                                    t._dashPT ? (t._dashPT.s *= r,
                                        t._dashPT.c *= r) : t._dash *= r); s;)
                                    s.r(e, s.d),
                                        s = s._next;
                                i = t._dash || e && 1 !== e && 1e-4 || 0,
                                    n = t._length - i + .1,
                                    o = t._offset,
                                    i && o && i + Math.abs(o % t._length) > t._length - .2 && (o += o < 0 ? .1 : -.1) && (n += .1),
                                    a.strokeDashoffset = i ? o : o + .001,
                                    a.strokeDasharray = n < .2 ? "none" : i ? i + "px," + (t._nowrap ? 999999 : n) + "px" : "0px, 999999px";
                            }
                        } else
                            t.styles.revert();
                    },
                    getLength: F,
                    getPosition: G
                };
            m() && o.registerPlugin(t),
                e.DrawSVGPlugin = t,
                e.default = t;
            if (typeof (window) === "undefined" || window !== e) {
                Object.defineProperty(e, "__esModule", {
                    value: !0
                });
            } else {
                delete e.default;
            }
        });
    };

    addDrawSvgPlugin();

    const addSplitText = () => {
        ! function (D, u) {
            "object" == typeof exports && "undefined" != typeof module ? u(exports) : "function" == typeof define && define.amd ? define([ "exports" ], u) : u((D = D || self).window = D.window || {});
        }(this, function (u) {
            "use strict";
            var b = /([\uD800-\uDBFF][\uDC00-\uDFFF](?:[\u200D\uFE0F][\uD800-\uDBFF][\uDC00-\uDFFF]){2,}|\uD83D\uDC69(?:\u200D(?:(?:\uD83D\uDC69\u200D)?\uD83D\uDC67|(?:\uD83D\uDC69\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]\uFE0F|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC6F\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3C-\uDD3E\uDDD6-\uDDDF])\u200D[\u2640\u2642]\uFE0F|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F\u200D[\u2640\u2642]|(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642])\uFE0F|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\uD83D\uDC69\u200D[\u2695\u2696\u2708]|\uD83D\uDC68(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708]))\uFE0F|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83D\uDC69\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]))|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\u200D(?:(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDD1-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])?|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])\uFE0F)/;

            function n(D) {
                U = document, e = window, (i = i || D || e.gsap || console.warn("Please gsap.registerPlugin(SplitText)")) && (r = i.utils.toArray, s = i.core.context || function () {}, t = 1);
            }

            function q() {
                return String.fromCharCode.apply(null, arguments);
            }

            function v(D) {
                return e.getComputedStyle(D);
            }

            function w(D) {
                return "absolute" === D.position || !0 === D.absolute;
            }

            function x(D, u) {
                for (var e, t = u.length; - 1 < --t;)
                    if (e = u[ t ], D.substr(0, e.length) === e) return e.length;
            }

            function z(D, u) {
                void 0 === D && (D = "");
                var e = ~D.indexOf("++"),
                    t = 1;
                return e && (D = D.split("++").join("")),
                    function () {
                        return "<" + u + " style='position:relative;display:inline-block;'" + (D ? " class='" + D + (e ? t++ : "") + "'>" : ">");
                    };
            }

            function A(D, u, e) {
                var t = D.nodeType;
                if (1 === t || 9 === t || 11 === t)
                    for (D = D.firstChild; D; D = D.nextSibling) A(D, u, e);
                else 3 !== t && 4 !== t || (D.nodeValue = D.nodeValue.split(u).join(e));
            }

            function B(D, u) {
                for (var e = u.length; - 1 < --e;) D.push(u[ e ]);
            }

            function C(D, u, e) {
                for (var t; D && D !== u;) {
                    if (t = D._next || D.nextSibling) return t.textContent.charAt(0) === e;
                    D = D.parentNode || D._parent;
                }
            }

            function D(u) {
                var e, t, F = r(u.childNodes),
                    i = F.length;
                for (e = 0; e < i; e++)(t = F[ e ])._isSplit ? D(t) : e && t.previousSibling && 3 === t.previousSibling.nodeType ? (t.previousSibling.nodeValue += 3 === t.nodeType ? t.nodeValue : t.firstChild.nodeValue, u.removeChild(t)) : 3 !== t.nodeType && (u.insertBefore(t.firstChild, t), u.removeChild(t));
            }

            function E(D, u) {
                return parseFloat(u[ D ]) || 0;
            }

            function F(u, e, t, F, i, n, s) {
                var r, o, l, d, a, p, h, f, c, g, x, y, b = v(u),
                    S = E("paddingLeft", b),
                    _ = -999,
                    m = E("borderBottomWidth", b) + E("borderTopWidth", b),
                    q = E("borderLeftWidth", b) + E("borderRightWidth", b),
                    T = E("paddingTop", b) + E("paddingBottom", b),
                    N = E("paddingLeft", b) + E("paddingRight", b),
                    L = E("fontSize", b) * (e.lineThreshold || .2),
                    W = b.textAlign,
                    H = [],
                    O = [],
                    j = [],
                    k = e.wordDelimiter || " ",
                    V = e.tag ? e.tag : e.span ? "span" : "div",
                    M = e.type || e.split || "chars,words,lines",
                    R = i && ~M.indexOf("lines") ? [] : null,
                    P = ~M.indexOf("words"),
                    z = ~M.indexOf("chars"),
                    G = w(e),
                    $ = e.linesClass,
                    I = ~($ || "").indexOf("++"),
                    J = [],
                    K = "flex" === b.display,
                    Q = u.style.display;
                for (I && ($ = $.split("++").join("")), K && (u.style.display = "block"), l = (o = u.getElementsByTagName("*")).length, a = [], r = 0; r < l; r++) a[ r ] = o[ r ];
                if (R || G)
                    for (r = 0; r < l; r++)((p = (d = a[ r ]).parentNode === u) || G || z && !P) && (y = d.offsetTop, R && p && Math.abs(y - _) > L && ("BR" !== d.nodeName || 0 === r) && (h = [], R.push(h), _ = y), G && (d._x = d.offsetLeft, d._y = y, d._w = d.offsetWidth, d._h = d.offsetHeight), R && ((d._isSplit && p || !z && p || P && p || !P && d.parentNode.parentNode === u && !d.parentNode._isSplit) && (h.push(d), d._x -= S, C(d, u, k) && (d._wordEnd = !0)), "BR" === d.nodeName && (d.nextSibling && "BR" === d.nextSibling.nodeName || 0 === r) && R.push([])));
                for (r = 0; r < l; r++)
                    if (p = (d = a[ r ]).parentNode === u, "BR" !== d.nodeName)
                        if (G && (c = d.style, P || p || (d._x += d.parentNode._x, d._y += d.parentNode._y), c.left = d._x + "px", c.top = d._y + "px", c.position = "absolute", c.display = "block", c.width = d._w + 1 + "px", c.height = d._h + "px"), !P && z)
                            if (d._isSplit)
                                for (d._next = o = d.nextSibling, d.parentNode.appendChild(d); o && 3 === o.nodeType && " " === o.textContent;) d._next = o.nextSibling, d.parentNode.appendChild(o), o = o.nextSibling;
                            else d.parentNode._isSplit ? (d._parent = d.parentNode, !d.previousSibling && d.firstChild && (d.firstChild._isFirst = !0), d.nextSibling && " " === d.nextSibling.textContent && !d.nextSibling.nextSibling && J.push(d.nextSibling), d._next = d.nextSibling && d.nextSibling._isFirst ? null : d.nextSibling, d.parentNode.removeChild(d), a.splice(r--, 1), l--) : p || (y = !d.nextSibling && C(d.parentNode, u, k), d.parentNode._parent && d.parentNode._parent.appendChild(d), y && d.parentNode.appendChild(U.createTextNode(" ")), "span" === V && (d.style.display = "inline"), H.push(d));
                        else d.parentNode._isSplit && !d._isSplit && "" !== d.innerHTML ? O.push(d) : z && !d._isSplit && ("span" === V && (d.style.display = "inline"), H.push(d));
                    else R || G ? (d.parentNode && d.parentNode.removeChild(d), a.splice(r--, 1), l--) : P || u.appendChild(d);
                for (r = J.length; - 1 < --r;) J[ r ].parentNode.removeChild(J[ r ]);
                if (R) {
                    for (G && (g = U.createElement(V), u.appendChild(g), x = g.offsetWidth + "px", y = g.offsetParent === u ? 0 : u.offsetLeft, u.removeChild(g)), c = u.style.cssText, u.style.cssText = "display:none;"; u.firstChild;) u.removeChild(u.firstChild);
                    for (f = " " === k && (!G || !P && !z), r = 0; r < R.length; r++) {
                        for (h = R[ r ], (g = U.createElement(V)).style.cssText = "display:block;text-align:" + W + ";position:" + (G ? "absolute;" : "relative;"), $ && (g.className = $ + (I ? r + 1 : "")), j.push(g), l = h.length, o = 0; o < l; o++) "BR" !== h[ o ].nodeName && (d = h[ o ], g.appendChild(d), f && d._wordEnd && g.appendChild(U.createTextNode(" ")), G && (0 === o && (g.style.top = d._y + "px", g.style.left = S + y + "px"), d.style.top = "0px", y && (d.style.left = d._x - y + "px")));
                        0 === l ? g.innerHTML = "&nbsp;" : P || z || (D(g), A(g, String.fromCharCode(160), " ")), G && (g.style.width = x, g.style.height = d._h + "px"), u.appendChild(g);
                    }
                    u.style.cssText = c;
                }
                G && (s > u.clientHeight && (u.style.height = s - T + "px", u.clientHeight < s && (u.style.height = s + m + "px")), n > u.clientWidth && (u.style.width = n - N + "px", u.clientWidth < n && (u.style.width = n + q + "px"))), K && (Q ? u.style.display = Q : u.style.removeProperty("display")), B(t, H), P && B(F, O), B(i, j);
            }

            function G(D, u, e, t) {
                function sb(D) {
                    return D === p || D === m && " " === p;
                }
                var F, i, n, C, s, E, r, o, l = u.tag ? u.tag : u.span ? "span" : "div",
                    d = ~(u.type || u.split || "chars,words,lines").indexOf("chars"),
                    a = w(u),
                    p = u.wordDelimiter || " ",
                    h = " " !== p ? "" : a ? "&#173; " : " ",
                    f = "</" + l + ">",
                    B = 1,
                    c = u.specialChars ? "function" == typeof u.specialChars ? u.specialChars : x : null,
                    g = U.createElement("div"),
                    y = D.parentNode;
                for (y.insertBefore(g, D), g.textContent = D.nodeValue, y.removeChild(D), r = -1 !== (F = function getText(D) {
                    var u = D.nodeType,
                        e = "";
                    if (1 === u || 9 === u || 11 === u) {
                        if ("string" == typeof D.textContent) return D.textContent;
                        for (D = D.firstChild; D; D = D.nextSibling) e += getText(D);
                    } else if (3 === u || 4 === u) return D.nodeValue;
                    return e;
                }(D = g)).indexOf("<"), !1 !== u.reduceWhiteSpace && (F = F.replace(_, " ").replace(S, "")), r && (F = F.split("<").join("{{LT}}")), s = F.length, i = (" " === F.charAt(0) ? h : "") + e(), n = 0; n < s; n++)
                    if (E = F.charAt(n), c && (o = c(F.substr(n), u.specialChars))) E = F.substr(n, o || 1), i += d && " " !== E ? t() + E + "</" + l + ">" : E, n += o - 1;
                    else if (sb(E) && !sb(F.charAt(n - 1)) && n) {
                        for (i += B ? f : "", B = 0; sb(F.charAt(n + 1));) i += h, n++;
                        n === s - 1 ? i += h : ")" !== F.charAt(n + 1) && (i += h + e(), B = 1);
                    } else "{" === E && "{{LT}}" === F.substr(n, 6) ? (i += d ? t() + "{{LT}}</" + l + ">" : "{{LT}}", n += 5) : 55296 <= E.charCodeAt(0) && E.charCodeAt(0) <= 56319 || 65024 <= F.charCodeAt(n + 1) && F.charCodeAt(n + 1) <= 65039 ? (C = ((F.substr(n, 12).split(b) || [])[ 1 ] || "").length || 2, i += d && " " !== E ? t() + F.substr(n, C) + "</" + l + ">" : F.substr(n, C), n += C - 1) : i += d && " " !== E ? t() + E + "</" + l + ">" : E;
                D.outerHTML = i + (B ? f : ""), r && A(y, "{{LT}}", "<");
            }

            function H(D, u, e, t) {
                var F, i, n = r(D.childNodes),
                    C = n.length,
                    s = w(u);
                if (3 !== D.nodeType || 1 < C) {
                    for (u.absolute = !1, F = 0; F < C; F++)(i = n[ F ])._next = i._isFirst = i._parent = i._wordEnd = null, 3 === i.nodeType && !/\S+/.test(i.nodeValue) || (s && 3 !== i.nodeType && "inline" === v(i).display && (i.style.display = "inline-block", i.style.position = "relative"), i._isSplit = !0, H(i, u, e, t));
                    return u.absolute = s, void (D._isSplit = !0);
                }
                G(D, u, e, t);
            }
            var U, e, t, i, s, r, o, S = /(?:\r|\n|\t\t)/g,
                _ = /(?:\s\s+)/g,
                m = String.fromCharCode(160),
                l = "SplitText",
                d = q(103, 114, 101, 101, 110, 115, 111, 99, 107, 46, 99, 111, 109),
                a = q(103, 115, 97, 112, 46, 99, 111, 109),
                p = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}:?\d*$/,
                f = ((o = SplitText.prototype).split = function split(D) {
                    this.isSplit && this.revert(), this.vars = D = D || this.vars, this._originals.length = this.chars.length = this.words.length = this.lines.length = 0;
                    for (var u, e, t, i = this.elements.length, n = D.tag ? D.tag : D.span ? "span" : "div", C = z(D.wordsClass, n), s = z(D.charsClass, n); - 1 < --i;) t = this.elements[ i ], this._originals[ i ] = {
                        html: t.innerHTML,
                        style: t.getAttribute("style")
                    }, u = t.clientHeight, e = t.clientWidth, H(t, D, C, s), F(t, D, this.chars, this.words, this.lines, e, u);
                    return this.chars.reverse(), this.words.reverse(), this.lines.reverse(), this.isSplit = !0, this;
                }, o.revert = function revert() {
                    var e = this._originals;
                    if (!e) throw "revert() call wasn't scoped properly.";
                    return this.elements.forEach(function (D, u) {
                        D.innerHTML = e[ u ].html, D.setAttribute("style", e[ u ].style);
                    }), this.chars = [], this.words = [], this.lines = [], this.isSplit = !1, this;
                }, SplitText.create = function create(D, u) {
                    return new SplitText(D, u);
                }, SplitText);

            function SplitText(D, u) {
                t || n(), this.elements = r(D), this.chars = [], this.words = [], this.lines = [], this._originals = [], this.vars = u || {}, s(this), /*h &&*/ this.split(u);
            }
            f.version = "3.12.3", f.register = n, u.SplitText = f, u.default = f;
            if (typeof (window) === "undefined" || window !== u) {
                Object.defineProperty(u, "__esModule", {
                    value: !0
                });
            } else {
                delete u.default;
            }
        });
    };

    addSplitText();

})();
