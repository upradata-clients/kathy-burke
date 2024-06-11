// gallery/gallery-layout.js
_.define(() => {
    // @ts-check


    /**
     * @typedef {import("gsap")} gsap
     */


    /** @type {typeof import('../common/underscore.js')._} */
    const _ = /** @type {any} */ (window)._;


    /**
     * An array that holds the categories for the gallery.
     * @typedef {{ name: string; imagesRecids: string[];}[]} GalleryCategories
     */



    /** @typedef {{ images: HTMLElement[]; wrapper: HTMLElement; block: HTMLElement; }} CategoryElements} */


    /**
     * @param {HTMLElement} element
     * @param {HTMLElement} parent 
     */
    const centerPositionedElement = (element, parent) => {
        // element is absolutely positioned relative to the parent, we need to center it
        const {
            width: parentWidth
        } = _.getRect(parent);
        const {
            width: itemWidth
        } = _.getRect(element);

        const left = (parentWidth - itemWidth) / 2;
        gsap.set(element, {
            left
        });
    };


    /**
     * @param {GalleryCategories} galleryCategories
     */
    const createGalleriesLayout = galleryCategories => {

        // we move all images to first images block
        const imagesBlocksPerCategory = galleryCategories.map(({
            imagesRecids
        }) => [...imagesRecids.map(_.getElementFromRecid)]);


        /**
         * 
         * @param {HTMLElement[]} blocks 
         * @param {number} categoryI 
         * @returns {CategoryElements}
         */
        const mergeItemsInFirstBlockOfCategory = (blocks, categoryI) => {

            const block = blocks[0];
            const wrapper = _.queryThrow('.t156__wrapper', block);

            const images = blocks.flatMap((block, i) => {
                const images = _.queryAllThrow('.t156__item', block);

                if (i === 0) {
                    block.setAttribute('class', `gallery gallery-${categoryI} card r t-rec`);
                    [...wrapper.children].filter(el => el.innerHTML === '').forEach(el => el.remove());
                } else {
                    wrapper.append(...images);
                    block.remove();
                }

                images.forEach(image => {
                    image.dataset.lazyRule = 'skip'; // optimoff
                });

                return images;
            });


            return {
                images,
                wrapper,
                block
            };
        };



        /**
         * @param {CategoryElements[]} elementsPerCategory 
         * @returns {{ cardsBlock: HTMLElement; cardsWrapper: HTMLElement; galleryBackground: HTMLElement; }}
         */
        const createCardsContainer = elementsPerCategory => {

            const firstCategory = elementsPerCategory[0];

            firstCategory.block.insertAdjacentHTML(
                'beforebegin',
                '<div id="cards" class="cards"><div class="cards__wrapper"></div></div>'
            );

            const cardsBlock = _.queryThrow('#cards');
            const cardsWrapper = _.queryThrow('.cards__wrapper', cardsBlock);

            cardsWrapper.insertAdjacentHTML(
                'afterbegin',
                '<div class="slider-wrapper"></div>'
            );

            const sliderWrapper = _.queryThrow('.slider-wrapper', cardsWrapper);

            // we move all images blocks (each block is a category) to the cards wrapper
            sliderWrapper.replaceChildren(...elementsPerCategory.map(({
                block
            }) => block));

            // we create a skeleton block
            const galleryBackground = /** @type {HTMLElement} */ (firstCategory.block.cloneNode(true));

            galleryBackground.removeAttribute('id');
            galleryBackground.className = 'gallery-background';

            // we remove all item contents from the skeleton
            [...galleryBackground.querySelectorAll('.t156__item')].forEach(el => el.replaceChildren());

            cardsBlock.append(galleryBackground);

            return {
                cardsBlock,
                cardsWrapper,
                galleryBackground
            };
        };

        const elementsPerCategory = imagesBlocksPerCategory.map(mergeItemsInFirstBlockOfCategory);

        return {
            ...createCardsContainer(elementsPerCategory),
            elementsPerCategory,
            imagesPerCategory: elementsPerCategory.map(c => c.images),
            allImages: elementsPerCategory.flatMap(c => c.images),
            cards: elementsPerCategory.map(c => c.block)
        };
    };

    /** @param {GalleryCategories} galleryCategories */
    const createElements = galleryCategories => {

        const menu = _.queryThrow('.uc-gallery-menu');
        const menuContainer = _.queryThrow('.t959__container', menu);
        const menuItems = _.queryAllThrow('.t959__card', menuContainer);
        const menuItemsTitles = menuItems.map(m => _.queryThrow('.t-card__title', m));

        const galleryTitle = _.queryThrow('.uc-gallery-title');

        const galleryTitleHeader = _.queryThrow('.t030__title', galleryTitle);
        const galleryTitleHeader2 = /** @type {HTMLElement} */ (galleryTitleHeader.cloneNode(true));

        galleryTitleHeader.classList.add('gallery-title-header-1');
        galleryTitleHeader2.classList.add('gallery-title-header-2');

        galleryTitle.insertAdjacentHTML('afterbegin', '<div class="gallery-titles"></div>');
        const galleryTitles = _.queryThrow('.gallery-titles', galleryTitle);

        galleryTitles.append(galleryTitleHeader, galleryTitleHeader2);

        return {
            menu,
            menuContainer,
            menuItems,
            menuItemsTitles,
            galleryTitle,
            galleryTitles,
            galleryTitleHeader,
            galleryTitleHeader2,
            ...createGalleriesLayout(galleryCategories)
        };
    };

    /**
     * @typedef {ReturnType<typeof createElements>} Elements
     */


    return {
        createElements
    };

});

// gallery/gallery-menu.js
_.define(() => {
    // @ts-check


    /** @type {typeof import('../common/underscore.js')._} */
    const _ = /** @type {any} */ (window)._;

    /**
     * @typedef {import('../common/images-settings.js').ImageSettings} ImageSettings
     * @typedef {import('../common/images-settings.js').ImageSettingsProp} ImageSettingsProp
     * @typedef {import('../common/images-settings.js').ImageSettingsMode} ImageSettingsMode
     */



    /**
     * @param {import('./gallery-layout.js').Elements} elements
     */
    const initGalleryMenu = elements => {


        const menuItemsTitles = elements.menuItems.map(m => _.queryThrow('.t-card__title', m));
        const menuItemsImages = elements.menuItems.map(item => _.queryThrow('.t959__card-image', item));


        /** @type {ImageSettings[]} */
        const menuItemsImagesSettings = _.getImagesSettings(menuItemsImages);

        /**
         * @param {Array<string | { prop: ImageSettingsProp; mode: ImageSettingsMode }>} styles 
         */
        const setMenuItemsImagesStyle = styles => {

            menuItemsImagesSettings.forEach((imagesSettings, i) => {

                const cssStyles = styles.reduce((cssStyles, style) => {

                    const {
                        prop,
                        mode
                    } = typeof style === 'string' ? {
                        prop: style,
                        mode: 'value'
                    } : style;

                    const value = imagesSettings[prop]?.[mode];

                    return value ? {
                        ...cssStyles,
                        [prop]: imagesSettings[prop][mode]
                    } : cssStyles;
                }, {});

                if (cssStyles)
                    gsap.set(menuItemsImages[i], cssStyles);
            });
        };

        const params = {
            menuItems: elements.menuItems,
            menuContainer: elements.menuContainer
        };

        const hinter = createMenuHinter(params);

        addMenuAppareanceAnimation(params);
        addMenuOnHover({
            ...params,
            ...hinter
        });

        return {
            ...params,
            ...hinter,
            menuItemsTitles,
            menuItemsImages,
            menuItemsImagesSettings,
            setMenuItemsImagesStyle
        };
    };

    /**
     * @typedef {ReturnType<typeof initGalleryMenu>} GalleryMenu
     */


    /** @param {Pick<import('./gallery-layout.js').Elements,'menuItems' | 'menuContainer'>} params */
    const createMenuHinter = ({
        menuContainer,
        menuItems
    }) => {

        _.queryThrow('.t959__card-overlay', menuContainer).setAttribute('style', '');

        menuItems.forEach(item => {
            menuContainer.append(item);
            item.classList.remove('t959__card_25');
        });

        menuItems[0].insertAdjacentHTML('beforeend', `
        <div class="card--hint">
            <span class="hinter"></span>
            <span class="hinter"></span>
            <span class="hinter"></span>
        </div>
    `.trim());


        _.queryAllThrow('.t959__row', menuContainer).forEach(el => el.remove());

        const hinter = _.queryThrow('.card--hint', menuItems[0]);
        const hinterItems = _.queryAllThrow('.card--hint .hinter', menuItems[0]);


        /** @param {number} i */
        const hinterGoTo = i => {
            const itemHovered = menuItems[i];

            const state = Flip.getState(hinterItems, {
                props: 'opacity'
            });

            itemHovered.append(hinter);
            gsap.set(hinterItems, {
                opacity: 1
            });

            Flip.from(state, {
                duration: 0.5,
                ease: 'expo.inOut',
                stagger: 0.05,
                overwrite: true
            });
        };


        return {
            hinter,
            hinterItems,
            hinterGoTo
        };
    };


    /** @typedef {ReturnType<typeof createMenuHinter>} Hinter */




    /** @param {Pick<import('./gallery-layout.js').Elements,'menuItems' | 'menuContainer'>} params */
    const addMenuAppareanceAnimation = ({
        menuItems,
        menuContainer
    }) => {

        // menu cards appear animation
        gsap.from(menuItems, {
            scrollTrigger: {
                // markers: true,
                trigger: menuContainer,
                toggleActions: 'play none none reverse',
                start: 'center bottom'
            },
            opacity: 0,
            scale: 0.3,
            x: 200,
            y: 50,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power4.out'
        });
    };




    /** @param {Pick<import('./gallery-layout.js').Elements,'menuItems' | 'menuContainer'> & Hinter} params */
    const addMenuOnHover = ({
        menuItems,
        menuContainer,
        hinterGoTo,
        hinterItems
    }) => {

        /**
         * @param {HTMLElement} el
         * @param {{ enter?: (this: HTMLElement, ev: PointerEvent) => any, leave?: (this: HTMLElement, ev: PointerEvent) => any }} callbacks
         */
        const onHover = (el, callbacks) => {
            if (callbacks.enter)
                el.addEventListener('pointerenter', callbacks.enter);
            if (callbacks.leave)
                el.addEventListener('pointerleave', callbacks.leave);
        };


        let isActive = false;

        onHover(menuContainer, {
            enter: () => {
                isActive = true;
            },
            leave: () => {
                if (isActive)
                    return;

                isActive = false;
                gsap.to(hinterItems, {
                    opacity: 0,
                    duration: 0.2,
                    ease: 'power4.out',
                    stagger: 0.04,
                    overwrite: true
                });
            },
        });


        menuItems.forEach((item, i) => onHover(item, {
            enter: () => hinterGoTo(i)
        }));

    };



    /**  @typedef {import('./gallery-animation.js').AnimateSliderParams} AnimateSliderParams */

    /**
     * @param {Object} params
     * @param {import('./gallery-layout.js').Elements} params.elements
     * @param {(from: number, to: number, isInit: boolean) => void | Promise<void>} [params.onActivating]
     * @param {(params: AnimateSliderParams) => void | Promise<void>} [params.onClickMenuItem]
     * @param {(from: number, to: number) => void | Promise<void>} [params.onDesactivating]
     * @param {Hinter['hinterGoTo']} params.hinterGoTo
     */
    const createGalleryMenuListener = ({
        elements,
        onActivating,
        onClickMenuItem,
        onDesactivating,
        hinterGoTo
    }) => {

        /** @type {{menuItem: HTMLElement | undefined; i: number; isInit: boolean; movingI: number | undefined; sliderState: AnimateSliderParams['state']; }} */
        let state = {
            menuItem: undefined,
            isInit: true,
            movingI: undefined,
            i: -1,
            sliderState: 'desactivated'
        };

        /**
         * @param {HTMLElement | undefined} menuItem - The menu item to modify.
         * @param {'add' | 'remove'} action - The action to perform ('add' or 'remove').
         */
        const setActiveMenuItem = (menuItem, action) => _.setClassName(menuItem, 'active')(action);

        /** @param {void | Promise<void>} value */
        const waitIfPromise = async value => {
            if (value instanceof Promise)
                await value;
        };

        /**
         * @param {number} i
         * @param {AnimateSliderParams['state']} [sliderState]
         */
        const goTo = async (i, sliderState) => {
            const menuItem = elements.menuItems[i];

            const currentIndex = state.movingI ?? state.i;

            const isSame = currentIndex === i;
            const isActivating = state.sliderState === 'desactivated' || state.sliderState === 'desactivating';
            const isDesactivating = isSame && (state.sliderState === 'activated' || state.sliderState === 'activating');

            setActiveMenuItem(state.menuItem, 'remove');
            setActiveMenuItem(menuItem, 'add');

            // const isActive = isEntering ? true : isLeaving ? false : true;
            const newGalleryState = sliderState ? sliderState : isActivating ? 'activating' : isDesactivating ? 'desactivating' : 'activated';

            /** @type {AnimateSliderParams} */
            const sliderParams = {
                from: typeof state.movingI !== 'undefined' ? state.movingI : state.i,
                to: i,
                state: newGalleryState,
                isInit: state.isInit
            };

            state = {
                ...state,
                menuItem,
                movingI: i,
                sliderState: newGalleryState
            };

            hinterGoTo(i);


            if (sliderState ? sliderState === 'activating' : isActivating) {
                _.dispatchEvent(_.EventNames.gallery.enter, {
                    when: 'before'
                });
                await waitIfPromise(onActivating?.(sliderParams.from, sliderParams.to, state.isInit));
                _.dispatchEvent(_.EventNames.gallery.enter, {
                    when: 'after'
                });
            }

            await waitIfPromise(onClickMenuItem?.(sliderParams));

            state = {
                ...state,
                isInit: false
            };

            if (sliderState ? sliderState === 'desactivating' : isDesactivating) {
                await waitIfPromise(onDesactivating?.(sliderParams.from, sliderParams.to));
                _.dispatchEvent(_.EventNames.gallery.leave);
            }

            if (state.movingI === i)
                state = {
                    ...state,
                    i,
                    movingI: undefined
                };

            state.sliderState = state.sliderState === 'desactivating' ? 'desactivated' : state.sliderState === 'activating' ? 'activated' : state.sliderState;
        };


        elements.menuItems.forEach((menuItem, i) => {
            const card = elements.cards[i];

            const isStateI = () => typeof state.movingI !== 'undefined' ? state.movingI === i : state.i === i;

            menuItem.addEventListener('pointerup', () => goTo(i), {
                passive: true
            });

            card.addEventListener('pointerup', () => {
                if (state.sliderState === 'desactivated' || state.sliderState === 'desactivating' || !isStateI())
                    goTo(i);
            }, {
                passive: true
            });

            menuItem.addEventListener('pointerenter', () => {
                if (state.sliderState === 'desactivated' && !isStateI())
                    goTo(i, 'desactivated');
            }, {
                passive: true
            });


            const cardOpacityAnimation = gsap.timeline({
                paused: true
            }).to(card, {
                opacity: 1,
                duration: 0.3,
                ease: 'power4.out'
            });

            card.addEventListener('pointerenter', () => {
                if (typeof state.movingI !== 'undefined')
                    hinterGoTo(i);

                if (state.sliderState === 'desactivated')
                    cardOpacityAnimation.play();
            }, {
                passive: true
            });

            card.addEventListener('pointerleave', () => {
                if (state.sliderState === 'desactivated')
                    cardOpacityAnimation.reverse();
            }, {
                passive: true
            });
        });


        return {
            goTo
        };
    };


    const galleryMenu = {
        initGalleryMenu,
        createGalleryMenuListener
    };

    return {
        galleryMenu
    };

});

// gallery/gallery-animation.js
_.define(() => {
    // @ts-check


    /**
     * @typedef {import("gsap")} gsap
     */


    /** @type {typeof import('../common/underscore.js')._} */
    const _ = /** @type {any} */ (window)._;

    /** @typedef {'x' | 'y'} Axis */

    /**
     * @param {Object} params
     * @param {import('./gallery-layout.js').CategoryElements[]} params.elementsPerCategory
     * @param {Record<Axis, number>} params.maxRotation
     * @param {Record<Axis, number> | ((params: { wrapper: HTMLElement; }) => Record<Axis, number>)} params.maxDistance
     */
    const createSideCardsMouseFollowAnimation = ({
        elementsPerCategory,
        maxRotation,
        maxDistance
    }) => {

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
            return Object.fromEntries(['x', 'y'].map(axis => [
                axis,
                gsap.utils.mapRange(-1, 1, -maxRotation[axis], maxRotation[axis], distanceProgress[axis === 'x' ? 'y' : 'x'])
            ]));
        };

        const cardsMouseFollowAnimation = elementsPerCategory.map(({
            wrapper
        }) => {

            /** @typedef {{ x: number; y: number;}}  Point2D */

            // we need to store the initial rotation values to add the new ones
            /** @type {Point2D} */
            let rotationStart = {
                x: 0,
                y: 0
            };

            // -maxRotation.x <= rotation <= maxRotation.x (the same for y)
            const rNormMax = Math.sqrt((2 * maxRotation.x) ** 2 + (2 * maxRotation.y) ** 2);


            const mouseFollower = _.createMouseFollower({
                items: [wrapper],
                distanceEasing,
                maxDistance: typeof maxDistance === 'function' ? maxDistance({
                    wrapper
                }) : maxDistance,
                onStart: () => {
                    rotationStart = /** @type {Point2D} */ ({
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

                    const prevRotation = /** @type {Point2D} */ ({
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
                        clearProps: 'all',
                        onComplete: resolve
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

            return {
                mouseFollower,
                item: wrapper
            };
        });

        return {
            animations: cardsMouseFollowAnimation,
            start: () => cardsMouseFollowAnimation.forEach(({
                mouseFollower
            }) => mouseFollower.start()),
            stop: async () => {
                await Promise.allSettled(cardsMouseFollowAnimation.map(async ({
                    mouseFollower,
                    item
                }, i) => mouseFollower.stop()));
            }
        };
    };


    /** @typedef {ReturnType<typeof createSideCardsMouseFollowAnimation>} SideCardsMouseAnimation} */

    /**
     * @param {HTMLElement[]} cards
     * @param {import('./gallery-layout.js').Elements} elements
     */
    const createGallerySlider = (cards, elements) => {

        // cards.forEach(card => gsap.set(card, { transformPerspective: 800 }));
        cards.forEach(card => gsap.set(card, {
            transformOrigin: 'center center'
        }));

        const sliderWrapper = _.queryThrow('.slider-wrapper', elements.cardsWrapper);
        const galleryBackgroundFrame = _.queryThrow('.t-container', elements.galleryBackground);

        gsap.set(sliderWrapper, {
            width: gsap.getProperty(galleryBackgroundFrame, 'width')
        });

        const slider = _.GallerySlider.create({
            cards,
            dtStagger: 0.1,
            duration: 0.1 * (cards.length - 1), // duration of the card animation from x = xPercent% to -xPercent%
            // translation of the card at the beginning of the animation (card side by side => at 1 dt, 100% cards' width)
            xPercent: ({
                dtStagger
            }) => 0.85 * (100 / dtStagger) / 2,
            eases: {
                time: 'power3.inOut',
            },
            animateCard: ({
                item,
                xPercent,
                duration: T
            }) => {
                const tl = gsap.timeline();

                const transformationSettings = {
                    duration: T,
                    ease: 'none',
                    immediateRender: false
                };

                const symmetricTransformationSettings = {
                    duration: T / 2,
                    yoyo: true,
                    repeat: 1,
                    ease: 'none',
                    immediateRender: false
                };


                /**
                 * @param {Object} params
                 * @param {gsap.TweenVars} params.from
                 * @param {gsap.TweenVars} params.to
                 * @param {gsap.Position} params.time
                 * @param {'symetric' | 'normal'} params.type
                 * @param {HTMLElement} [params.el]
                 */
                const addFromTo = ({
                    from,
                    to,
                    time,
                    type,
                    el = item
                }) => {
                    return tl.fromTo(el, from, {
                        ...(type === 'symetric' ? symmetricTransformationSettings : transformationSettings),
                        ...to
                    }, time);
                };


                addFromTo({
                    from: {
                        opacity: 0.4,
                        zIndex: 1
                    },
                    to: {
                        opacity: 1,
                        zIndex: 100,
                        ease: 'linear'
                    },
                    time: 0,
                    type: 'symetric'
                });
                addFromTo({
                    from: {
                        scaleX: 0.3,
                        scaleY: 1
                    },
                    to: {
                        scaleX: 1,
                        scaleY: 1,
                        ease: 'expo.in'
                    },
                    time: 0,
                    type: 'symetric'
                });
                addFromTo({
                    from: {
                        xPercent
                    },
                    to: {
                        xPercent: -xPercent
                    },
                    time: 0,
                    type: 'normal'
                });

                // to offset the move on axis X after rotation around Y
                // with the perspective, it moves the cards on the sides

                const customEase = gsap.parseEase(
                    CustomEase.create('custom', 'M0,0 C0.077,0.345 0.198,1.076 0.33,1 0.669,0.802 1,0.091 1,0')
                );

                addFromTo({
                    el: _.queryThrow('.t156', item),
                    from: {
                        xPercent: 0
                    },
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
                    from: {
                        xPercent: 0
                    },
                    to: {
                        xPercent: 24,
                        duration: T / 2,
                        ease: t => customEase(1 - t)
                        // t => t < 0.5 ? customEase(2 * t) : customEase(2 * (1 - t))
                    },
                    time: T / 2,
                    type: 'normal'
                });



                addFromTo({
                    from: {
                        rotateY: -80,
                        rotateZ: 5
                    },
                    to: {
                        rotateY: 80,
                        rotateZ: -5
                    },
                    time: 0,
                    type: 'normal'
                });
                addFromTo({
                    from: {
                        z: -1350,
                        rotateX: -5
                    },
                    to: {
                        z: 0,
                        rotateX: 0
                    },
                    time: 0,
                    type: 'symetric'
                });

                return tl;
            },
            onStop: () => {
                cards.forEach(card => {
                    gsap.set(_.queryThrow('.t156', card), {
                        clearProps: 'all'
                    });
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
    const createSideCardsScrollFollow = ({
        galleryBackground,
        cards
    }) => {

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
            gsap.set(sideCards(activeI), {
                clearProps: 'y'
            });
            cardSidesTL.clear();
        };

        return {
            create,
            clear,
            kill: () => cardSidesTL.revert()
        };
    };


    /** @typedef {ReturnType<typeof createSideCardsScrollFollow>} SideCardsScrollFollow */

    /** @param {HTMLElement} cardsBlock */
    const createGalleryApparationAnimation = cardsBlock => {
        return gsap
            .timeline({
                paused: true
            })
            .to(cardsBlock, {
                opacity: 1,
                ease: 'expo.out',
                duration: 0.7
            });
    };

    /**
     * @param {object} params
     * @param {import('./gallery-layout.js').Elements} params.elements
     * @param {import('./gallery-menu.js').GalleryMenu} params.galleryMenu
     */
    const createGalleryAnimation = ({
        elements,
        galleryMenu
    }) => {

        const {
            menuContainer,
            cards,
            galleryTitle
        } = elements;

        galleryMenu.setMenuItemsImagesStyle([{
            prop: 'background-position',
            mode: 'lg'
        }]);

        const slider = _.lazyFactory(() => createGallerySlider(cards, elements))({
            destroy: slider => slider.stop()
        });
        // /** @param {GallerySlider} slider */

        const sideCardsMouseFollowAnimation = _.lazyFactory(
            /** @param {number[]} indexes */
            indexes => createSideCardsMouseFollowAnimation({
                elementsPerCategory: elements.elementsPerCategory.filter((_, i) => indexes.includes(i)),
                maxRotation: {
                    x: 3,
                    y: 6
                },
                maxDistance: ({
                    wrapper
                }) => {
                    const {
                        width,
                        height
                    } = _.getRect(wrapper);
                    return {
                        x: 0.5 * window.innerWidth / 2 /* width */ ,
                        y: 0.5 * height
                    };
                }
            })
        )({
            destroy: sideCardsMouseFollowAnimation => sideCardsMouseFollowAnimation.stop(),
            isParamsEqual: (a, b) => a.length === b.length && a.every((v, i) => v === b[i])
        });


        const sideCardsScrollFollow = _.lazyFactory(() => createSideCardsScrollFollow({
            galleryBackground: _.queryThrow('.t-container', elements.galleryBackground),
            cards: elements.cards
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
            galleryMenu.setMenuItemsImagesStyle([{
                prop: 'background-position',
                mode: action === 'activating' ? 'xs' : 'lg'
            }]);

            if (action === 'activating') {
                if (!menuHeight)
                    menuHeight = gsap.getProperty(menuContainer, 'height');

                return gsap.timeline()
                    // we scroll to the menu and make it smaller
                    .to(window, {
                        scrollTo: {
                            y: menuContainer,
                            offsetY: 25
                        },
                        duration: 1,
                        ease: 'expo.out'
                    })
                    .to(menuContainer, {
                        height: 120,
                        duration: 0.5,
                        ease: 'expo.out'
                    }, '<10%');
            }

            return gsap.timeline().to(menuContainer, {
                height: menuHeight,
                duration: 1,
                ease: 'expo.in'
            }, '<10%');
        };

        /**
         * @param {Object} params
         * @param {number} params.from
         * @param {number} params.to
         * @param {AnimateSliderParams['state']} params.state
         * @param {boolean} params.isInit
         */
        const flipTitles = ({
            from,
            to,
            state,
            isInit
        }) => {

            const {
                galleryTitleHeader,
                galleryTitleHeader2,
                menuItemsTitles
            } = elements;


            if (state === 'activated' || state === 'activating') {
                const sideMenuItems = menuItemsTitles.filter((_, i) => i !== to);

                if (from === to) {
                    if (state === 'activating') {
                        gsap.to(menuItemsTitles, {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.4,
                            ease: 'expo.out',
                            overwrite: true
                        });

                        sideMenuItems.forEach((item, i) => {
                            item.classList.remove('active');
                        });

                        menuItemsTitles[to].classList.add('active');
                    }
                }

                if (from === to)
                    return;

                galleryTitleHeader.innerHTML = menuItemsTitles[to].innerHTML;

                galleryTitleHeader.dataset.flipId = 'gallery-title';
                menuItemsTitles[to].dataset.flipId = 'gallery-title';

                const titleState = Flip.getState([menuItemsTitles[to], galleryTitleHeader]);

                menuItemsTitles[from].classList.remove('active');
                menuItemsTitles[to].classList.add('active');

                galleryTitleHeader.classList.add('active');

                return Flip.from(titleState, {
                    duration: 0.4,
                    ease: 'expo.out' /* flipAction === 'flip' ? 'expo.out' : 'expo.in' */ ,
                    toggleClass: 'flipping'
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
                    const items = from === to ? menuItemsTitles.filter((_, i) => i !== to) : [menuItemsTitles[from]];
                    gsap.to(items, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.4,
                        ease: 'expo.out',
                        overwrite: true
                    });
                }

                // gsap.to(menuItemsTitles, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'expo.out', overwrite: true });

                if (to !== -1) {
                    gsap.fromTo(menuItemsTitles[to], {
                        /* opacity: 1, */
                        y: 0,
                        scale: 1
                    }, {
                        /* opacity: 0, */
                        y: 0,
                        scale: 0.8,
                        duration: 0.4,
                        delay: 0.1,
                        ease: 'ease.out',
                        overwrite: true,
                        immediateRender: false
                    });
                    // const splitText = new SplitText(menuItemsTitles[ to ]);

                    // gsap.set(menuItemsTitles[ to ], { perspective: 400 });
                    // splitText.split({ type: 'chars, words' });
                    // gsap.to(splitText.chars, {
                    //     duration: 0.6, stagger: 0.02, scale: 0
                    //     // scale: 2, opacity: 1, rotationX: -80, transformOrigin: '100% 50%', ease: 'power2.out', stagger: 0.02 
                    // });
                }
            } else {
                gsap.to(menuItemsTitles, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.4,
                    ease: 'expo.out',
                    overwrite: true
                });
            }

            if (isInit) {
                galleryTitleHeader.textContent = menuItemsTitles[to].textContent;
                return gsap.fromTo(galleryTitleHeader, {
                    opacity: 0,
                    y: -100
                }, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'expo.out'
                });
            }

            if (from === to)
                return;

            galleryTitleHeader2.textContent = menuItemsTitles[to].textContent;

            return gsap.timeline()
                .to(galleryTitleHeader, {
                    opacity: 0,
                    x: 400,
                    duration: 0.4,
                    ease: 'expo.in',
                    overwrite: true
                })
                .fromTo(galleryTitleHeader2, {
                    opacity: 0,
                    x: -400
                }, {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    ease: 'expo.out',
                    overwrite: true,
                    onComplete: () => {
                        galleryTitleHeader.textContent = menuItemsTitles[to].textContent;
                        gsap.set(galleryTitleHeader, {
                            opacity: 1,
                            x: 0
                        });
                        gsap.set(galleryTitleHeader2, {
                            opacity: 0
                        });
                        galleryTitleHeader2.textContent = '';
                    }
                }, 0.3);
        };



        /**
         * @param {number} i 
         * @param {'add'|'remove'} action 
         */
        const setStateCards = (i, action) => {
            cards[i].dataset.cardState = action === 'add' ? 'active' : '';
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
                elements.cards.forEach((card, i) => {
                    const images = /**@type {HTMLImageElement[]} */ (_.queryAllThrow('img', card));
                    images.forEach(img => setZoomable(img, activeI === i));
                });
            }, 0);
        };


        /**
         * @param {Object} params
         * @param {number} params.from
         * @param {number} params.to
         * @param { 'activated' | 'activating' | 'desactivated' | 'desactivating' } params.state
         */
        const activateSideCardsFollowers = async ({
            state,
            from,
            to
        }) => {

            let p$ = Promise.resolve();

            // const sideCardsMouseFollowAnimationInstance = sideCardsMouseFollowAnimation.instance();

            // if (sideCardsMouseFollowAnimationInstance) {
            //     gsap.to(sideCardsMouseFollowAnimationInstance.animations[ index ].item, {
            //         // rotateX: 0, rotateY: 0,/*  duration: 0.2, ease: 'power4.out' */
            //         clearProps: 'all', duration: 0
            //     });
            // }

            const indexes = cards.map((_, i) => i).filter(i => i !== to);

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
        const animateSlider = ({
            from,
            to,
            state,
            isInit
        }) => {

            /** @type {Promise<void>} */
            let sliderTL$ = Promise.resolve();

            const isSame = from === to;

            if (isInit) {
                gsap.to(galleryTitle, {
                    opacity: 1,
                    duration: 0.5,
                    ease: 'expo.out'
                });
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
                flipTitles({
                    from,
                    to,
                    state,
                    isInit
                });
            };


            // if (from !== -1)
            // if (state === 'activated' || state === 'desactivated')
            //     sideCardsScrollFollow.instance()?.clear(from);

            if (to !== -1)
                sliderTL$.then(() => activateSideCardsFollowers({
                    from,
                    to,
                    state
                }));

            return sliderTL$;
        };



        // const setActiveTitle = _.setClassName(elements.galleryTitle, 'active');
        // setActiveTitle('add');

        /** @param {'add' | 'remove' } action */
        const setActiveCardsBlock = action => {
            _.setClassName(elements.cardsBlock, 'active')(action);
            _.setClassName(elements.menu, 'slider-active')(action);
        };


        const galleryBgContainer = _.queryThrow('.t-container', elements.galleryBackground);
        const sliderWrapper = _.queryThrow('.slider-wrapper', elements.cardsWrapper);

        const bgWidthOnActive = '50vw';

        const bgWidthAnimation = gsap.timeline({
                paused: true
            })
            .fromTo(galleryBgContainer, {
                width: gsap.getProperty(galleryBgContainer, 'width')
            }, {
                width: bgWidthOnActive,
                duration: 0.5,
                ease: 'expo.out'
            })
            .to(sliderWrapper, {
                width: bgWidthOnActive,
                duration: 0.5,
                ease: 'expo.out'
            }, 0);

        /**
         * @param {Object} params
         * @param {'activating' | 'desactivating'} params.state
         * @param {number} params.from
         * @param {number} params.to
         * @param {boolean} params.isInit
         */
        const animateActivationGallery = async ({
            state,
            from,
            to,
            isInit
        }) => {
            setActiveCardsBlock(state === 'activating' ? 'add' : 'remove');

            flipTitles({
                from,
                to,
                state,
                isInit
            });

            const p = _.promisifyTimeline;

            await Promise.allSettled([
                p(animateActivationMenu(state)),
                p(state === 'activating' ? bgWidthAnimation.play() : bgWidthAnimation.reverse())
            ]);

            if (state === 'desactivating') {
                activateSideCardsFollowers({
                    from,
                    to,
                    state: 'desactivating'
                });
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

        return {
            animateSlider,
            setActiveCardsBlock,
            animateActivationGallery
        };
    };

    /** @typedef {Parameters<ReturnType<(typeof createGalleryAnimation)>['animateSlider']>[0]} AnimateSliderParams */

    return {
        createGalleryAnimation,
        createGallerySlider
    };

});

// gallery/gallery-slider.js
_.define(() => {
    // @ts-check


    /**
     * @typedef {import("gsap").gsap}
     */

    // gsap.registerPlugin(ScrollTrigger, Draggable);

    /**
     * @typedef {Object} Eases
     * @property {gsap.EaseString | gsap.EaseFunction} [cardOpacity]
     * @property {gsap.EaseString | gsap.EaseFunction} [time]
     */


    /**
     * @typedef {{ dtStagger: number; duration: number; item: HTMLElement; index: number; xPercent: number; }} GalleryData
     * @typedef {(data: GalleryData) => gsap.core.Timeline} CardAnimation
     */

    /**
     * @param {Object} params
     * @param {HTMLElement[]} params.cards
     * @param {number} [params.dtStagger]
     * @param {number} [params.duration]
     * @param {number|((data: { dtStagger: number; }) => number)} [params.xPercent]
     * @param {(cards: HTMLElement[], data: { dtStagger: number; }) => void} [params.initCards]
     * @param {CardAnimation} [params.animateCard]
     * @param {Eases} [params.eases]
     * @param {(data: { dtStagger: number; previousDuration: number; from: number; to: number; }) => number} [params.moveToDuration]
     * @param {() => void | Promise<void>} [params.onStop]
     */
    const createGallerySlider = params => {
        const {
            cards,
            initCards,
            dtStagger = 0.1, // delta T (stagger) between each card animation
            duration = 1, // duration of the card animation from x = xPercent% to -xPercent%
            moveToDuration = ({
                previousDuration
            }) => previousDuration
        } = params;

        const getXPercent = () => {
            const {
                xPercent
            } = params;

            switch (typeof xPercent) {
                case 'number':
                    return xPercent;
                case 'function':
                    return xPercent({
                        dtStagger
                    });
                default:
                    return (100 / dtStagger) / 2;
            }
        };

        const xPercent = getXPercent();


        /**
         * @type {Eases}
         */
        const eases = {
            cardOpacity: 'power1.in',
            time: 'power3.inOut',
            ...params.eases
        };



        // set initial state of items
        if (initCards)
            initCards(cards, {
                dtStagger
            });
        else
            gsap.set(cards, {
                xPercent,
                opacity: 0,
                scale: 0
            });



        /**
         * Builds a seamless loop animation.
         * @param {Object} options
         * @param {Array<HTMLElement>} options.items - The items to animate.
         * @param {number} options.dtStagger - The delta T (stagger) between each card animation.
         * @param {CardAnimation} options.cardAnimation - The card animation for each item.
         */
        const buildSeamlessLoop = ({
            items,
            dtStagger,
            cardAnimation
        }) => {
            // this is where all the 'real' animations live

            const rawSequence = gsap.timeline({
                paused: true
            });

            // this merely scrubs the playhead of the rawSequence so that it appears to seamlessly loop
            const seamlessLoop = gsap.timeline({
                paused: true,
                repeat: -1, // to accommodate infinite scrolling/looping
                onRepeat() {
                    // works around a super rare edge case bug that's fixed GSAP 3.6.1
                    // this._time === this._dur && (this._tTime += this._dur - 0.01);
                },
                onReverseComplete() {
                    this.totalTime(this.rawTime() + this.duration() * 100); // seamless looping backwards
                }
            });

            const cycleDuration = dtStagger * items.length;
            // the duration of just one animateFunc() (we'll populate it in the .forEach() below...
            const cardAnimationDuration = cardAnimation({
                item: items[0],
                index: 0,
                xPercent,
                dtStagger,
                duration: duration + 0.01
            }).duration();

            // loop through 3 times so we can have an extra cycle at the start and end - we'll scrub the playhead only on the 2nd cycle
            items.concat(items).concat(items).forEach((_, i) => {
                const anim = cardAnimation({
                    item: items[i % items.length],
                    index: i,
                    xPercent,
                    dtStagger,
                    duration: duration + 0.01
                });
                rawSequence.add(anim, i * dtStagger);
            });

            // animate the playhead linearly from the start of the 2nd cycle to its end (so we'll have one 'extra' cycle at the beginning and end)
            seamlessLoop.fromTo(rawSequence, {
                time: cycleDuration + cardAnimationDuration / 2
            }, {
                time: `+=${cycleDuration}`,
                duration: cycleDuration,
                ease: 'none'
            });

            return seamlessLoop;
        };


        // this function will get called for each element in the buildSeamlessLoop() function,
        // and we just need to return an animation that'll get inserted into a master timeline, spaced
        /**
         * @type {CardAnimation}
         */
        const animateCard = element => {

            const tl = gsap.timeline();

            tl
                .fromTo(element, {
                    scale: 0,
                    opacity: 0
                }, {
                    scale: 1,
                    opacity: 1,
                    zIndex: 100,
                    duration: duration / 2,
                    yoyo: true,
                    repeat: 1,
                    ease: eases.cardOpacity,
                    immediateRender: false
                })
                .fromTo(element, {
                        xPercent
                    }, {
                        xPercent: -xPercent,
                        duration: duration,
                        ease: 'none',
                        immediateRender: false
                    },
                    0
                );

            return tl;
        };


        const seamlessLoop = buildSeamlessLoop({
            items: cards,
            dtStagger: dtStagger,
            cardAnimation: params.animateCard || animateCard
        });

        // feed in any offset (time) and it'll return the corresponding wrapped time (a safe value between 0 and the seamlessLoop's duration)
        const wrapTime = gsap.utils.wrap(0, seamlessLoop.duration());


        // a proxy object we use to simulate the playhead position, but it can go infinitely in either direction and
        // we'll just use an onUpdate to convert it to the corresponding time on the seamlessLoop timeline.
        const playhead = {
            t: 0
        };

        // we reuse this tween to smoothly scrub the playhead on the seamlessLoop
        const scrub = gsap.to(playhead, {
            t: 0,
            onUpdate() {
                // convert the offset to a 'safe' corresponding time on the seamlessLoop timeline
                seamlessLoop.time(wrapTime(playhead.t));
            },
            duration: duration / 2,
            ease: eases.time,
            paused: true
        });


        /**
         * Moves the scrub to a specific time.
         * @param {number} t - The time to move the scrub to.
         * @returns {Promise<void>}
         */
        const moveScrubTo = t => {
            scrub.duration(
                moveToDuration({
                    dtStagger,
                    previousDuration: scrub.duration(),
                    from: scrub.vars.t,
                    to: t
                })
            );

            scrub.vars.t = t;

            /** @type {Promise<void>} */
            const p$ = new Promise(resolve => scrub.eventCallback('onComplete', () => {
                resolve();
            }));

            scrub.invalidate().restart();

            return p$;
        };

        /**
         * Moves the scrub to a specific index.
         * @param {number} index - The index to move the scrub to.
         * @param {Object} [options]
         * @param {boolean} [options.wrap] 
         * @returns {Promise<void>}
         */
        const goTo = (index, {
            wrap = false
        } = {}) => {
            if (wrap)
                return moveScrubTo(index * dtStagger);

            const currentIndex = Math.round(scrub.vars.t / dtStagger);
            return moveScrubTo(scrub.vars.t + (index - currentIndex) * dtStagger);
        };

        const next = () => moveScrubTo(scrub.vars.t + dtStagger);

        const prev = () => moveScrubTo(scrub.vars.t - dtStagger);

        const stop = async () => {
            await params.onStop?.();
            seamlessLoop.kill();
            scrub.kill();
        };

        return {
            goTo,
            next,
            prev,
            stop
        };
    };


    /** @typedef {ReturnType<typeof createGallerySlider>} GallerySlider */


    const GallerySlider = {
        create: createGallerySlider
    };

    return {
        GallerySlider
    };

});

// gallery/gallery.js
_.define(() => {
    // @ts-check


    /** @type {typeof import('../common/underscore.js')._} */
    const _ = /** @type {any} */ (window)._;

    _.EventNames.gallery = {
        enter: 'gallery:enter',
        leave: 'gallery:leave',
        resize: 'gallery:resize'
    };



    _.onLoad(() => {

        /** @type {import('./gallery-layout.js').GalleryCategories} */
        const galleryCategories = [{
                name: 'Invisible guests',
                imagesRecids: ['746428010', '746428004']
            },
            {
                name: 'Cathedral Moods',
                imagesRecids: ['571578108', '746400014']
            },
            {
                name: 'Miniatures',
                imagesRecids: ['571579724', '571592065']
            },
            {
                name: 'Paris Portraits',
                imagesRecids: ['571579825', '571579742']
            },
            {
                name: 'Model Sessions',
                imagesRecids: ['571579925', '571579800']
            },
            {
                name: 'Movie Stills',
                imagesRecids: ['571579932', '571579802']
            },
            {
                name: 'The Empty Studio',
                imagesRecids: ['571579939', '571579804']
            }
        ];

        const elements = _.createElements(galleryCategories);

        const menu = _.galleryMenu.initGalleryMenu(elements);
        const galleryAnimation = _.createGalleryAnimation({
            elements,
            galleryMenu: menu
        });

        let isActive = false;

        const {
            goTo
        } = _.galleryMenu.createGalleryMenuListener({
            elements,
            onActivating: (from, to, isInit) => {
                isActive = true;
                return galleryAnimation.animateActivationGallery({
                    state: 'activating',
                    from,
                    to,
                    isInit
                });
            },
            onClickMenuItem: galleryAnimation.animateSlider,
            onDesactivating: (from, to) => {
                isActive = false;
                return galleryAnimation.animateActivationGallery({
                    state: 'desactivating',
                    from,
                    to,
                    isInit: false
                });
            },
            hinterGoTo: menu.hinterGoTo
        });

        window.addEventListener('resize', () => {
            _.dispatchEvent(_.EventNames.gallery.resize, {
                isActive
            });
        }, {
            passive: true
        });

        _.onEvent(_.EventNames.hero.firstScrubDone, () => {
            _.dispatchEvent(_.EventNames.gallery.resize, {
                isActive
            });
            goTo(3, 'desactivated');
            _.dispatchEvent(_.EventNames.ready.gallery);
        });


        // _.dispatchEvent(_.EventNames.gallery.resize, { isActive });

        setTimeout(() => {
            try {
                // @ts-ignore
                if (window.lazyload_img)
                    // @ts-ignore
                    window.lazyload_img.skip_invisible = false;
                // @ts-ignore
                window.lazyload_img?.update();
            } catch (e) {
                console.error(e);
            }

        }, 501); // in tilda-lazyload-1.0.min.js, there is setTimeout 500 before window.lazyload_img = new window.LazyLoad({...});
    });

});
