// @ts-check


/**
 * @typedef {import("gsap")} gsap
 */


/** @type {typeof import('../underscore.js')._} */
const _ = /** @type {any} */ (window)._;

/** @typedef {'x' | 'y'} Axis */

/**
 * @param {Object} params
 * @param {import('./gallery-layout.js').CategoryElements[]} params.elementsPerCategory
 * @param {Record<Axis, number>} params.maxRotation
 * @param {Record<Axis, number> | ((params: { wrapper: HTMLElement; }) => Record<Axis, number>)} params.maxDistance
 */
const createSideCardsMouseFollowAnimation = ({ elementsPerCategory, maxRotation, maxDistance }) => {

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

    const cardsMouseFollowAnimation = elementsPerCategory.map(({ wrapper }) => {

        // we need to store the initial rotation values to add the new ones
        let rotationStart = undefined;

        const mouseFollower = _.createMouseFollower({
            items: [ wrapper ],
            distanceEasing,
            maxDistance: typeof maxDistance === 'function' ? maxDistance({ wrapper }) : maxDistance,
            onStart: () => {
                rotationStart = {
                    x: gsap.getProperty(wrapper, 'rotationX'),
                    y: gsap.getProperty(wrapper, 'rotationY')
                };
            },
            onMouseMove: data => {
                const d = mouseFollower.getDistanceEase(data);

                const card = /** @type {HTMLElement} */ (data.item.closest('.card'));

                if (!card)
                    throw new Error(`The card is not found for the element: ${data.item}`);

                const deltaRotation = distanceProgressToRotation(d);

                gsap.to(data.item, {
                    duration: 0.5,
                    transformPerspective: 1000,
                    rotationX: rotationStart.x + deltaRotation.x,
                    rotationY: rotationStart.y - deltaRotation.y,
                    ease: 'power2.out'
                });
            }
        });

        return mouseFollower;
    });

    return cardsMouseFollowAnimation;
};


/** @typedef {ReturnType<typeof createSideCardsMouseFollowAnimation>} SideCardsMouseAnimation} */

/**
 * @param {HTMLElement[]} cards
 */
const createGallerySlider = cards => {

    // cards.forEach(card => gsap.set(card, { transformPerspective: 800 }));
    // cards.forEach(card => gsap.set(card, { transformOrigin: 'center center' }));

    const slider = _.GallerySlider.create({
        cards,
        dtStagger: 0.1,
        duration: 0.1 * (cards.length - 1), // duration of the card animation from x = xPercent% to -xPercent%
        // translation of the card at the beginning of the animation (card side by side => at 1 dt, 100% cards' width)
        xPercent: ({ dtStagger }) => (100 / dtStagger) / 2,
        eases: {
            time: 'power3.inOut',
        },
        animateCard2: ({ item, xPercent, duration: T }) => {

            // duration of the card animation from x = xPercent% to -xPercent%

            const tl = gsap.timeline();

            const transformationSettings = {
                duration: T, ease: 'none', immediateRender: false
            };

            const symmetricTransformationSettings = {
                duration: T / 2, yoyo: true, repeat: 1, ease: 'none', immediateRender: false
            };

            tl.fromTo(item,
                { opacity: 1, zIndex: 1 },
                {
                    opacity: 1, zIndex: 100,
                    ...symmetricTransformationSettings, ease: 'power1.in'
                }
            );


            tl.fromTo(item,
                { scaleX: 0.3, scaleY: 1 },
                {
                    scaleX: 1, scaleY: 1,
                    ...symmetricTransformationSettings, ease: 'expo.in'
                },
                0
            );

            tl.fromTo(item,
                { xPercent },
                {
                    xPercent: -xPercent,
                    ...transformationSettings,
                    ease: 'none'
                    // ease: t => t < .5 ? 0.5 * Math.pow(2 * t, 1 / 3) : 1 - 0.5 * Math.pow(2 * (1 - t), 1 / 3)
                },
                0
            );


            // to offset the move on axis X after rotation around Y
            // with the perspective, it moves the cards on the sides

            const customEase = gsap.parseEase(
                // CustomEase.create('custom', 'M0,0 C0.077,0.345 0.415,0.89 0.677,1 0.791,1 1,0.63 1,0.5')
                CustomEase.create("custom", "M0,0 C0.077,0.345 0.198,1.076 0.33,1 0.669,0.802 1,0.091 1,0 ")
            );

            tl.fromTo(_.queryThrow('.t156', item),
                { xPercent: 0 },
                {
                    xPercent: -24,
                    ...transformationSettings,
                    duration: T / 2,
                    ease: customEase
                    // t => t < 0.5 ? customEase(2 * t) : customEase(2 * (1 - t))
                },
                0
            );

            tl.fromTo(_.queryThrow('.t156', item),
                { xPercent: 0 },
                {
                    xPercent: 24,
                    ...transformationSettings,
                    duration: T / 2,
                    ease: t => customEase(1 - t)
                    // t => t < 0.5 ? customEase(2 * t) : customEase(2 * (1 - t))
                },
                T / 2,
            );



            /*tl.fromTo(item,
                { xPercent: '+=0' },
                {
                    xPercent: '+=24',
                    ...symmetricTransformationSettings,
                    ease: CustomEase.create("custom", "M0,0 C0.077,0.345 0.535,1 0.769,1 0.984,1 1,0.63 1,0.5")
                },
                0
            );*/

            tl.fromTo(item, {
                rotateY: -80, rotateZ: 5
            }, {
                rotateY: 80, rotateZ: -5,
                ...transformationSettings
            }, 0);


            tl.fromTo(item, {
                z: -1350, rotateX: -5,
            }, {
                z: 0, rotateX: 0,
                ...symmetricTransformationSettings
            }, 0);

            return tl;
        },
        animateCard: ({ item, xPercent, duration: T }) => {

            // duration of the card animation from x = xPercent% to -xPercent%

            const tl = gsap.timeline();

            const transformationSettings = {
                duration: T, ease: 'none', immediateRender: false
            };

            const symmetricTransformationSettings = {
                duration: T / 2, yoyo: true, repeat: 1, ease: 'none', immediateRender: false
            };


            /**
             * @param {gsap.TweenVars} from
             * @param {gsap.TweenVars} to
             * @param {gsap.Position} time
             * @param {'symetric' | 'normal' } type
             */
            const addFromTo = (from, to, time, type) => {
                return tl.fromTo(item, from, {
                    ...to,
                    ...(type === 'symetric' ? symmetricTransformationSettings : transformationSettings)
                }, time);
            };


            addFromTo({ opacity: 1, zIndex: 1 }, { opacity: 1, zIndex: 100, ease: 'power1.in' }, 0, 'symetric');
            addFromTo({ scaleX: 0.3, scaleY: 1 }, { scaleX: 1, scaleY: 1, ease: 'expo.in' }, 0, 'symetric');
            addFromTo({ xPercent }, { xPercent: -xPercent }, 0, 'normal');


            // to offset the move on axis X after rotation around Y
            // with the perspective, it moves the cards on the sides

            const customEase = gsap.parseEase(
                CustomEase.create('custom', 'M0,0 C0.077,0.345 0.198,1.076 0.33,1 0.669,0.802 1,0.091 1,0')
            );

            tl.fromTo(_.queryThrow('.t156', item),
                { xPercent: 0 },
                {
                    ...transformationSettings,
                    xPercent: -24,
                    duration: T / 2,
                    ease: customEase
                },
                0
            );

            tl.fromTo(_.queryThrow('.t156', item),
                { xPercent: 0 },
                {
                    ...transformationSettings,
                    xPercent: 24,
                    duration: T / 2,
                    ease: t => customEase(1 - t)
                },
                T / 2
            );

            addFromTo({ rotateY: -80, rotateZ: 5 }, { rotateY: 80, rotateZ: -5 }, 0, 'normal');
            addFromTo({ z: -1350, rotateX: -5 }, { z: 0, rotateX: 0 }, 0, 'symetric');

            return tl;
        }
    });



    const slider2 = _.GallerySlider.create({
        cards,
        dtStagger: 0.1,
        duration: 0.1 * (cards.length - 1), // duration of the card animation from x = xPercent% to -xPercent%
        // translation of the card at the beginning of the animation (card side by side => at 1 dt, 100% cards' width)
        xPercent: ({ dtStagger }) => (100 / dtStagger) / 2,
        eases: {
            time: 'power3.inOut',
        },
        animateCard: ({ item, xPercent, duration: T }) => {

            // duration of the card animation from x = xPercent% to -xPercent%

            const tl = gsap.timeline();

            const transformationSettings = {
                duration: T, ease: 'none', immediateRender: false
            };

            const symmetricTransformationSettings = {
                duration: T / 2, yoyo: true, repeat: 1, ease: 'none', immediateRender: false
            };


            /**
             * @param {gsap.TweenVars} from
             * @param {gsap.TweenVars} to
             * @param {gsap.Position} time
             * @param {'symetric' | 'normal' } type
             */
            const addFromTo = (from, to, time, type) => {
                return tl.fromTo(item, from, {
                    ...to,
                    ...(type === 'symetric' ? symmetricTransformationSettings : transformationSettings)
                }, time);
            };


            addFromTo({ opacity: 1, zIndex: 1 }, { opacity: 1, zIndex: 100, ease: 'power1.in' }, 0, 'symetric');
            addFromTo({ scaleX: 0.6, scaleY: 1 }, { scaleX: 1, scaleY: 1, ease: 'expo.in' }, 0, 'symetric');
            addFromTo({ xPercent }, { xPercent: -xPercent }, 0, 'normal');


            // to offset the move on axis X after rotation around Y
            // with the perspective, it moves the cards on the sides

            // const customEase = gsap.parseEase(
            //     CustomEase.create('custom', 'M0,0 C0.077,0.345 0.198,1.076 0.33,1 0.669,0.802 1,0.091 1,0')
            // );

            // tl.fromTo(_.queryThrow('.t156', item),
            //     { xPercent: 0 },
            //     {
            //         ...transformationSettings,
            //         xPercent: -24,
            //         duration: T / 2,
            //         ease: customEase
            //     },
            //     0
            // );

            // tl.fromTo(_.queryThrow('.t156', item),
            //     { xPercent: 0 },
            //     {
            //         ...transformationSettings,
            //         xPercent: 24,
            //         duration: T / 2,
            //         ease: t => customEase(1 - t)
            //     },
            //     T / 2
            // );

            addFromTo({ rotateY: -67, rotateZ: 2 }, { rotateY: 67, rotateZ: -2 }, 0, 'normal');
            addFromTo({ z: -370, rotateX: -1 }, { z: 0, rotateX: 0 }, 0, 'symetric');

            return tl;
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
    const item = _.queryThrow('.t156__item', galleryBackgroundContainer);

    const imageHeight = _.getRect(item).height;

    const cardSidesTL = gsap.timeline({
        scrollTrigger: {
            markers: true,
            trigger: galleryBackgroundContainer,
            scrub: 1,
            start: `center-=${imageHeight / 2} bottom`,
            end: `center+=${imageHeight / 2 + imageHeight} bottom`
        }
    });

    /** @param {number} activeI */
    const sideCards = activeI => cards.filter((_, i) => i !== activeI).map(c => _.queryThrow('.t-container', c));


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
 * @param {import('./gallery-layout.js').Elements} params.elements
 */
const createGalleryAnimation = ({ elements }) => {

    const { menuContainer, menuItems, cards, galleryTitle } = elements;

    const galleryMenu = _.galleryMenu.getGalleryMenu(elements);
    galleryMenu.setMenuItemsImagesStyle([ { prop: 'background-position', mode: 'lg' } ]);

    /** @type {GallerySlider | undefined} */
    let slider = undefined;

    /** @type {SideCardsMouseAnimation | undefined} */
    let sideCardsMouseFollowAnimation = undefined;

    _.onEvent(_.EventNames.gallery.resize, () => {
        sideCardsMouseFollowAnimation?.forEach(a => a.stop());

        sideCardsMouseFollowAnimation = createSideCardsMouseFollowAnimation({
            elementsPerCategory: elements.elementsPerCategory,
            maxRotation: { x: 3, y: 6 },
            maxDistance: ({ wrapper }) => {
                const { width, height } = _.getRect(wrapper);
                return { x: 0.5 * width, y: 0.5 * height };
            }
        });
    });

    /** @type {SideCardsScrollFollow | undefined} */
    let sideCardsScrollFollow = undefined;

    _.onEvent(_.EventNames.gallery.resize, () => {
        sideCardsScrollFollow?.kill();

        sideCardsScrollFollow = createSideCardsScrollFollow({
            galleryBackground: _.queryThrow('.gallery-background .t-container', elements.cardsBlock),
            cards: elements.cards
        });
    });


    const animateMenuToSmallState = () => {
        // we scroll to the menu and make it smaller
        return gsap.timeline()
            .to(window, { scrollTo: { y: menuContainer, offsetY: 25 }, duration: 1, ease: 'expo.out' })
            .to(menuContainer, { height: 120, duration: 1, ease: 'expo.out' }, '<10%');
    };


    /**
     * @param {number} i
     * @param {'add'|'remove'} action
     */
    const flipTitles = (i, action) => {
        const { galleryTitleHeader, menuItemsTitles } = elements;

        const title = menuItemsTitles[ i ];

        if (action === 'add') {
            galleryTitleHeader.innerHTML = title.innerHTML;

            galleryTitleHeader.dataset.flipId = 'gallery-title';
            title.dataset.flipId = 'gallery-title';
        } else {
            galleryTitleHeader.innerHTML = '';
        }

        const titleState = Flip.getState([ title, galleryTitleHeader ]);

        title.classList[ action ]('active');
        galleryTitleHeader.classList[ action ]('active');

        Flip.from(titleState, {
            duration: 0.4, ease: action === 'add' ? 'expo.out' : 'expo.in', toggleClass: 'flipping'
        });
    };


    const wrapI = gsap.utils.wrap(0, menuItems.length);

    /**
     * @param {number} i 
     * @param {'add'|'remove'} action 
     */
    const setStateCards = (i, action) => {
        cards[ wrapI(i) ].dataset.cardState = action === 'add' ? 'active' : '';
        cards[ wrapI(i - 1) ].dataset.cardState = action === 'add' ? 'left' : '';
        cards[ wrapI(i + 1) ].dataset.cardState = action === 'add' ? 'right' : '';
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
            elements.cards.forEach((card, i) => {
                const images = /**@type {HTMLImageElement[]} */(_.queryAllThrow('img', card));
                images.forEach(img => setZoomable(img, activeI === i));
            });
        }, 0);
    };


    /**
     * @param {object} params
     * @param {number | undefined} params.enterI
     * @param {number | undefined} params.leaveI
     * @param {boolean | undefined} [params.onlySlider]
     */
    const animateSlider = ({ enterI, leaveI, onlySlider }) => {
        slider = slider || createGallerySlider(cards);

        /** @type {Promise<void> | undefined} */
        let sliderTL$ = undefined;

        const isFirst = leaveI === undefined && enterI !== undefined;

        if (onlySlider) {
            if (leaveI !== undefined)
                setStateCards(leaveI, 'remove');

            if (enterI !== undefined) {
                sliderTL$ = slider.goTo(enterI).then(() => {});
                setZoomableCard(enterI);
                setStateCards(enterI, 'add');
            }

            return sliderTL$;
        }

        if (isFirst) {
            animateMenuToSmallState();
            gsap.to(galleryTitle, { opacity: 1, duration: 0.5, ease: 'expo.out' });
        }


        if (leaveI !== undefined) {
            setStateCards(leaveI, 'remove');

            // sideCardsMouseFollowAnimation?.forEach(a => a.stop());
            flipTitles(leaveI, 'remove');
        }

        if (enterI !== undefined)
            sliderTL$ = slider.goTo(enterI).then(() => {});


        if (enterI !== undefined) {

            setStateCards(enterI, 'add');
            setZoomableCard(enterI);

            // sliderTL$?.then(() => {
            //     sideCardsMouseFollowAnimation?.[ wrapI(enterI - 1) ].start();
            //     sideCardsMouseFollowAnimation?.[ wrapI(enterI + 1) ].start();
            // });

            flipTitles(enterI, 'add');
        }

        // if (leaveI !== undefined)
        //     sideCardsScrollFollow?.clear(leaveI);

        // if (enterI !== undefined)
        //     sideCardsScrollFollow?.create(enterI);

        return sliderTL$;
    };



    const setActiveTitle = _.setClassName(elements.galleryTitle, 'active');
    const setActiveCardsBlock = _.setClassName(elements.cardsBlock, 'active');

    const cardsAppearAnimation = createGalleryApparationAnimation(elements.cardsBlock);

    /** @param {'add'|'remove'} action */
    const animateCardsApparition = action => {
        setActiveCardsBlock(action);

        const tl = action === 'add' ? cardsAppearAnimation.play() : cardsAppearAnimation.reverse();
        return tl;
    };

    /** @param {'add'|'remove'} action */
    const activateCardTitles = action => {
        setActiveTitle(action);
        galleryMenu.setMenuItemsImagesStyle([ { prop: 'background-position', mode: action === 'add' ? 'xs' : 'lg' } ]);
    };

    return { animateSlider, animateCardsApparition, activateCardTitles };
};



export { createGalleryAnimation, createGallerySlider };
