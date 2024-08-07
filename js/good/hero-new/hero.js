// @ts-check


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
 * @param {boolean} [opts.isRelative]
 */
const getLazyPositionElementTo = opts => {
    const {
        to,
        type = 'xy',
        usePercent = false,
        decimalPrecision = 1,
        getRect = el => getAbsoluteRect(el, { ...opts.getAbsoluteRectOptions, type: POSITION_TYPE.XY }),
        margins,
        isRelative = false
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

            return `${isRelative ? '+=' : ''}${round2Decimals(diff[ prop ], decimalPrecision)}${usePercent ? '%' : ''}`;
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

        return {
            hero,
            gallery: {
                container: galleryContainer,
                svg: { gallery: svgGallery, centralPainting, notreDameImgInPainting }
            },
            signature,
            notreDame: {
                block: notreDame,
                container: notreDameContainer, title: notreDameTitle,
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
                end: 'bottom+=140% top',
                invalidateOnRefresh: false,
            },
            id: 'hero-scrub-tl'
        });

        // GSDevTools.create({ animation: tlScrub });

        const restartScrub = _.debounceRestart(() => {
            const to = tlScrub.time();

            tlScrub.time(0);
            tlScrub.invalidate();
            // tlScrub.time(to);
            tlScrub.tweenTo(to);
        }, 100);

        const createResizeObserver = () => {
            let isFirst = false;

            const resizeObserver = new ResizeObserver(entries => {
                if (!isFirst) {
                    isFirst = true;
                    return;
                }

                restartScrub();
            });

            [ /* gallery.svg.gallery, notreDame.svg.sky, */ document.documentElement ].forEach(target => resizeObserver.observe(target));
        };

        createResizeObserver();



        // because of a bug with scrollTrigger when page loads when scrollTrigger is not 0
        // we wait the scrub is done with notreDameImgInPainting animation to get the position of notreDameImgInPainting


        const notreDameTL = gsap.timeline({ id: 'notre-dame-tl' });

        const matchMediaBreakpoints = {
            all: { value: '(min-width: 0px)', name: 'all' },
            mobile: { value: '(max-width: 640px)', name: 'mobile' },
            tablet: { value: '(max-width: 970px)', name: 'tablet' },
            desktop: { value: '(min-width: 970.1px)', name: 'desktop' },
        };

        const matchMediaDefinitions = Object.values(matchMediaBreakpoints).reduce((o, { name, value }) => ({ ...o, [ name ]: value }), {});

        const addToScrub = _.bindOptionsAddToTimeline({ timeline: tlScrub, matchMediaDefinitions });
        const addToNotreDame = _.bindOptionsAddToTimeline({ timeline: notreDameTL, matchMediaDefinitions });

        createSignatureSignatureAnimation({ signature });


        const galleryTiming =/** @type {const} */({
            desktop: {
                signature: { disappears: { start: 0.2, duration: 0.5 } },
                notreDameImgInPainting: {
                    set: { start: 0.7, },
                    appears: { start: 0.7, duration: 0.6 },
                },
                centralPainting: {
                    disappears: { start: 0.7, duration: 0.6 },
                },
                notreDameTL: { start: 0.7 + 0.6 + 0.01 }
            },
            tablet: {
                signature: { disappears: { start: 1 + 0.05, duration: 0.5 } },
                gallery: {
                    shift: { start: 0.05, duration: 1 },
                },
                notreDameImgInPainting: {
                    set: { start: 0.05 + 1, },
                    appears: { start: 0.05 + 1, duration: 0.6 },
                },
                centralPainting: {
                    disappears: { start: 0.05 + 1 + 0.6, duration: 0.6 },
                },
                notreDameTL: { start: 0.05 + 1 + 0.6 + 0.01 }
            },
        });

        const notreDametiming =/** @type {const} */({
            set: { start: 0 },
            scaleUp: { start: 0.01, duration: 1 },
            tablet: {
                shift: { start: 1.01, duration: 1 }
            }
        });


        addToScrub(
            {
                matchMedia: _.device.isMobile() ? matchMediaBreakpoints.all.name : matchMediaBreakpoints.tablet.name,
                matchMedias: [
                    {
                        target: signature,  // disappears while scrolling
                        start: galleryTiming.tablet.signature.disappears.start,
                        to: { duration: galleryTiming.tablet.signature.disappears.duration, opacity: 0, ease: 'expo.out' }
                    },
                    {
                        target: gallery.svg.gallery, // we shift the narrow gallery to the center
                        start: galleryTiming.tablet.gallery.shift.start,
                        fromTo: {
                            from: { x: 0 },
                            to: {
                                duration: galleryTiming.tablet.gallery.shift.duration,
                                x: (i, target) => getLazyPositionElementTo({
                                    to: hero,
                                    getRect: makeCompose(getAbsoluteRectXY, centerOfRect)
                                }).x(i, target),
                                ease: 'power2.out'
                            }
                        }
                    },
                    {
                        target: gallery.container,
                        start: 0,
                        set: { width: 'max-content' }
                    }
                ],
            },
            {
                matchMedia: matchMediaBreakpoints.desktop.name,
                matchMedias: [
                    {
                        target: signature,  // disappears while scrolling
                        start: galleryTiming.desktop.signature.disappears.start,
                        to: { duration: galleryTiming.desktop.signature.disappears.duration, opacity: 0, ease: 'expo.out' }
                    }
                ],
            }
        );

        /** @type {const} */([
            { name: 'desktop', timing: galleryTiming.desktop, media: matchMediaBreakpoints.desktop.name },
            { name: 'tablet', timing: galleryTiming.tablet, media: matchMediaBreakpoints.tablet.name },
        ]).forEach(({ timing, media }) => {

            addToScrub(
                {
                    target: gallery.svg.notreDameImgInPainting, // place notreDameImgInPainting in the middle of the gallery
                    start: timing.notreDameImgInPainting.set.start,
                    matchMedia: media,
                    set: {
                        ...getLazyPositionElementTo({ to: gallery.svg.centralPainting }),
                        ...getLazySize(gallery.svg.centralPainting),
                    }
                },
                {
                    target: gallery.svg.notreDameImgInPainting, // appears in the middle frame
                    start: timing.notreDameImgInPainting.appears.start,
                    matchMedia: media,
                    to: {
                        duration: timing.notreDameImgInPainting.appears.duration, opacity: 1, ease: 'power2.inOut',
                    }
                },
                {
                    target: gallery.svg.centralPainting, // disappears in the middle frame
                    start: timing.centralPainting.disappears.start,
                    matchMedia: media,
                    to: { duration: timing.centralPainting.disappears.duration, opacity: 0, ease: 'power2.inOut' }
                },
                {
                    target: notreDameTL, // add notreDame timeline
                    start: timing.notreDameTL.start,
                    matchMedia: media
                }
            );
        });


        addToNotreDame(
            {
                target: notreDame.block, start: notreDametiming.set.start,
                set: {
                    ...getLazyPositionElementTo({ to: gallery.svg.centralPainting, type: 'top-left' }),
                    ...getLazySize(gallery.svg.centralPainting),
                    autoAlpha: 1,
                }
            },
            {
                target: notreDame.block, start: notreDametiming.scaleUp.start,
                to: { duration: notreDametiming.scaleUp.duration, top: 0, left: 0, width: '100%', height: '100%', ease: 'expo.in' }
            },
            {
                target: notreDame.container, start: notreDametiming.tablet.shift.start,
                condition: _.device.isMobile,
                matchMedia: _.device.isMobile() ? matchMediaBreakpoints.all.name : matchMediaBreakpoints.tablet.name,
                fromTo: {
                    from: { width: '100%', xPercent: 0 }, to: { width: 'max-content', xPercent: -50, duration: 0 }
                }
            },
            {
                target: notreDame.container, start: notreDametiming.tablet.shift.start + 0.01,
                condition: _.device.isMobile,
                matchMedia: _.device.isMobile() ? matchMediaBreakpoints.all.name : matchMediaBreakpoints.tablet.name,
                to: {
                    duration: notreDametiming.tablet.shift.duration,
                    // width: 'max-content', // () => notreDame.svg.notreDame.getBBox().width,
                    /* xPercent */
                    x: () => {
                        const w1 = notreDame.container.getBoundingClientRect().width / 2; // notreDame.svg.notreDame.getBBox().width;
                        const w2 = getAbsoluteRectXY(notreDame.block).width / 2;

                        const w = (w2 - w1);  //  / w1;
                        return 0.45 * w / 2;
                        //  return `+=${1 * w * 100}`; // 100; // -50;
                    },
                    /* x: (index, target) => getLazyPositionElementTo({
                        to: notreDame.block,
                        getRect: makeCompose(getAbsoluteRectXY, positionOfRect({ x: 1, y: 0.5 }))
                    }).x(index, target), */
                    ease: 'power2.out'
                }
            },
            {
                target: notreDame.container, to: { duration: 0.4 }
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
