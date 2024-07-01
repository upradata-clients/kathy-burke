// @ts-check


/** @typedef {'x' | 'y'} Axis */

/**
 * @param {Object} params
 * @param {GallerySliderCard[]} params.sliderCards
 * @param {Record<Axis, number>} params.maxRotation
 * @param {Record<Axis, number> | ((params: { wrapper: HTMLElement; }) => Record<Axis, number>)} params.maxDistance
 */
const createSideCardsMouseFollowAnimation = ({ sliderCards, maxRotation, maxDistance }) => {

    const power2Ease = gsap.parseEase('power2.out');

    // power2EaseSymmetric is the same as power2Ease but symmetric on 1/2 ("y" goes from 1 to 0 when "x=progress" goes from 0 to 1)
    /** @param {number} progress */
    const power2EaseSymmetric = progress => power2Ease(1 - progress);

    /** @type {(distanceProgress: {x: number; y: number}) => {x: number; y: number}} */
    const distanceEasing = distanceProgress => {

        const clampP = gsap.utils.clamp(-1, 1);

        /** @param {number} progress */
        const easing = progress => {
            const p = clampP(progress);
            const easeX = power2Ease(Math.abs(p));

            return p < 0 ? -easeX : easeX;
        };

        // This term is used to make the "y" component goes slower when "x" is going further
        const alpha = power2EaseSymmetric(Math.abs(clampP(distanceProgress.x)));

        return {
            x: easing(distanceProgress.x),
            y: alpha * easing(distanceProgress.y)
        };
    };

    /** @param {Record<Axis,number>} distanceProgress */
    const distanceProgressToRotation = distanceProgress => {
        return Object.fromEntries([ 'x', 'y' ].map(axis => [
            axis,
            gsap.utils.mapRange(-1, 1, -maxRotation[ axis ], maxRotation[ axis ], distanceProgress[ axis === 'x' ? 'y' : 'x' ])
        ]));
    };

    const cardsMouseFollowAnimation = sliderCards.map(({ wrapper }) => {

        /** @typedef {{ x: number; y: number;}}  Point2D */

        // we need to store the initial rotation values to add the new ones
        /** @type {Point2D} */
        let rotationStart = { x: 0, y: 0 };

        // -maxRotation.x <= rotation <= maxRotation.x (the same for y)
        const rNormMax = Math.sqrt((2 * maxRotation.x) ** 2 + (2 * maxRotation.y) ** 2);


        const mouseFollower = _.createMouseFollower({
            items: [ wrapper ],
            distanceEasing,
            maxDistance: typeof maxDistance === 'function' ? maxDistance({ wrapper }) : maxDistance,
            onStart: () => {
                rotationStart = /** @type {Point2D} */({
                    x: gsap.getProperty(wrapper, 'rotationX'),
                    y: gsap.getProperty(wrapper, 'rotationY')
                });
            },
            onMouseMove: data => {
                const d = mouseFollower.getDistanceEase(data);

                const card = /** @type {HTMLElement} */ (data.item.closest('.card'));

                if (!card)
                    throw new Error(`The card is not found for the element: ${data.item}`);

                const deltaRotation = distanceProgressToRotation(d);

                const prevRotation = /** @type {Point2D} */({
                    x: gsap.getProperty(data.item, 'rotationX'),
                    y: gsap.getProperty(data.item, 'rotationY')
                });

                const nextRotation = {
                    x: rotationStart.x + deltaRotation.x,
                    y: rotationStart.y - deltaRotation.y
                };

                const rNorm = Math.sqrt((nextRotation.x - prevRotation.x) ** 2 + (nextRotation.y - prevRotation.y) ** 2);

                gsap.to(data.item, {
                    duration: 0.5 + 1.0 * rNorm / rNormMax,
                    transformPerspective: 1000,
                    rotationX: rotationStart.x + deltaRotation.x,
                    rotationY: rotationStart.y - deltaRotation.y,
                    ease: 'power2.out'
                });
            },
            onStop: async () => {
                // gsap.set(wrapper, { rotateX: 0, rotateY: 0 }); 
                gsap.killTweensOf(wrapper);
                return new Promise(resolve => gsap.set(wrapper, {
                    clearProps: 'all', onComplete: resolve
                }));

                // gsap.getTweensOf(wrapper).map(tween => {
                //     if ('rotationX' in tween.vars || 'rotationY' in tween.vars)
                //         tween.revert();
                // });


                // await Promise.allSettled(
                //     gsap.getTweensOf(wrapper).map(tween => {
                //         if ('rotationX' in tween.vars || 'rotationY' in tween.vars)
                //             return new Promise(resolve => tween.revert().eventCallback('onComplete', resolve));
                //     })
                // );
                // gsap.set(wrapper, { clearProps: 'rotationX, rotationY' });
                // const p = _.promisifyTimeline(gsap.set(wrapper, { clearProps: 'rotationX, rotationY' }));
                // gsap.killTweensOf(wrapper, 'rotationX, rotationY');

            }
        });

        return { mouseFollower, item: wrapper };
    });

    return {
        animations: cardsMouseFollowAnimation,
        start: () => cardsMouseFollowAnimation.forEach(({ mouseFollower }) => mouseFollower.start()),
        stop: async () => {
            await Promise.allSettled(cardsMouseFollowAnimation.map(async ({ mouseFollower, item }, i) => mouseFollower.stop()));
        }
    };
};


/** @typedef {ReturnType<typeof createSideCardsMouseFollowAnimation>} SideCardsMouseAnimation} */

/**
 * @param {GalleryElements} elements
 */
const createGallerySlider = elements => {

    const menuItems = elements.menu.menuItems.map(({ item }) => item);

    // cards.forEach(card => gsap.set(card, { transformPerspective: 800 }));
    menuItems.forEach(card => gsap.set(card, { transformOrigin: 'center center' }));

    const sliderWrapper = elements.gallerySlider.wrapper;
    const galleryBackgroundFrame = _.queryThrow('.t-container', elements.galleryBackground.block);

    gsap.set(sliderWrapper, { width: gsap.getProperty(galleryBackgroundFrame, 'width') });

    const slider = _.gallery.GallerySlider.create({
        cards: elements.gallerySlider.cards.map(({ card }) => card),
        dtStagger: 0.1,
        duration: 0.1 * (menuItems.length - 1), // duration of the card animation from x = xPercent% to -xPercent%
        // translation of the card at the beginning of the animation (card side by side => at 1 dt, 100% cards' width)
        xPercent: ({ dtStagger }) => 0.85 * (100 / dtStagger) / 2,
        eases: {
            time: 'power3.inOut',
        },
        animateCard: ({ item, xPercent, duration: T }) => {
            const tl = gsap.timeline();

            const transformationSettings = {
                duration: T, ease: 'none', immediateRender: false
            };

            const symmetricTransformationSettings = {
                duration: T / 2, yoyo: true, repeat: 1, ease: 'none', immediateRender: false
            };


            /**
             * @param {Object} params
             * @param {gsap.TweenVars} params.from
             * @param {gsap.TweenVars} params.to
             * @param {gsap.Position} params.time
             * @param {'symetric' | 'normal'} params.type
             * @param {HTMLElement} [params.el]
             */
            const addFromTo = ({ from, to, time, type, el = item }) => {
                return tl.fromTo(el, from, {
                    ...(type === 'symetric' ? symmetricTransformationSettings : transformationSettings),
                    ...to
                }, time);
            };


            addFromTo({ from: { opacity: 0.4, zIndex: 1 }, to: { opacity: 1, zIndex: 100, ease: 'linear' }, time: 0, type: 'symetric' });
            addFromTo({ from: { scaleX: 0.3, scaleY: 1 }, to: { scaleX: 1, scaleY: 1, ease: 'expo.in' }, time: 0, type: 'symetric' });
            addFromTo({ from: { xPercent }, to: { xPercent: -xPercent }, time: 0, type: 'normal' });

            // to offset the move on axis X after rotation around Y
            // with the perspective, it moves the cards on the sides

            const customEase = gsap.parseEase(
                CustomEase.create('custom', 'M0,0 C0.077,0.345 0.198,1.076 0.33,1 0.669,0.802 1,0.091 1,0')
            );

            addFromTo({
                el: _.queryThrow('.t156', item),
                from: { xPercent: 0 },
                to: {
                    xPercent: -24,
                    duration: T / 2,
                    ease: customEase
                    // t => t < 0.5 ? customEase(2 * t) : customEase(2 * (1 - t))
                },
                time: 0,
                type: 'normal'
            });

            addFromTo({
                el: _.queryThrow('.t156', item),
                from: { xPercent: 0 },
                to: {
                    xPercent: 24,
                    duration: T / 2,
                    ease: t => customEase(1 - t)
                    // t => t < 0.5 ? customEase(2 * t) : customEase(2 * (1 - t))
                },
                time: T / 2,
                type: 'normal'
            });



            addFromTo({ from: { rotateY: -80, rotateZ: 5 }, to: { rotateY: 80, rotateZ: -5 }, time: 0, type: 'normal' });
            addFromTo({ from: { z: -1350, rotateX: -5 }, to: { z: 0, rotateX: 0 }, time: 0, type: 'symetric' });

            return tl;
        },
        onStop: () => {
            menuItems.forEach(card => {
                gsap.set(_.queryThrow('.t156', card), { clearProps: 'all' });
            });
        }
    });


    return slider;
};


/** @typedef {ReturnType<typeof createGallerySlider>} GallerySlider */

/**
 * @param {Object} params
 * @param {HTMLElement} params.galleryBackground
 * @param {HTMLElement[]} params.cards
 */
const createSideCardsScrollFollow = ({ galleryBackground, cards }) => {

    const galleryBackgroundContainer = galleryBackground;
    const item = _.queryThrow('.t-col', galleryBackgroundContainer);

    const imageHeight = _.getRect(item).height;

    const cardSidesTL = gsap.timeline({
        scrollTrigger: {
            markers: false,
            trigger: galleryBackgroundContainer,
            scrub: 0.7,
            start: `center-=${0.75 * imageHeight} bottom`,
            end: `center+=${0.75 * imageHeight} bottom`
        }
    });

    /** @param {number} activeI */
    const sideCards = activeI => cards.filter((_, i) => i !== activeI).map(c => _.queryThrow('.t156__wrapper', c));


    /**
     * @param {number} activeI
     * @returns {gsap.core.Timeline}
     */
    const create = activeI => {

        cardSidesTL.from(sideCards(activeI), {
            y: -imageHeight / 2,
            ease: 'power4.out',
            duration: 0.5
        }, 0);

        cardSidesTL.to(sideCards(activeI), {
            y: imageHeight / 2,
            ease: 'power4.out',
            duration: 0.5
        }, 0.5);


        cardSidesTL.scrollTrigger?.refresh();
        return cardSidesTL;
    };

    /** @param {number} activeI */
    const clear = activeI => {
        gsap.set(sideCards(activeI), { clearProps: 'y' });
        cardSidesTL.clear();
    };

    return { create, clear, kill: () => cardSidesTL.revert() };
};


/** @typedef {ReturnType<typeof createSideCardsScrollFollow>} SideCardsScrollFollow */

/** @param {HTMLElement} cardsBlock */
const createGalleryApparationAnimation = cardsBlock => {
    return gsap
        .timeline({ paused: true })
        .to(cardsBlock, { opacity: 1, ease: 'expo.out', duration: 0.7 });
};

/**
 * @param {object} params
 * @param {GalleryElements} params.elements
 * @param {GalleryMenu} params.galleryMenu
 */
const createGalleryAnimation = ({ elements, galleryMenu }) => {

    const { galleryTitle, menu: { menuContainer } } = elements;
    const menuItems = elements.menu.menuItems.map(({ item }) => item);


    galleryMenu.setMenuItemsImagesStyle([ { prop: 'position', mediaQuery: 'lg' } ]);

    const slider = _.createLazySingleton(() => createGallerySlider(elements))({
        destroy: slider => slider.stop()
    });
    // /** @param {GallerySlider} slider */

    const sideCardsMouseFollowAnimation = _.createLazySingleton(
        /** @param {number[]} indexes */
        indexes => createSideCardsMouseFollowAnimation({
            sliderCards: elements.gallerySlider.cards.filter((_, i) => indexes.includes(i)),
            maxRotation: { x: 3, y: 6 },
            maxDistance: ({ wrapper }) => {
                const { width, height } = _.getRect(wrapper);
                return { x: 0.5 * window.innerWidth / 2 /* width */, y: 0.5 * height };
            }
        })
    )({
        destroy: sideCardsMouseFollowAnimation => sideCardsMouseFollowAnimation.stop(),
        isParamsEqual: (a, b) => a.length === b.length && a.every((v, i) => v === b[ i ])
    });


    const sideCardsScrollFollow = _.createLazySingleton(() => createSideCardsScrollFollow({
        galleryBackground: _.queryThrow('.t-container', elements.galleryBackground.block),
        cards: elements.gallerySlider.cards.map(({ card }) => card)
    }))({
        destroy: sideCardsScrollFollow => sideCardsScrollFollow.kill()
    });


    /** {'immediate' | 'lazy' } action */
    const resetFollowers = action => {
        sideCardsMouseFollowAnimation.reset();
        sideCardsScrollFollow.reset();
    };

    _.onEvent(_.EventNames.gallery.resize, resetFollowers);
    // _.onEvent(_.EventNames.gallery.enter, resetFollowers);



    let menuHeight = gsap.getProperty(menuContainer, 'height');

    /** @param {'activating' | 'desactivating'} action */
    const animateActivationMenu = action => {
        galleryMenu.setMenuItemsImagesStyle([ { prop: 'position', mediaQuery: action === 'activating' ? 'xs' : 'lg' } ]);

        if (action === 'activating') {
            if (!menuHeight)
                menuHeight = gsap.getProperty(menuContainer, 'height');

            return gsap.timeline()
                // we scroll to the menu and make it smaller
                .to(window, { scrollTo: { y: menuContainer, offsetY: 25 }, duration: 1, ease: 'expo.out' })
                .to(menuContainer, { height: 120, duration: 0.5, ease: 'expo.out' }, '<10%');
        }

        return gsap.timeline().to(menuContainer, { height: menuHeight, duration: 1, ease: 'expo.in' }, '<10%');
    };

    /**
     * @param {Object} params
     * @param {number} params.from
     * @param {number} params.to
     * @param {AnimateSliderParams['state']} params.state
     * @param {boolean} params.isInit
     */
    const flipTitles = ({ from, to, state, isInit }) => {

        const [ galleryTitleHeader, galleryTitleHeader2 ] = elements.galleryTitle.titles;
        const menuItemsTitles = elements.menu.menuItems.map(({ title }) => title);

        if (state === 'activated' || state === 'activating') {
            const sideMenuItems = menuItemsTitles.filter((_, i) => i !== to);

            if (from === to) {
                if (state === 'activating') {
                    gsap.to(menuItemsTitles, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'expo.out', overwrite: true });

                    sideMenuItems.forEach((item, i) => {
                        item.classList.remove('active');
                    });

                    menuItemsTitles[ to ].classList.add('active');
                }
            }

            if (from === to)
                return;

            galleryTitleHeader.innerHTML = menuItemsTitles[ to ].innerHTML;

            galleryTitleHeader.dataset.flipId = 'gallery-title';
            menuItemsTitles[ to ].dataset.flipId = 'gallery-title';

            const titleState = Flip.getState([ menuItemsTitles[ to ], galleryTitleHeader ]);

            menuItemsTitles[ from ].classList.remove('active');
            menuItemsTitles[ to ].classList.add('active');

            galleryTitleHeader.classList.add('active');

            return Flip.from(titleState, {
                duration: 0.4, ease: 'expo.out' /* flipAction === 'flip' ? 'expo.out' : 'expo.in' */, toggleClass: 'flipping'
            });
        }

        // const titleAnimation = gsap.timeline({ paused: true }).fromTo(title,
        //     { opacity: 1, y: 0, scale: 1 },
        //     { opacity: 0, y: -50, scale: 0.5, duration: 0.5, ease: 'expo.out', overwrite: true, immediateRender: false }
        // );

        // if (flipAction === 'flip')
        //     titleAnimation.play();
        // else
        //     titleAnimation.reverse(0);

        // const titleAnimation = gsap.timeline({ paused: true }).fromTo(title,;
        //     { opacity: 1, y: 0, scale: 1 },
        //     { opacity: 0, y: -50, scale: 0.5, duration: 0.5, ease: 'expo.out', overwrite: true, immediateRender: false }
        // );

        if (state === 'desactivated') {
            if (from !== -1) {
                const items = from === to ? menuItemsTitles.filter((_, i) => i !== to) : [ menuItemsTitles[ from ] ];
                gsap.to(items, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'expo.out', overwrite: true });
            }

            // gsap.to(menuItemsTitles, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'expo.out', overwrite: true });

            if (to !== -1) {
                gsap.fromTo(menuItemsTitles[ to ],
                    { /* opacity: 1, */ y: 0, scale: 1 },
                    { /* opacity: 0, */ y: 0, scale: 0.8, duration: 0.4, delay: 0.1, ease: 'ease.out', overwrite: true, immediateRender: false }
                );
                // const splitText = new SplitText(menuItemsTitles[ to ]);

                // gsap.set(menuItemsTitles[ to ], { perspective: 400 });
                // splitText.split({ type: 'chars, words' });
                // gsap.to(splitText.chars, {
                //     duration: 0.6, stagger: 0.02, scale: 0
                //     // scale: 2, opacity: 1, rotationX: -80, transformOrigin: '100% 50%', ease: 'power2.out', stagger: 0.02 
                // });
            }
        } else {
            gsap.to(menuItemsTitles, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'expo.out', overwrite: true });
        }

        if (isInit) {
            galleryTitleHeader.textContent = menuItemsTitles[ to ].textContent;
            return gsap.fromTo(galleryTitleHeader, { opacity: 0, y: -100 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' });
        }

        if (from === to)
            return;

        galleryTitleHeader2.textContent = menuItemsTitles[ to ].textContent;

        return gsap.timeline()
            .to(galleryTitleHeader, { opacity: 0, x: 400, duration: 0.4, ease: 'expo.in', overwrite: true })
            .fromTo(galleryTitleHeader2, { opacity: 0, x: -400 }, {
                opacity: 1, x: 0, duration: 0.4, ease: 'expo.out', overwrite: true,
                onComplete: () => {
                    galleryTitleHeader.textContent = menuItemsTitles[ to ].textContent;
                    gsap.set(galleryTitleHeader, { opacity: 1, x: 0 });
                    gsap.set(galleryTitleHeader2, { opacity: 0 });
                    galleryTitleHeader2.textContent = '';
                }
            }, 0.3);
    };



    /**
     * @param {number} i 
     * @param {'add'|'remove'} action 
     */
    const setStateCards = (i, action) => {
        menuItems[ i ].dataset.cardState = action === 'add' ? 'active' : '';
        // cards[ wrapI(i - 1) ].dataset.cardState = action === 'add' ? 'left' : '';
        // cards[ wrapI(i + 1) ].dataset.cardState = action === 'add' ? 'right' : '';
    };


    /** @param {number} activeI */
    const setZoomableCard = activeI => {

        /**
         * @param {HTMLImageElement} img
         * @param {boolean} isActive
         */
        const setZoomable = (img, isActive) => {
            if (isActive) {
                img.dataset.imgZoomUrl = img.dataset.imgZoomUrl || img.dataset.galleryImgZoomUrl;
                delete img.dataset.galleryImgZoomUrl;
            } else {
                img.dataset.galleryImgZoomUrl = img.dataset.galleryImgZoomUrl || img.dataset.imgZoomUrl;
                img.dataset.imgZoomUrl = '';
            }
        };

        // we need to wait next tick because first will be called document.addEventListener("click", function(t) {
        // in tilda-zoom-2.0.min.js -> t_zoom__initFullScreenImgOnClick
        // Otherwise, the image will get zoom as we set the zoomable attribute of the next active card
        setTimeout(() => {
            elements.gallerySlider.cards.forEach(({ images }, i) => {
                images.forEach(img => setZoomable(_.queryThrow('img', img), activeI === i));
            });
        }, 0);
    };


    /**
     * @param {Object} params
     * @param {number} params.from
     * @param {number} params.to
     * @param { 'activated' | 'activating' | 'desactivated' | 'desactivating' } params.state
     */
    const activateSideCardsFollowers = async ({ state, from, to }) => {

        let p$ = Promise.resolve();

        // const sideCardsMouseFollowAnimationInstance = sideCardsMouseFollowAnimation.instance();

        // if (sideCardsMouseFollowAnimationInstance) {
        //     gsap.to(sideCardsMouseFollowAnimationInstance.animations[ index ].item, {
        //         // rotateX: 0, rotateY: 0,/*  duration: 0.2, ease: 'power4.out' */
        //         clearProps: 'all', duration: 0
        //     });
        // }

        const indexes = menuItems.map((_, i) => i).filter(i => i !== to);

        await sideCardsMouseFollowAnimation.instance()?.stop(); // in case
        sideCardsMouseFollowAnimation.get(indexes).start();


        // if (state === 'activating')
        //     sideCardsScrollFollow.instance()?.clear(from); // in case

        // if (state === 'activating' || state === 'activated')
        //     sideCardsScrollFollow.get().create(to);
    };


    /**
     * @param {Object} params
     * @param { 'activated' | 'activating' | 'desactivated' | 'desactivating' } params.state
     * @param {number} params.from
     * @param {number} params.to
     * @param {boolean} params.isInit
     */
    const animateSlider = ({ from, to, state, isInit }) => {

        /** @type {Promise<void>} */
        let sliderTL$ = Promise.resolve();

        const isSame = from === to;

        if (isInit) {
            gsap.to(galleryTitle.block, { opacity: 1, duration: 0.5, ease: 'expo.out' });
        }

        if (from !== -1) {
            setStateCards(from, 'remove');

            // sideCardsMouseFollowAnimation.reset();
            sliderTL$ = sliderTL$.then(() => sideCardsMouseFollowAnimation.instance()?.stop());

            // if (!isSame && state !== 'desactivating')
            //     flipTitles({ i: from, action: 'unflip', state, isInit });
        }

        if (isInit || state === 'activating' || state === 'desactivating')
            resetFollowers();

        if (to !== -1) {
            setStateCards(to, 'add');
            setZoomableCard(to);

            sliderTL$ = sliderTL$.then(() => slider.get().goTo(to));

            //  if (!isSame && state !== 'activated')
            flipTitles({ from, to, state, isInit });
        };


        // if (from !== -1)
        // if (state === 'activated' || state === 'desactivated')
        //     sideCardsScrollFollow.instance()?.clear(from);

        if (to !== -1)
            sliderTL$.then(() => activateSideCardsFollowers({ from, to, state }));

        return sliderTL$;
    };



    // const setActiveTitle = _.setClassName(elements.galleryTitle, 'active');
    // setActiveTitle('add');

    /** @param {'add' | 'remove' } action */
    const setActiveCardsBlock = action => {
        _.setClassName(elements.gallerySlider.block, 'active')(action);
        _.setClassName(elements.menu.block, 'slider-active')(action);
    };


    const galleryBgContainer = elements.galleryBackground.container;
    const sliderWrapper = elements.gallerySlider.wrapper;

    const bgWidthOnActive = '50vw';

    const bgWidthAnimation = gsap.timeline({ paused: true })
        .fromTo(galleryBgContainer, { width: gsap.getProperty(galleryBgContainer, 'width') }, { width: bgWidthOnActive, duration: 0.5, ease: 'expo.out' })
        .to(sliderWrapper, { width: bgWidthOnActive, duration: 0.5, ease: 'expo.out' }, 0);

    /**
     * @param {Object} params
     * @param {'activating' | 'desactivating'} params.state
     * @param {number} params.from
     * @param {number} params.to
     * @param {boolean} params.isInit
     */
    const animateActivationGallery = async ({ state, from, to, isInit }) => {
        setActiveCardsBlock(state === 'activating' ? 'add' : 'remove');

        flipTitles({ from, to, state, isInit });

        const p = _.promisifyTimeline;

        await Promise.allSettled([
            p(animateActivationMenu(state)),
            p(state === 'activating' ? bgWidthAnimation.play() : bgWidthAnimation.reverse())
        ]);

        if (state === 'desactivating') {
            activateSideCardsFollowers({ from, to, state: 'desactivating' });
        }
    };

    // const onGalleryResize = ({ isActive = false } = {}) => {
    //     if (isActive) {
    //         const frame = _.queryThrow('.t-container', elements.galleryBackground);
    //         const { width } = _.getRect(frame);

    //         if (width > 0) {
    //             const sliderWrapper = _.queryThrow('.slider-wrapper', elements.cardsWrapper);
    //             gsap.set(sliderWrapper, { width, left: '50%', xPercent: -50 });
    //         }
    //     }
    // };

    // _.onEvent(_.EventNames.gallery.resize, event => onGalleryResize(event.detail));

    // _.onEvent(_.EventNames.gallery.enter, event => {
    //     if (event.detail?.when === 'after')
    //         onGalleryResize({ isActive: true });
    // });

    return { animateSlider, setActiveCardsBlock, animateActivationGallery };
};

/** @typedef {Parameters<ReturnType<(typeof createGalleryAnimation)>['animateSlider']>[0]} AnimateSliderParams */

export { createGalleryAnimation, createGallerySlider };
