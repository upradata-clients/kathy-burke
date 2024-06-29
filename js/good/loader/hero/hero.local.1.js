// @ts-check
import { _ } from '../../common/underscore.js';
import { gsap as _gsap } from '../../../../node_modules/gsap/index.js';
import { registerGsapPlugins } from '../../common/gsap-plugins.umd.js';


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

(await import('../../common/GSDevTools3.min.js')).registerGSDevTools();


_.EventNames.hero = {
    firstScrubDone: 'hero:first-scrub-done'
};



const initHero = async () => {

    const heroBlock = _.queryThrow('.uc-hero-block');
    // const heroBlockImg = _.queryThrow('.uc-hero-img-copy');
    const signatureBlock = _.queryThrow('.uc-signature');
    const notreDameBlock = _.queryThrow('.uc-notre-dame-block');

    signatureBlock.classList.remove('r_hidden', 'r_anim');
    // heroBlockImg.classList.remove('r_hidden', 'r_anim');

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
const createSignatureSignAnimation = ({ signatureBlock }) => {
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

/**
 * @template {'xy' | 'top-left'} [T='top-left']
 * 
 * @param {Element} element
 * @param {T} [type]
 */
const getViewportRect = (element, type = /** @type {T} */('top-left')) => {
    const rect = element.getBoundingClientRect();

    const top = window.scrollY + rect.top;
    const left = window.scrollX + rect.left;

    return /** @type {Rect<number, T>} */({
        ...(type === 'top-left' ? { top, left } : { x: left, y: top }),
        width: rect.width,
        height: rect.height
    });
};

/** @param {Rect<number, 'xy'>} rect */
const centerOfRect = rect => ({ ...rect, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });


/**
 * @template {readonly string[]} Props
 * @template T
 * @template {Props extends readonly (infer U)[] ? U : never} Prop
 * @template {(index: number, target: Element, targets: Element[]) => T} LazyFactory
 * 
 * @param {Props} props
 * @param {(prop: Prop, index: number, target: Element, targets: Element[]) =>  T} getData
 */
const getLazyData = (props, getData) => /** @type {Record<Prop,  LazyFactory>} */(Object.fromEntries(
    props.map(prop => [ prop, (index, target, targets) => getData(/** @type {any} */(prop), index, target, targets) ])
));



/** @param {Element} element */
const getLazyPosition = element => getLazyData(/** @type {const} */([ 'top', 'left', 'width', 'height' ]), prop => getViewportRect(element)[ prop ]);

/**
 * @param {{ x: number; y: number; }} X1 
 * @param {{ x: number; y: number; }} X2 
 */
const diff2D = (X1, X2) => ({ x: X2.x - X1.x, y: X2.y - X1.y });

/**
 * @param {Element} element1
 * @param {Element} element2
 */
const getLazyDistance = (element1, element2) => getLazyData([ 'x', 'y' ], prop => diff2D(
    getViewportRect(element1, /** @type {const} */('xy')),
    getViewportRect(element2, /** @type {const} */('xy'))
)[ prop ]);

// /** @type {Rect<() => number>} */(Object.fromEntries(
//     [ 'top', 'left', 'width', 'height' ].map(
//         prop => [ prop, () => getViewportRect(element)[ prop ] ]
//     )
// ));


const lazyPositionSingleton = _.createLazySingleton(
    /** @param {Element} element */
    element => getViewportRect(element)
)();
// /** @type {keyof Rect} */

/** @param {Element} target */
const getLazyPosition2 = target =>/** @type {Rect<() => number>} */(Object.fromEntries(
    [ 'top', 'left', 'width', 'height' ].map(
        prop => [
            prop,
            () => lazyPositionSingleton.get(target)[ prop ]
        ]
    )
));



/** @param {HeroElements} params */
const createHeroToImagePinAnimation = ({ heroBlock, signatureBlock, notreDameBlock }) => {

    const prepareLayoutForAnimation = () => {
        const heroContainer = _.queryThrow('.t107', heroBlock);


        const notreDameTitle = _.queryThrow('.uc-nd-title-block h3');
        const notreDameHand = _.queryThrow('svg .notre-dame-hand', notreDameBlock);

        const centralPainting = _.queryThrow('#painting-5', heroContainer);

        // notreDameTitle.classList.add('hand-font');

        notreDameBlock.append(notreDameTitle);
        heroBlock.append(notreDameBlock);

        gsap.set(notreDameBlock, { autoAlpha: 0 });
        // _.queryThrow('img', notreDameBlock).dataset.lazyRule = 'skip'; // optimoff


        const createNotreDameImageInPainting = () => {
            const notreDameImgInPainting = /** @type {HTMLImageElement} */(_.queryThrow('svg', notreDameBlock).cloneNode(true));

            gsap.set(notreDameImgInPainting, {
                position: 'absolute',
                ...getViewportRect(centralPainting),
                opacity: 0
            });

            heroContainer.append(notreDameImgInPainting);
            return notreDameImgInPainting;
        };


        const setHeroTransformOriginInPaintingCenter = () => {
            const heroRect = heroBlock.getBoundingClientRect();
            const paintingRect = centralPainting.getBoundingClientRect();


            /**
             * @param {number} a
             */
            const half = a => a / 2;

            const delta = {
                x: half(heroRect.width - paintingRect.width) / heroRect.width,
                y: half(heroRect.height - paintingRect.height) / heroRect.height,
            };

            gsap.set(heroContainer, { transformOrigin: `${50 - delta.x}% ${50 - delta.y}%`, });
        };


        const notreDameImgInPainting = createNotreDameImageInPainting();
        setHeroTransformOriginInPaintingCenter();

        return { centralPainting, heroContainer, notreDameImgInPainting, notreDameBlock, notreDameTitle, notreDameHand };
    };

    const createAnimation = () => {
        const {
            centralPainting, heroContainer, notreDameImgInPainting, notreDameBlock: notreDame, notreDameTitle, notreDameHand,
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
                end: 'bottom+=200% top'
            },
            id: 'hero-scrub-tl'
        });

        GSDevTools.create({ animation: tlScrub });

        const heroElements = {
            signature: signatureBlock,
            hero: heroContainer,
            notreDameImgInPainting,
            centralPainting,
            notreDame: notreDameBlock
        };

        const titleSplit = new SplitText(notreDameTitle).split({
            type: 'chars, words',
            wordsClass: 'word',
            wordDelimiter: '#'
        });

        const charWrappers = /** @type {HTMLElement[]} */(titleSplit.chars).map(c => {
            const div = document.createElement('div');
            div.classList.add('char-wrapper');

            c.classList.add('char');
            div.style.cssText = c.style.cssText;
            c.style.cssText = '';

            /** @type {HTMLElement} */(c.parentElement).append(div);
            div.prepend(c);

            return div;
        });



        const notreDameElements = {
            notreDame,
            notreDameTitle,
            notreDameTitleChars: titleSplit.chars,
            notreDameTitleWords: titleSplit.words,
            notreDameTitleCharsCharWrappers: charWrappers
        };

        // because of a bug with scrollTrigger when page loads when scrollTrigger is not 0
        // we wait the scrub is done with notreDameImgInPainting animation to get the position of notreDameImgInPainting


        /**
         * @typedef {Object} AnimationsSetting
         * @property {gsap.Position} [start]
         * @property {number} [duration]
         * @property {'from' | 'to' | 'set' | 'timeline'} [type]
         * @property {gsap.core.Timeline | gsap.core.Tween} [timeline]
         * @property {Target<{}>} [target]
         * @property {Omit<gsap.TweenVars, 'duration'>} [options]
         */

        /**
         * @template T
         * @typedef {Record<keyof T, AnimationsSetting | readonly AnimationsSetting[]>} AnimationsSettings
         */


        /**
         * @satisfies {AnimationsSettings<typeof heroElements>}
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
                start: 0,
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


        /**
         * @satisfies {AnimationsSettings<typeof notreDameElements>}
         */
        const notreDameSettings = {
            notreDame: [
                {
                    start: 0,
                    type: 'set',
                    options: {
                        ...getLazyPosition(notreDameImgInPainting),
                        autoAlpha: 1,
                        id: 'notre-dame-position'
                    }
                },
                {
                    start: 0,
                    duration: 1,
                    options: {
                        id: 'notreDameBlock',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        ease: 'expo.in'
                    }
                }
            ],
            notreDameTitle: {
                start: 1,
                duration: 0,
                options: {
                    id: 'notreDameTitle',
                    opacity: 1,
                    // ease: 'expo.out'
                }
            },
            notreDameTitleCharsCharWrappers: [
                {
                    start: 1,
                    duration: 0.4,
                    type: 'from',
                    options: {
                        id: 'notreDameTitleChars-wrappers',
                        ...getLazyData([ 'x', 'y' ], (prop, index, target) => diff2D(
                            centerOfRect(getViewportRect(target, /** @type {const} */('xy'))),
                            centerOfRect(getViewportRect(notreDameHand, /** @type {const} */('xy')))
                        )[ prop ]),
                        ease: 'expo.out',
                        stagger: 0.02
                    }
                },
            ],
            notreDameTitleChars: [
                // {
                //     start: 1,
                //     duration: 0.4,
                //     type: 'from',
                //     options: {
                //         scale: 0.6,
                //         ease: CustomEase.create('custom', 'M0,0 C0,0 0.046,2.0 0.3,2.0 0.359,2.0 0.458,1.082 0.572,1.048 0.815,0.973 1,1 1,1 '),
                //         stagger: 0.02
                //     }
                // },
                { start: 1, type: 'set', options: { transformPerspective: 800, /* transformOrigin: '330px -60px 200px' */ } },
                {
                    start: 1,
                    duration: 0.4,
                    type: 'from',
                    options: {
                        z: -200,
                        rotationX: -20,
                        rotationY: 35,
                        // transformOrigin: '50% 50% -400px',
                        ease: 'expo.out',
                        stagger: 0.02
                        /* 
                            transform: perspective(800px) translate3d(350px, 170px, -100px) rotateY(35deg) rotateX(-20deg);
                            opacity: 0.7216;
                            transform-origin: 730px -60px;
                            visibility: inherit;
                        */
                    }
                },
                {
                    start: 1,
                    duration: 0,
                    type: 'from',
                    options: {
                        id: 'notreDameTitleChars2',
                        // transformOrigin: '50% 50%',
                        // scale: 4,
                        autoAlpha: 0,
                        // rotationX: -180,
                        // transformOrigin: "100% 50%",
                        // <rect class="notre-dame-hand" x="1384.9" y="281.2" width="29.884" height="26.431" fill-opacity="0"></rect>
                        // ease: 'expo.out',
                        stagger: 0.02
                    }
                }
            ],
            // {
            // start: 1,
            // type: 'timeline',
            // timeline: gsap.timeline({ id: 'notre-dame-title-chars-tl' + (i++) }),
            // options: {
            //     time: () => notreDameSettings.notreDameTitleChars.timeline.duration(),
            //     duration: () => notreDameSettings.notreDameTitleChars.timeline.duration(),
            //     ease: 'expo.out',
            //     stagger: 0.02
            // }
            // },
            notreDameTitleWords: [
                {
                    start: 1,
                    duration: 0.4,
                    type: 'from',
                    options: {
                        id: 'notreDameTitleWords1',
                        // ...getLazyData([ 'x', 'y' ], (prop, index, target) => diff2D(
                        //     centerOfRect(getViewportRect(target, /** @type {const} */('xy'))),
                        //     centerOfRect(getViewportRect(notreDameHand, /** @type {const} */('xy')))
                        // )[ prop ]),
                        xPercent: -50,
                        yPercent: 50,
                        ease: 'expo.out',
                        stagger: 0.02
                    }
                },
                {
                    // start: '>-=0.1',
                    start: 1,
                    duration: 0, // 0.2,
                    type: 'from',
                    options: {
                        id: 'notreDameTitleWords2',
                        opacity: 0,
                        ease: 'expo.out',
                        stagger: 0.02
                    }
                }
            ]
        };



        /**
         * @satisfies {AnimationsSettings<{ notreDameTitleChars: Element[] }>}
         */
        const notreDameTitleCharsSettings = {
            notreDameTitleChars: [
                {
                    start: 0,
                    duration: 0.4,
                    type: 'from',
                    options: {
                        id: 'notreDameTitleChars',
                        // transformOrigin: '50% 50%',
                        ...getLazyData([ 'x', 'y' ], (prop, index, target) => diff2D(
                            centerOfRect(getViewportRect(target, /** @type {const} */('xy'))),
                            centerOfRect(getViewportRect(notreDameHand, /** @type {const} */('xy')))
                        )[ prop ]),
                        // scale: 4,
                        // autoAlpha: 0,
                        // rotationX: -180,
                        // transformOrigin: "100% 50%",
                        // <rect class="notre-dame-hand" x="1384.9" y="281.2" width="29.884" height="26.431" fill-opacity="0"></rect>
                        // ease: 'expo.out',
                        // stagger: 0.02
                    }
                },
                {
                    start: 0,
                    duration: 0.1,
                    type: 'from',
                    options: {
                        id: 'notreDameTitleChars2',
                        // transformOrigin: '50% 50%',
                        // scale: 4,
                        autoAlpha: 0,
                        // rotationX: -180,
                        // transformOrigin: "100% 50%",
                        // <rect class="notre-dame-hand" x="1384.9" y="281.2" width="29.884" height="26.431" fill-opacity="0"></rect>
                        // ease: 'expo.out',
                        // stagger: 0.02
                    }
                }
            ]
        };

        /**
         * @template {Record<string, gsap.TweenTarget>} T
         * @typedef {(keyof T) & string | gsap.core.Timeline | gsap.core.Tween | Element | Element[]} Target
         */

        /** @typedef {gsap.TweenVars & { start?: gsap.Position, type?: 'from' | 'to' | 'set' }} Options */

        /**
         * @template {Record<string, gsap.TweenTarget>} T
         * 
         * @param {Object} params
         * @param {gsap.core.Timeline} params.timeline
         * @param {Target<T>} params.target
         * @param {T} [params.elements]
         * @param {AnimationsSettings<T>} [params.animationsSettings]
         * @param {Options} [params.options]
         */
        const addTo = ({ timeline, target, elements, animationsSettings, options = {} }) => {

            /** @param {AnimationsSetting} [setting] */
            const getOptions = setting => {
                const { start, type, ...opts } = options;
                const d = type === 'set' ? { duration: 0 } : setting?.duration !== undefined ? { duration: setting.duration } : {};

                return { ...d, ...setting?.options, ...opts };
            };


            /**
             * @param {gsap.core.Timeline | gsap.core.Tween} tl
             * @param {gsap.Position | undefined} start
             * @param {Options} options
             */
            const addTimeline = (tl, start, options) => {
                timeline.add(tl, start);

                if (Object.keys(options).length === 0)
                    return timeline;

                tl.paused(true);
                return timeline.to(tl, options, start);
            };


            if (typeof target !== 'string') {
                const { start, type = 'to' } = options;

                if ((target instanceof gsap.core.Timeline || target instanceof gsap.core.Tween) /* && Object.keys(opts).length === 0 */)
                    return addTimeline(target, start, getOptions());

                return timeline[ type ](target, getOptions(), start);
            }


            const setting = animationsSettings ? animationsSettings[ target ] : [];
            const listOfSetting = /** @type {AnimationsSetting[]} */(Array.isArray(setting) ? setting : [ setting ]);

            listOfSetting.forEach(setting => {
                const { type = 'to', start: s } = setting;
                const { start = s } = options;

                if (type === 'timeline' && !setting.timeline)
                    throw new Error('timeline is not defined in setting');

                if (!elements)
                    throw new Error('elements is not defined');

                const opts = getOptions(setting);

                if (type === 'timeline') {
                    if (!setting.timeline)
                        throw new Error('timeline is not defined in setting');

                    return addTimeline(setting.timeline, start, opts);
                }

                return timeline[ type ](setting.target || elements[ target ], opts, start);
            });
        };


        /**
         * @param {Target<typeof heroElements>} target
         * @param {Options} [options]
         */
        const addToScrub = (target, options = {}) => {
            return addTo({ timeline: tlScrub, target, elements: heroElements, animationsSettings: heroSettings, options });
        };


        /**
         * @param {Target<typeof notreDameElements>} target
         * @param {Options} [options]
         */
        const addToNotreDame = (target, options = {}) => {
            return addTo({ timeline: heroSettings.notreDame.timeline, target, elements: notreDameElements, animationsSettings: notreDameSettings, options });
        };



        createSignatureSignAnimation({ signatureBlock });


        addToScrub('signature'); // disappears while scrolling
        addToScrub('hero'); // scales up
        addToScrub('notreDameImgInPainting'); // appears in the middle frame
        addToScrub('centralPainting'); // disappears in the middle frame
        addToScrub('notreDame'); // add notreDame timeline

        // addToScrub(notreDameTL, { start: heroSettings.notreDame.start,/*  time: notreDameTL.duration(), duration: notreDameTL.duration() */ });



        // place notreDameBlock in the same place as the notreDameImgInPainting
        // addToNotreDame(notreDame, {
        //     type: 'set',
        //     start: notreDameSettings.notreDameBlock.start,
        //     ...lazyPosition,
        //     autoAlpha: 1
        // });

        addToNotreDame('notreDame'); // notreDameBlock takes the full screen
        addToNotreDame('notreDameTitle'); // notreDameTitle appears

        // addTo({
        //     timeline: notreDameSettings.notreDameTitleChars.timeline,
        //     elements: { notreDameTitleChars: notreDameElements.notreDameTitleChars },
        //     animationsSettings: notreDameTitleCharsSettings,
        //     target: 'notreDameTitleChars'
        // });

        // addToNotreDame('notreDameTitleCharsCharWrappers'); // notreDameTitleCharsCharWrappers animation
        // addToNotreDame('notreDameTitleChars'); // notreDameTitleChars animation
        // addToNotreDame('notreDameTitleWords'); // notreDameTitleWords animation


        // tlScrub.add(notreDameTL, heroSettings.notreDameBlock.start);


        // leave the pin longer
        tlScrub.to(heroBlock, { duration: 1 });
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
