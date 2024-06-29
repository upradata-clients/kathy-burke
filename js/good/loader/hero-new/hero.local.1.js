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



/**
* @template [T=number]
* @template {'xy' | 'top-left'} [Type='top-left']
* @typedef {Record<(Type extends 'top-left' ? 'top' | 'left' : 'x' | 'y') | 'width' | 'height', T>} Rect
*/

const POSITION_TYPE =/** @type {const} */({
    XY: 'xy',
    TOP_LEFT: 'top-left'
});




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

/**
 * @param {Element} element
 * @param {Pick<AbsoluteRectOptions, 'useCssSize'>} [options]
 */
const getAbsoluteRectTopLeft = (element, options) => getAbsoluteRect(element, { ...options, type: POSITION_TYPE.TOP_LEFT });

/**
 * @param {Element} element
 * @param {Pick<AbsoluteRectOptions, 'useCssSize'>} [options]
 */
const getAbsoluteRectXY = (element, options) => getAbsoluteRect(element, { ...options, type: POSITION_TYPE.XY });


/** @param {Partial<Record<'x' | 'y', number>>} position */
const positionOfRect = position => {
    const { x: px = 0, y: py = 0 } = position;

    /** @param {Rect<number, 'xy'>} rect */
    return rect => ({ ...rect, x: rect.x + rect.width * px, y: rect.y + rect.height * py });
};


// /** @param {Rect<number, 'xy'>} rect */
const centerOfRect = positionOfRect({ x: 0.5, y: 0.5 });
// rect => ({ ...rect, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });


/**
 * @template {readonly string[]} Props
 * @template T
 * @template {InferArray<Props>} Prop
 * @template {(index?: number, target?: Element, targets?: Element[]) => T} LazyFactory
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



/**
 * @param {number} nb
 * @param {number} [precision]
 */
const round2Decimals = (nb, precision = 0) => Math.round(nb * Math.pow(10, precision)) / Math.pow(10, precision);

/**
 * @param {ReadonlyArray<(arg?: any) => any>} functions,
 * @param {unknown} [init]
 */
const compose = (functions, init) => {

    /** @returns {{ first: unknown; fns: ReadonlyArray<(arg?: unknown) => unknown>; }} */
    const getData = () => {
        if (typeof init !== 'undefined')
            return { first: init, fns: functions };

        return { first: functions[ functions.length - 1 ](), fns: functions.slice(0, -1) };
    };

    const { first, fns } = getData();

    return fns.reduce((prevRes, fn) => fn(prevRes), first);
};

/**
 * @template T
 * @template R
 * 
 * @param {readonly [(arg: T) => any, ...((arg?: any) => any)[], (arg?: any) => R]} fns
 */
const makeCompose = (...fns) => {
    /**
     * @param {T} init
     * @returns {R}
     */
    return init => /** @type {R} */(compose(fns, init));
};



/**
 * @param {Object} opts
 * @param {Element} opts.to,
 * @param {'xy' | 'top-left'} [opts.type]
 * @param {boolean} [opts.usePercent]
 * @param {number} [opts.decimalPrecision]
 * @param {(element: Element) => Rect<number, 'xy'>} [opts.getRect]
 * @param {AbsoluteRectOptions<'xy'>} [opts.getAbsoluteRectOptions]
 * @param {Partial<Record<'top' | 'left', number>>} [opts.margins]
 */
const getLazyPositionElementTo = opts => {
    const {
        to,
        type = 'xy',
        usePercent = false,
        decimalPrecision = 0,
        getRect = el => getAbsoluteRect(el, { ...opts.getAbsoluteRectOptions, type: POSITION_TYPE.XY }),
        margins
    } = opts;

    const getLazyPosition = getLazyData(
        type === 'xy' ? /** @type {const} */([ 'x', 'y' ]) : /** @type {const} */([ 'top', 'left' ]),
        (prop, index, target) => {

            const elemRect = getRect(target);
            const toRect = getRect(to);

            const { top: mTop = 0, left: mLeft = 0 } = margins ?? {};

            const toRectWithMargins = {
                x: toRect.x + mLeft,
                y: toRect.y + mTop
            };

            const diff = diff2D(elemRect, toRectWithMargins);

            if (usePercent) {
                diff.x = 100 * diff.x / toRectWithMargins.x;
                diff.y = 100 * diff.y / toRectWithMargins.y;
            }

            if (type === 'top-left') {
                diff.left = diff.x;
                diff.top = diff.y;
            }

            return `+=${round2Decimals(diff[ prop ], decimalPrecision)}${usePercent ? '%' : ''}`;
        });


    return getLazyPosition;
};

const initHero = async () => {

    const hero = _.queryThrow('.hero');
    const signature = _.queryThrow('.signature', hero);
    const notreDame = _.queryThrow('.notre-dame', hero);

    // signatureBlock.classList.remove('r_hidden', 'r_anim');

    // _.queryThrow('img', heroBlock).classList.add('gallery');
    // _.queryThrow('img', signatureBlock).classList.add('signature');
    // _.queryThrow('img', notreDameBlock).classList.add('notre-dame');

    // await _.svgImageToInline(
    //     _.queryThrow('img', heroBlock),
    //     _.queryThrow('img', signatureBlock),
    //     _.queryThrow('img', notreDameBlock)
    // );


    // hero.classList.add('svg-active');
    // heroBlockImg.classList.add('svg-active');


    return { hero, signature, notreDame };
};

/** @typedef {Awaited<ReturnType<typeof initHero>>} HeroElements */



/** @param {Pick<HeroElements,'signature'>} params */
const createSignatureSignatureAnimation = ({ signature }) => {
    const tl = gsap.timeline({ id: 'signature-tl' });

    const apparitionTL = gsap.timeline({ id: 'apparition-tl' });
    apparitionTL.to(signature, { opacity: 1, duration: 1, ease: 'power2.in' });

    const signaturePaths = _.queryAllThrow('path', signature);

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




/** @param {HeroElements} params */
const createHeroToImagePinAnimation = ({ hero, signature, notreDame }) => {

    const prepareLayoutForAnimation = () => {
        const galleryContainer = _.queryThrow('.gallery-container', hero);
        const notreDameContainer = _.queryThrow('.notre-dame-container', notreDame);

        const notreDameTitle = _.queryThrow('.notre-dame__title', notreDameContainer);

        const svgGallery = _.queryThrow('svg.svg-gallery', galleryContainer);
        const svgNotreDame = _.queryThrow('svg.svg-notre-dame', notreDameContainer);

        const notreDameHand = _.queryThrow('.notre-dame-hand', svgNotreDame);
        const notreDameSky = _.queryThrow('.notre-dame-sky', svgNotreDame);

        const centralPainting = _.queryThrow('.canvas-5', svgGallery);


        const createNotreDameImageInPainting = () => {
            const notreDameSvgClone = /** @type {SVGSVGElement} */(svgNotreDame.cloneNode(true));

            notreDameSvgClone.classList.add('clone', 'notre-dame-in-painting');

            galleryContainer.append(notreDameSvgClone);
            return notreDameSvgClone;
        };


        const notreDameImgInPainting = createNotreDameImageInPainting();
        gsap.set(notreDameImgInPainting, { opacity: 0, position: 'absolute' });

        // _.setSvgPosition(/** @type {SVGSVGElement} */(/** @type {unknown} */(_.queryThrow('svg', notreDameBlock))), { x: 0.8, y: 0.5 });


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


        const groupsClone = titleSplit.groups.map(group => {
            const groupClone = /** @type {HTMLElement} */(group.cloneNode(false));

            groupClone.style.cssText += 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: -1; padding: 0; margin: 0;';
            groupClone.classList.add('group-clone');

            group.style.position = 'relative';

            group.append(groupClone);

            return groupClone;
        });


        return {
            hero,
            gallery: {
                container: galleryContainer,
                svg: { gallery: svgGallery, centralPainting, notreDameImgInPainting }
            },
            signature,
            notreDame: {
                block: notreDame,
                container: notreDameContainer, title: notreDameTitle, titleSplit: { ...titleSplit, groupsClone },
                svg: { notreDame: svgNotreDame, hand: notreDameHand, sky: notreDameSky, }
            }
        };
    };

    const createAnimation = () => {
        const { hero, gallery, notreDame, signature } = prepareLayoutForAnimation();

        const tlScrub = gsap.timeline({
            scrollTrigger: {
                onLeave: _.createDispatchEventOnce(_.EventNames.hero.firstScrubDone),
                markers: false,
                trigger: hero,
                scrub: 1,
                pin: hero,
                toggleActions: 'restart complete reverse reset',
                start: 'top=50 top',
                end: 'bottom+=200% top',
                invalidateOnRefresh: false,
            },
            id: 'hero-scrub-tl'
        });

        // GSDevTools.create({ animation: tlScrub });
        const restartScrub = _.debounceRestart(() => {
            const to = tlScrub.time();

            tlScrub.time(0);
            tlScrub.invalidate();
            tlScrub.tweenTo(to);
        }, 100);

        const createResizeObserver = () => {
            let isFirst = false;

            const resizeObserver = new ResizeObserver(entries => {
                /*     if (!isFirst) {
                        isFirst = true;
                        return;
                    } */

                /* const to = tlScrub.time();

                tlScrub.time(0);
                tlScrub.invalidate();
                tlScrub.tweenTo(to); */
                restartScrub();
            });

            [ /* gallery.svg.gallery, notreDame.svg.sky, */ document.documentElement ].forEach(target => resizeObserver.observe(target));
        };

        createResizeObserver();




        // because of a bug with scrollTrigger when page loads when scrollTrigger is not 0
        // we wait the scrub is done with notreDameImgInPainting animation to get the position of notreDameImgInPainting


        const notreDameTL = gsap.timeline({ id: 'notre-dame-tl' });

        const matchMediaBreakpoints = {
            mobile: { value: '(max-width: 640px)', name: 'mobile' },
            tablet: { value: '(max-width: 970px)', name: 'tablet' },
            desktop: { value: '(min-width: 970.1px)', name: 'desktop' },
        };

        const matchMediaDefinitions = Object.values(matchMediaBreakpoints).reduce((o, { name, value }) => ({ ...o, [ name ]: value }), {});

        const addToScrub = _.bindAddToTimeline({ timeline: tlScrub, matchMediaDefinitions });
        const addToNotreDame = _.bindAddToTimeline({ timeline: notreDameTL, matchMediaDefinitions });

        createSignatureSignatureAnimation({ signature });


        addToScrub(
            {
                target: signature,  // disappears while scrolling
                start: 0,
                to: { duration: 0.5, opacity: 0, ease: 'expo.out' }
            },
            {
                target: gallery.svg.gallery, // < 900px center gallery container
                start: 0.01,
                matchMedia: matchMediaBreakpoints.tablet.name,
                fromTo: {
                    from: { x: 0 },
                    to: {
                        duration: 1,
                        x: getLazyPositionElementTo({
                            to: hero,
                            getRect: makeCompose(getAbsoluteRectXY, centerOfRect)
                        }).x,
                        // x: {
                        //     condition: () => window.innerWidth <= 900,
                        //     value: getLazyPositionElementTo({
                        //         to: hero,
                        //         getRect: makeCompose(getAbsoluteRectXY, centerOfRect)
                        //     }).x,
                        // },
                        ease: 'power2.out'
                    }
                }
            },
            {
                target: gallery.container, // scales up
                start: 0.01,
                to: { duration: 1, scale: _.getNavigator() === 'Chrome' ? 1 : 1.5, ease: 'power2.inOut' }
            },
            {
                target: gallery.svg.notreDameImgInPainting,  // disappears while scrolling
                start: 1.01, // 0.2,
                set: {
                    ...getLazyPositionElementTo({ to: gallery.svg.centralPainting }),
                    ...getLazySize(gallery.svg.centralPainting),
                    // delay: () => window.innerWidth < 900 ? (1.01 - 0.2) : 0
                }
            },
            {
                target: gallery.svg.notreDameImgInPainting, // appears in the middle frame
                start: 1.01,// 0.2, 
                to: {
                    duration: 0.6, opacity: 1, ease: 'power2.inOut',
                    // delay: () => window.innerWidth < 900 ? (1.01 - 0.2) : 0
                }
            },
            {
                target: gallery.svg.centralPainting, // disappears in the middle frame
                start: 0.2,
                to: { duration: 0.6, opacity: 0, ease: 'power2.inOut' }
            },
            {
                target: notreDameTL, // add notreDame timeline
                start: '+=0.01',
            }
        );



        addToNotreDame(
            {
                target: notreDame.block, start: 0,
                set: {
                    ...getLazyPositionElementTo({ to: gallery.svg.centralPainting, type: 'top-left' }),
                    ...getLazySize(gallery.svg.centralPainting),
                    autoAlpha: 1,
                }
            },
            {
                target: notreDame.block, start: 0.01, to: { duration: 1, top: 0, left: 0, width: '100%', height: '100%', ease: 'expo.in' }
            },
            {
                target: notreDame.container, start: 1.01,
                matchMedia: matchMediaBreakpoints.tablet.name,
                fromTo: {
                    from: { width: '100%', xPercent: 0 /* x: 0 */ },
                    to: {
                        duration: 1, width: 1400, xPercent: () => {
                            const w1 = 1400; //  getAbsoluteRectXY(notreDame.container).width;
                            const w2 = getAbsoluteRectXY(notreDame.block).width;

                            const w = (w2 - w1) / w1;

                            return w * 100; // -50;
                        },
                        /* x: (index, target) => getLazyPositionElementTo({
                            to: notreDame.block,
                            getRect: makeCompose(getAbsoluteRectXY, positionOfRect({ x: 1, y: 0.5 }))
                        }).x(index, target), */
                        ease: 'power2.out'
                    }
                }
            },
            {
                target: notreDame.titleSplit.container, start: 2.02 /* '+=0.01' */,
                set: {
                    opacity: () => 1,
                    ...getLazyPositionElementTo({ to: notreDame.svg.sky }),
                    matchMedia: {
                        media: matchMediaBreakpoints.tablet.name,
                        x: getLazyPositionElementTo({ to: notreDame.block, getRect: makeCompose(getAbsoluteRectXY, centerOfRect) }).x,
                        y: getLazyPositionElementTo({ to: notreDame.block, getRect: getAbsoluteRectXY, margins: { top: 100 } }).y
                        // ...getLazyPositionElementTo({ to: notreDame.block, getRect: makeCompose(getAbsoluteRectXY, centerOfRect) })
                    },
                },
            },
            {
                start: 2.52,// '+=0.5',
                timelines: {
                    elements: notreDame.titleSplit.all,
                    withScrub: true, time: () => '>-=70%',
                    ease: 'expo.out',
                    createAnimation: ({ element, index: i }) => {
                        const { chars } = /** @type {InferArray<typeof notreDame.titleSplit.all>} */(element);
                        const duration = 2;

                        return [
                            {
                                target: chars, start: 0,
                                from: {
                                    ...getLazyPositionElementTo({
                                        to: notreDame.svg.hand,
                                        getRect: makeCompose(getAbsoluteRectXY, centerOfRect)
                                    }),
                                    duration,
                                    stagger: 0.05
                                }
                            },
                            { target: chars.map(c => c.firstChild), start: 0, from: { duration, rotationX: -50, rotationY: 40, z: -200, stagger: 0.05 } },
                            { target: chars.map(c => c.firstChild), start: 0, from: { duration: 0.02, autoAlpha: 0, stagger: 0.04 } },
                            {
                                target: notreDame.titleSplit.groupsClone[ i ], start: 0, fromTo: {
                                    from: { backgroundColor: 'rgba(255, 255, 255, 0)' },
                                    to: { duration, backgroundColor: 'rgba(255, 255, 255, 0.85)' }
                                }
                            },
                            {
                                target: notreDame.titleSplit.groupsClone[ i ], start: 0,
                                from: { duration, z: -400, x: 50, y: -20, ease: 'expoScale(0.5,7,power2.inOut)' }
                            }
                        ];
                    }
                }
            },
            {
                target: [ ...notreDame.titleSplit.groups, ...notreDame.titleSplit.groupsClone ], start: '+=0.2',
                to: { scale: 0.4, y: 100, x: -50, opacity: 0, duration: 2, ease: 'expo.out', stagger: 0.4 }
            }
        );

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
