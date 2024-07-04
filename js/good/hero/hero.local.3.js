// @ts-check
import { _ } from '../../lib/underscore.js';
import * as dummy from '../../lib/underscore.js';
import { gsap as _gsap } from '../../../../node_modules/gsap/index.js';
import { registerGsapPlugins } from '../../lib/gsap-plugins.umd.js';


const gsap =/** @type {import('gsap')['gsap']} */(/** @type {any} */(_gsap));
Object.assign(window, { gsap });

const getModules = async (...modules) => {
    const exports = (await Promise.allSettled(modules)).map(res => res.status === 'fulfilled' ? res.value : undefined);

    return exports.reduce((mods, mod) => ({ ...mods, ...mod }), {});
};


Object.assign(window, await getModules(
    import('../../../../node_modules/gsap/ScrollTrigger.js'),
    import('../../../../node_modules/gsap/CustomEase.js'),
    import('../../../../node_modules/gsap/Flip.js'),
    import('../../../../node_modules/gsap/ScrollToPlugin.js')
));


gsap.registerPlugin(Flip);
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);

registerGsapPlugins();

(await import('../../lib/GSDevTools3.min.js')).registerGSDevTools();


_.EventNames.hero = {
    firstScrubDone: 'hero:first-scrub-done'
};

/**
 * @template T
 * @typedef {T extends readonly (infer U)[] ? U : never} InferArray
 */

/**
 * @template T
 * @template {readonly T[]} Elts
 * 
 * @param {Elts} elements
 * @param {(tl: gsap.core.Timeline, element: InferArray<Elts>, index: number, globalTimeline: gsap.core.Timeline) => void} createAnimation
 * @param {Object} [gsapOptions]
 * @param {() => gsap.core.Timeline} [gsapOptions.createTimeline]
 * @param {number} [gsapOptions.start]
 * @param {number} [gsapOptions.stagger]
 * @param {(i: number, start: number, stagger: number) => gsap.Position} [gsapOptions.time]
 * @param {boolean} [gsapOptions.withScrub]
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

/**
 * @param {HTMLElement} element
 * @param {Object} opts
 * @param {HTMLElement} opts.to,
 * @param {'xy' | 'top-left'} [opts.type]
 * @param {boolean} [opts.usePercent]
 * @param {(element: HTMLElement) => Rect<number, 'xy'>} [opts.getRect]
 * @param {AbsoluteRectOptions<'xy'>} [opts.getAbsoluteRectOptions]
 */
const getPositionElementTo = (element, opts) => {
    const {
        to,
        type = 'xy',
        usePercent = false,
        getRect = el => getAbsoluteRect(el, { ...opts.getAbsoluteRectOptions, type: POSITION_TYPE.XY })
    } = opts;

    const getLazyPosition = getLazyData(
        type === 'xy' ? /** @type {const} */([ 'x', 'y' ]) : /** @type {const} */([ 'top', 'left' ]),
        prop => {

            const elemRect = getRect(element);
            const toRect = getRect(to);

            const diff = diff2D(elemRect, toRect);

            if (usePercent) {
                diff.x = 100 * diff.x / toRect.x;
                diff.y = 100 * diff.y / toRect.y;
            }

            if (type === 'top-left') {
                diff.left = diff.x;
                diff.top = diff.y;
            }

            return `+=${Math.round(diff[ prop ])}${usePercent ? '%' : ''}`;
        });

    // return gsap.to(element, {
    //     ...getLazyPosition,
    //     duration: 0,
    //     ease: 'power2.out',
    //     ...gsapOptions
    // });
    return getLazyPosition;
};

const initHero = async () => {

    const heroBlock = _.queryThrow('.uc-hero-block');
    // const heroBlockImg = _.queryThrow('.uc-hero-img-copy');
    const signatureBlock = _.queryThrow('.uc-signature');
    const notreDameBlock = _.queryThrow('.uc-notre-dame-block');

    signatureBlock.classList.remove('r_hidden', 'r_anim');
    // heroBlockImg.classList.remove('r_hidden', 'r_anim');

    _.queryThrow('img', heroBlock).classList.add('gallery');
    _.queryThrow('img', signatureBlock).classList.add('signature');
    _.queryThrow('img', notreDameBlock).classList.add('notre-dame');

    await _.svgImageToInline(
        _.queryThrow('img', heroBlock),
        _.queryThrow('img', signatureBlock),
        _.queryThrow('img', notreDameBlock)
    );


    heroBlock.classList.add('svg-active');
    // heroBlockImg.classList.add('svg-active');

    heroBlock.append(signatureBlock);

    return { heroBlock, signatureBlock, notreDameBlock };
};

/** @typedef {Awaited<ReturnType<typeof initHero>>} HeroElements */



/** @param {Pick<HeroElements,'signatureBlock'>} params */
const createSignatureSignatureAnimation = ({ signatureBlock }) => {
    const tl = gsap.timeline({ id: 'signature-tl' });

    const apparitionTL = gsap.timeline({ id: 'apparition-tl' });
    apparitionTL.to(signatureBlock, { opacity: 1, duration: 1, ease: 'power2.in' });

    const signaturePaths = /** @type {SVGPathElement[]} */ (/** @type {unknown} */(_.queryAllThrow('svg path', signatureBlock)));

    const drawTl = gsap.timeline({ id: 'draw-tl', paused: true });
    const duration = 2;

    const getLength = DrawSVGPlugin.getLength;
    /** @param {gsap.DrawSVGTarget} path */
    const getProportion = path => getLength(path) / totalLength;

    const totalLength = signaturePaths.reduce((total, path) => total + getLength(path), 0);

    signaturePaths.forEach(path => drawTl.from(path, { duration: getProportion(path) * duration, drawSVG: 0 }));


    tl.add(apparitionTL);
    tl.add(drawTl, 0.5);

    tl.to(drawTl, {
        time: drawTl.duration(),
        duration: drawTl.duration(),
        ease: 'power1.inOut'
    }, 0.5);

    // GSDevTools.create({ animation: tl });
    return tl;
};

/**
* @template [T=number]
* @template {'xy' | 'top-left'} [Type='top-left']
* @typedef {Record<(Type extends 'top-left' ? 'top' | 'left' : 'x' | 'y') | 'width' | 'height', T>} Rect
*/

const POSITION_TYPE =/** @type {const} */({
    XY: 'xy',
    TOP_LEFT: 'top-left'
});


/** @param {number} nb */
const round2Decimals = nb => Math.round(nb * 100) / 100;

/**
 * @template {'xy' | 'top-left'} [T='top-left']
 * 
 * @typedef {Object} AbsoluteRectOptions
 * @property {T} [options.type]
 * @property {boolean} [options.useCssSize]
 */


/**
 * @template {'xy' | 'top-left'} [T='top-left']
 * 
 * @param {Element} element
 * @param {AbsoluteRectOptions<T>} [options]
 */
const getAbsoluteRect = (element, { type = /** @type {T} */(POSITION_TYPE.TOP_LEFT), useCssSize = false } = {}) => {
    const rect = element.getBoundingClientRect();

    const top = window.scrollY + rect.top;
    const left = window.scrollX + rect.left;

    const getSize = () => {
        if (useCssSize) {
            const style = getComputedStyle(element);

            /**  @param {keyof CSSStyleDeclaration} prop */
            const parseNb = prop => {
                const value = style[ prop ];
                return typeof value === 'string' ? parseFloat(value.replace('px', '')) : 0;
            };

            return {
                width: parseNb('width'),
                height: parseNb('height')
            };
        }

        return { width: rect.width, height: rect.height };
    };

    return /** @type {Rect<number, T>} */({
        ...(type === 'top-left' ? { top, left } : { x: left, y: top }),
        ...getSize()
    });
};

/** @param {Rect<number, 'xy'>} rect */
const centerOfRect = rect => ({ ...rect, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });


/**
 * @template {readonly string[]} Props
 * @template T
 * @template {InferArray<Props>} Prop
 * @template {(index: number, target: Element, targets: Element[]) => T} LazyFactory
 * 
 * @param {Props} props
 * @param {(prop: Prop, index: number, target: Element, targets: Element[]) =>  T} getData
 */
const getLazyData = (props, getData) => /** @type {Record<Prop,  LazyFactory>} */(Object.fromEntries(
    props.map(prop => [ prop, (index, target, targets) => getData(/** @type {any} */(prop), index, target, targets) ])
));

/** @param {Element} element */
const getLazySize = element => getLazyData([ 'width', 'height' ], prop => getAbsoluteRect(element)[ prop ]);

/**
 * @template {'xy' | 'top-left'} [T='top-left']
 * 
 * @param {Element} element
 * @param {AbsoluteRectOptions<T>} [options]
 */
const getLazyPosition = (element, options) => getLazyData(
    /** @type {const} */([ ...(options?.type === 'xy' ? [ 'x', 'y' ] : [ 'top', 'left' ]), 'width', 'height' ]),
    prop => getAbsoluteRect(element, options)[ prop ]
);

/**
 * @param {{ x: number; y: number; }} X1 
 * @param {{ x: number; y: number; }} X2 
 */
const diff2D = (X1, X2) => ({ x: X2.x - X1.x, y: X2.y - X1.y });




/** @param {HeroElements} params */
const createHeroToImagePinAnimation = ({ heroBlock, signatureBlock, notreDameBlock }) => {

    const prepareLayoutForAnimation = () => {
        const heroContainer = _.queryThrow('.t107', heroBlock);


        const notreDameTitle = _.queryThrow('.uc-nd-title-block h3');
        const notreDameHand = _.queryThrow('svg .notre-dame-hand', notreDameBlock);
        const notreDameSky = _.queryThrow('svg .notre-dame-sky', notreDameBlock);

        const centralPainting = _.queryThrow('#painting-5', heroContainer);

        // notreDameTitle.classList.add('hand-font');

        notreDameBlock.append(notreDameTitle);
        heroBlock.append(notreDameBlock);

        gsap.set(notreDameBlock, { autoAlpha: 0 });

        // _.queryThrow('img', notreDameBlock).dataset.lazyRule = 'skip'; // optimoff


        const createNotreDameImageInPainting = () => {
            const notreDameImgInPainting = /** @type {HTMLImageElement} */(_.queryThrow('svg', notreDameBlock).cloneNode(true));

            notreDameImgInPainting.classList.add('clone', 'notre-dame-in-painting');

            heroContainer.append(notreDameImgInPainting);
            return notreDameImgInPainting;
        };


        const notreDameImgInPainting = createNotreDameImageInPainting();

        /**
         * @param {Object} [params]
         * @param {number} [params.heroScale]
         * @param {gsap.core.Timeline} [params.timeline]
         */
        const updateLayout = ({ heroScale = 1, timeline } = {}) => {
            const tl = timeline || gsap;

            const setHeroTransformOriginInPaintingCenter = () => {
                const heroRect = heroBlock.getBoundingClientRect();
                const paintingRect = centralPainting.getBoundingClientRect();


                /**
                 * @param {number} a
                 */
                const half = a => a / 2;

                const delta = {
                    x: half(heroRect.width - paintingRect.width / heroScale) / heroRect.width,
                    y: half(heroRect.height - paintingRect.height / heroScale) / heroRect.height,
                };

                tl.set(heroContainer, { transformOrigin: `${50 - delta.x}% ${50 - delta.y}%`, });
            };

            tl.set(notreDameImgInPainting, { ...getPositionElementTo(notreDameImgInPainting, { to: centralPainting, type: 'xy' }) });

            tl.set(notreDameImgInPainting, {
                position: 'absolute',
                // ...getAbsoluteRect(centralPainting, { useCssSize: false }),
                // ...getLazyData([ 'top', 'left', ],
                //     prop => getAbsoluteRect(centralPainting)[ prop ]
                // ),
                ...getLazyData([ 'width', 'height' ],
                    prop => getAbsoluteRect(centralPainting)[ prop ] / heroScale
                )
            });

            setHeroTransformOriginInPaintingCenter();
        };

        updateLayout();

        gsap.set(notreDameImgInPainting, { opacity: 0 });

        // _.setSvgPosition(/** @type {SVGSVGElement} */(/** @type {unknown} */(_.queryThrow('svg', notreDameBlock))), { x: 0.8, y: 0.5 });

        return { centralPainting, heroContainer, notreDameImgInPainting, notreDameBlock, notreDameTitle, notreDameHand, notreDameSky, updateLayout };
    };

    const createAnimation = () => {
        const {
            centralPainting, heroContainer, notreDameImgInPainting, notreDameBlock: notreDame, notreDameTitle, notreDameHand, updateLayout
        } = prepareLayoutForAnimation();

        const tlScrub = gsap.timeline({
            scrollTrigger: {
                onLeave: _.createDispatchEventOnce(_.EventNames.hero.firstScrubDone),
                markers: true,
                trigger: heroBlock,
                scrub: 1,
                pin: heroBlock,
                toggleActions: 'restart complete reverse reset',
                start: 'top=50 top',
                end: 'bottom+=200% top',
                invalidateOnRefresh: false,
                onRefresh: () => {
                    // updateLayouts.forEach(({ update }) => update());
                    console.log('onRefresh');
                }
            },
            id: 'hero-scrub-tl',
            onStart: () => {
                console.log('onStart');
                // updateLayout();
                // if (!isFirst) {
                //     isFirst = true;
                //     return;
                // }


                // updateLayouts.forEach(({ update }) => update());
            }
        });

        updateLayout();

        let isFirst = false;
        const resizeObserver = new ResizeObserver(entries => {
            if (!isFirst) {
                isFirst = true;
                return;
            }



            // entries.forEach(({ target }) => {
            //     const u = updateLayouts.find(({ target: t }) => t === target);
            //     console.log('resizeObserver', target.classList/* , u?.update */, u?.target.getBoundingClientRect().width);
            //     updateLayouts.find(({ target: t }) => t === target)?.update();
            // });

            //  tlScrub.scrollTrigger?.update(false);
            // tlScrub.restart();
            // const s = tlScrub.scrollTrigger?.scroll();
            // tlScrub.scrollTrigger?.scroll(0);
            // tlScrub.scrollTrigger?.scroll(s);
            console.log('resizeObserver');
            const to = tlScrub.time();
            tlScrub.time(0);
            tlScrub.invalidate();
            console.log('resizeObserve 0');
            // tlScrub.restart();

            tlScrub.tweenTo(to);
            console.log('resizeObserve ' + to);

        });

        const updateLayouts = [
            {
                target: _.queryThrow('svg', heroBlock),
                update: () => {
                    const heroScale = gsap.getProperty(heroContainer, 'scale');
                    // updateLayout({ heroScale: gsap.getProperty(heroContainer, 'scale') });
                    // gsap.set(notreDameImgInPainting, { ...getPositionElementTo(notreDameImgInPainting, { to: centralPainting, type: 'xy' }) });

                    gsap.set(notreDameImgInPainting, {
                        position: 'absolute',
                        // ...getAbsoluteRect(centralPainting, { useCssSize: false }),
                        // ...getLazyData([ 'top', 'left', ],
                        //     prop => getAbsoluteRect(centralPainting)[ prop ]
                        // ),
                        ...getLazyData([ 'width', 'height' ],
                            prop => getAbsoluteRect(centralPainting)[ prop ] / heroScale
                        )
                    });

                    gsap.set(notreDameElements.notreDame, {
                        ...getPositionElementTo(notreDameElements.notreDame, { to: centralPainting, type: 'top-left' }),
                        ...getLazyData([ 'width', 'height' ], prop => getAbsoluteRect(centralPainting)[ prop ]),
                    });

                    // tlScrub.scrollTrigger?.update(true);
                    tlScrub.scrollTrigger?.update(true);

                }
            },
            {
                target: _.queryThrow('svg .notre-dame-sky', notreDameBlock),
                update: () => {
                    gsap.set(titleSplit.container, {
                        ...getPositionElementTo(titleSplit.container, { to: _.queryThrow('svg .notre-dame-sky', notreDameBlock) })
                    });
                }
            }
        ];

        tlScrub.set(notreDameImgInPainting, {
            position: 'absolute',
            ...getPositionElementTo(notreDameImgInPainting, { to: centralPainting, type: 'xy' }),
            ...getLazyData([ 'width', 'height' ], prop => getAbsoluteRect(centralPainting)[ prop ]),
            onComplete: () => {
                console.log('onComplete');
            }
        }, 0);

        // tlScrub.set(notreDameBlock, {
        //     ...getPositionElementTo(notreDameBlock, { to: centralPainting, type: 'top-left' }),
        //     ...getLazyData([ 'width', 'height' ], prop => getAbsoluteRect(centralPainting)[ prop ]),
        //     left: () => {
        //         return getPositionElementTo(notreDameBlock, { to: centralPainting, type: 'top-left' }).left;
        //     },
        // }, 0);

        // resizeObserver.observe(_.queryThrow('svg', heroBlock));
        updateLayouts.forEach(({ target }) => resizeObserver.observe(target));

        _.onEvent(_.EventNames.resize, _.createMultipleSetTimeoutCalls(() => {
            // console.log('resize');
            // updateLayout({ heroScale: gsap.getProperty(heroContainer, 'scale') });

            // gsap.set(notreDameElements.notreDame, {
            //     ...getPositionElementTo(notreDameElements.notreDame, { to: centralPainting, type: 'top-left' }),
            //     autoAlpha: 1,
            // });

            // gsap.set(titleSplit.container, {
            //     ...getPositionElementTo(titleSplit.container, { to: _.queryThrow('svg .notre-dame-sky', notreDameBlock) })
            // });

            // tlScrub.invalidate();

            // tlScrub.tweenTo(tlScrub.time());
            // const scroll = tlScrub.scrollTrigger?.scroll();
            // tlScrub.scrollTrigger?.scroll(0);

            // gsap.set(notreDameImgInPainting, {
            //     ...getAbsoluteRect(centralPainting, { useCssSize: false }),
            // });

            // gsap.set(notreDameElements.notreDame, {
            //     ...getAbsoluteRect(centralPainting, { useCssSize: false }),
            // });

            //  tlScrub.scrollTrigger?.scroll(scroll);

            // ScrollTrigger.refresh(true);
        }, [ 0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 ]));

        GSDevTools.create({ animation: tlScrub });

        const heroElements = {
            signature: signatureBlock,
            hero: heroContainer,
            notreDameImgInPainting,
            centralPainting,
            notreDame: notreDameBlock
        };



        const titleSplit = _.createTextSplit(notreDameTitle, {
            separator: { group: /\s*#\s*/ },
            createElement: {
                char: ({ charI, char }) => {
                    const charEl = document.createElement('span');
                    charEl.append(char);

                    const div = document.createElement('div');
                    div.append(charEl);

                    div.classList.add('char-wrapper', `char-wrapper-${charI}`);
                    charEl.classList.add('char', `char-${charI}`);

                    return div;
                }
            },
            cssClass: {
                groups: 'notre-dame-title',
                group: 'group',
                word: 'word',
                char: 'char'
            }
        });


        // _.onEvent(_.EventNames.resize, () => {
        //     setPositionElementTo(notreDameTitle, { to: titleSplit.container });
        // });


        const notreDameElements = {
            notreDame,
            notreDameTitle: titleSplit.container,
            notreDameTitleChars: titleSplit.chars,
            notreDameTitleWords: titleSplit.words,
            notreDameTitleCharsCharWrappers: titleSplit.words.flatMap(word => _.queryAllThrow('.char-wrapper', word))
        };

        // because of a bug with scrollTrigger when page loads when scrollTrigger is not 0
        // we wait the scrub is done with notreDameImgInPainting animation to get the position of notreDameImgInPainting

        const updateLayout2 = () => {

            // tl.set(notreDameImgInPainting, {
            //     ...getLazyPosition(centralPainting, { useCssSize: false }),
            // }, 0);
            tlScrub.set(notreDameImgInPainting, {
                ...getLazyData([ 'top', 'left', ],
                    prop => getAbsoluteRect(centralPainting)[ prop ]
                ),
                ...getLazyData([ 'width', 'height' ],
                    prop => getAbsoluteRect(centralPainting)[ prop ] / gsap.getProperty(heroContainer, 'scale')
                )
            }, 0);

            /**
             * @param {number} a
             */
            const half = a => a / 2;



            tlScrub.set(heroContainer, {
                transformOrigin: () => {
                    const heroRect = heroBlock.getBoundingClientRect();
                    const paintingRect = centralPainting.getBoundingClientRect();

                    const s = gsap.getProperty(heroContainer, 'scale');

                    const delta = {
                        x: (half(heroRect.width - paintingRect.width / s) / heroRect.width),
                        y: (half(heroRect.height - paintingRect.height / s) / heroRect.height),
                    };

                    return `${50 - delta.x}% ${50 - delta.y}%`;
                }
            }, 0);

            // tl.set(notreDameElements.notreDame, {
            //     ...getLazyPosition(notreDameImgInPainting, { useCssSize: false }),
            //     autoAlpha: 1,
            //     id: 'notre-dame-position'
            // }, 0);
            heroSettings.notreDame.timeline.set(notreDameElements.notreDame, {
                autoAlpha: 1,
                ...getLazyData([ 'top', 'left', ], prop => getAbsoluteRect(centralPainting)[ prop ]),
                ...getLazyData([ 'width', 'height' ], prop => getAbsoluteRect(centralPainting)[ prop ])
            }, 0);
        };


        /**
         * @satisfies {import('../../lib/underscore.js').AnimationsSettings<typeof heroElements>}
         */
        const heroSettings = {
            signature: {
                start: 0,
                duration: 0.5,
                options: {
                    id: 'signature',
                    opacity: 0,
                    duration: 0.5,
                    ease: 'expo.out'
                }
            },
            hero: {
                start: 0.01,
                duration: 1,
                options: {
                    id: 'hero',
                    scale: 1.5,
                    ease: 'power2.inOut'
                }
            },
            notreDameImgInPainting: {
                start: 0.2,
                duration: 0.6,
                options: {
                    id: 'notreDameImgInPainting',
                    opacity: 1,
                    ease: 'power2.inOut'
                }
            },
            centralPainting: {
                start: 0.2,
                duration: 0.6,
                options: {
                    id: 'centralPainting',
                    opacity: 0,
                    ease: 'power2.inOut'
                }
            },
            notreDame: {
                start: '+=0.01',
                type: 'timeline',
                timeline: gsap.timeline({ id: 'notre-dame-tl' })
            }
        };

        // _.onEvent(_.EventNames.resize, _.createMultipleSetTimeoutCalls(() => {
        //     gsap.set(titleSplit.container, {
        //         ...getPositionElementTo(titleSplit.container, {
        //             to: _.queryThrow('svg .notre-dame-sky', notreDameBlock),
        //             // type: 'top-left',
        //             // usePercent: true
        //         })
        //     });
        // }, [ 0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 ]));







        /**
         * @param {import('../../lib/underscore.js').AddToTimelineTarget<typeof heroElements>} target
         * @param {import('../../lib/underscore.js').AddToTimelineOptions} [options]
         */
        const addToScrub = (target, options = {}) => {
            return _.addToTimeline({ timeline: tlScrub, target, elements: heroElements, animationsSettings: heroSettings, options });
        };


        /**
         * @param {import('../../lib/underscore.js').AddToTimelineTarget<typeof notreDameElements>} target
         * @param {import('../../lib/underscore.js').AddToTimelineOptions} [options]
         */
        // const addToNotreDame = (target, options = {}) => {
        //     return _.addToTimeline({
        //         timeline: heroSettings.notreDame.timeline, target, elements: notreDameElements, animationsSettings: notreDameSettings, options
        //     });
        // };



        createSignatureSignatureAnimation({ signatureBlock });


        addToScrub('signature'); // disappears while scrolling
        addToScrub('hero'); // scales up
        addToScrub('notreDameImgInPainting'); // appears in the middle frame
        addToScrub('centralPainting'); // disappears in the middle frame
        addToScrub('notreDame'); // add notreDame timeline





        _.onEvent(_.EventNames.resize, _.createMultipleSetTimeoutCalls(() => {
            const scroll = tlScrub.scrollTrigger?.scroll();
            // tlScrub.scrollTrigger?.scroll(0);

            // gsap.set(notreDameImgInPainting, {
            //     ...getAbsoluteRect(centralPainting, { useCssSize: false }),
            // });

            // gsap.set(notreDameElements.notreDame, {
            //     ...getAbsoluteRect(centralPainting, { useCssSize: false }),
            // });

            // tlScrub.scrollTrigger?.scroll(scroll);

            // ScrollTrigger.refresh(true);
        }, [ 0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 ]));



        heroSettings.notreDame.timeline
            .set(notreDameElements.notreDame, {
                ...getLazyPosition(centralPainting),
                ...getLazyData([ 'width', 'height' ], prop => getAbsoluteRect(centralPainting)[ prop ]),
                id: 'notre-dame-position'
            }, 0)
            .set(notreDameElements.notreDame, {
                ...getPositionElementTo(notreDameElements.notreDame, { to: centralPainting, type: 'top-left' }),
                autoAlpha: 1,
            }, 0)
            .to(notreDameElements.notreDame, {
                id: 'notreDameBlock',
                duration: 1,
                top: 0,
                left: 0,

                width: '100%',
                height: '100%',
                ease: 'expo.in',
            }, 0.01)
            .set(notreDameElements.notreDameTitle, {
                id: 'notreDameTitle',
                opacity: 1,
                ...getPositionElementTo(titleSplit.container, { to: _.queryThrow('svg .notre-dame-sky', notreDameBlock) })
            }, '+=0.01');


        // tlScrub.add(notreDameTL, heroSettings.notreDameBlock.start);
        const groupsClone = titleSplit.groups.map(group => {
            const groupClone = /** @type {HTMLElement} */(group.cloneNode(false));

            groupClone.style.cssText += 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: -1; padding: 0; margin: 0;';
            groupClone.classList.add('group-clone');

            group.style.position = 'relative';

            group.append(groupClone);

            return groupClone;
        });

        const staggerTLs = createTimelines(titleSplit.all, (tl, { chars }, i) => {
            const duration = 2;

            tl
                .from(chars, {
                    ...getLazyData([ 'x', 'y' ], (prop, index, target) => diff2D(
                        centerOfRect(getAbsoluteRect(target, { type: POSITION_TYPE.XY })),
                        centerOfRect(getAbsoluteRect(notreDameHand, { type: POSITION_TYPE.XY }))
                    )[ prop ]),
                    duration,
                    stagger: 0.05
                }, 0)
                .from(chars.map(c => c.firstChild), { duration, rotationX: -50, rotationY: 40, z: -200, stagger: 0.05 }, 0)
                .from(chars.map(c => c.firstChild), { duration: 0.02, autoAlpha: 0, stagger: 0.04 }, 0)
                .fromTo(/* word */groupsClone[ i ], { backgroundColor: 'rgba(255, 255, 255, 0)' }, {
                    duration,
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                }, 0)
                .from(groupsClone[ i ], { duration, z: -400, x: 50, y: -20, ease: 'expoScale(0.5,7,power2.inOut)', }, 0);
        }, {
            start: 0, stagger: 0.02, withScrub: true, time: (i, start, stagger) => {
                // const nbPreviousChars = titleSplit.words.filter((_, j) => j < i).reduce((total, { chars }) => total + chars.length, 0);
                // return start + stagger * nbPreviousChars;
                return '>-=70%';
            }
        });



        heroSettings.notreDame.timeline.fromTo(staggerTLs.timeline, { time: 0 }, {
            time: staggerTLs.duration,
            duration: staggerTLs.duration,
            ease: 'expo.out'
        }, '+=0.5');

        heroSettings.notreDame.timeline.to([ ...titleSplit.groups, ...groupsClone ], {
            scale: 0.4,
            y: 100,
            x: -50,
            opacity: 0,
            duration: 2,
            ease: 'expo.out',
            stagger: 0.4
        }, '+=0.2');

        // leave the pin longer
        // tlScrub.to(heroBlock, { duration: 0.4 });
    };

    createAnimation();
};

export { initHero, createHeroToImagePinAnimation };

// _.onMultipleEvents([
//     _.EventNames.ready.gsap,
//     _.EventNames.ready.document
// ], async () => {
//     await createHeroAnimation();
//     createHeroToImagePinAnimation();
// }, { isCold: true });
