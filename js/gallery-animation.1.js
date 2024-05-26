// uc-easel-block
/**
 * @typedef {import("gsap")} gsap
 */


// queryAll: (query, element = document) => [ ...element.querySelectorAll(query) ],
// queryAll: (query: string, element?: HTMLElement) => HTMLElement[];
/*const colorizer = gsap.utils.pipe(
       gsap.utils.normalize(0, imagesCategories.length - 1),
       gsap.utils.interpolate('rgba(255,0,0,0.4)', 'rgba(0,0,255,0.4)')
   );*/


/**
 * @typedef {{
 *      getElementFromRecid: (recid: string) => HTMLElement | null;
 *      getRect: (el: HTMLElement) => DOMRect; 
 * } & typeof gsap.utils } UnderscoreType
 */


(() => {
    /** @type {UnderscoreType} */
    const _ = window._;


    /**
     * @param {HTMLElement[]} elements 
     * @param {HTMLElement} parent 
     */
    const centerPositionedElements = (elements, parent) => {
        // el is absolutely positioned relative to the parent, we need to center it
        const { width: parentWidth } = _.getRect(parent);
        const { width: itemWidth } = _.getRect(elements);

        const left = (parentWidth - itemWidth) / 2;

        elements.map(el => gsap.set(el, { left }));
    };

    const setStyle = (el, style) => {
        const oldStyle = el.getAttribute('style');
        el.setAttribute('style', `${oldStyle}; ${style}`);
    };


    /**
     * An array that holds the categories for the gallery.
     * @typedef {{ name: string; imagesRecids: string[];}[]} GalleryCategories
     */

    /** @type {GalleryCategories} */
    const galleryCategories = [
        { name: 'Invisible guests', imagesRecids: [ '746428010', '746428004' ] },
        { name: 'Cathedral Moods', imagesRecids: [ '571578108', '746400014' ] },
        { name: 'Miniatures', imagesRecids: [ '571579724', '571592065' ] },
        { name: 'Paris Portraits', imagesRecids: [ '571579825', '571579742' ] },
        { name: 'Model Sessions', imagesRecids: [ '571579925', '571579800' ] },
        { name: 'Movie Stills', imagesRecids: [ '571579932', '571579802' ] },
        { name: 'The Empty Studio', imagesRecids: [ '571579939', '571579804' ] }
    ];

    /**
     * @param {GalleryCategories} galleryCategories
     * @returns {HTMLElement}
     */
    const createGalleriesLayout = galleryCategories => {

        // we move all images to first images block
        const imagesBlocksPerCategory = galleryCategories.map(({ imagesRecids }) => [ ...imagesRecids.map(_.getElementFromRecid) ]);


        /**
         * 
         * @param {HTMLElement[]} blocks 
         * @param {number} categoryI 
         * @returns {{images: HTMLElement[], wrapper: HTMLElement, block: HTMLElement}}
         */
        const mergeItemsInFirstBlockOfCategory = (blocks, categoryI) => {

            const block = blocks[ 0 ];
            const wrapper = block.querySelector('.t156__wrapper');

            const images = blocks.flatMap((block, i) => {
                const images = queryAll('.t156__item', block);

                if (i === 0) {
                    block.setAttribute('class', `gallery gallery-${categoryI} card`);
                    [ ...wrapper.children ].filter(el => el.innerHTML === '').forEach(el => el.remove());
                } else {
                    wrapper.append(...images);
                    block.remove();
                }

                return images;
            });


            return { images, wrapper, block };
        };


        const imagesPerCategory = imagesBlocksPerCategory.map(mergeItemsInFirstBlockOfCategory);


        const createCardsContainer = () => {

            const firstCategory = imagesPerCategory[ 0 ];

            firstCategory.block.insertAdjacentHTML(
                'beforebegin',
                '<div id="cards" class="cards"><div class="cards__wrapper"></div></div>'
            );

            const cardsBlock = document.querySelector('#cards');

            const cardsWrapper = cardsBlock.querySelector('.cards__wrapper');

            // we move all images blocks (each block is a category) to the cards wrapper
            cardsWrapper.replaceChildren(...imagesPerCategory.map(({ block }) => block));


            // we create a skeleton block
            const skeletonBlock = firstCategory.block.cloneNode(true);

            skeletonBlock.id = 'gallery-skeleton';
            skeletonBlock.className = 'gallery-skeleton';

            // we remove all item contents from the skeleton
            [ ...skeletonBlock.querySelectorAll('.t156__item') ].forEach(el => el.replaceChildren());

            // we insert the skeleton block before the first category block
            firstCategory.block.before(skeletonBlock);

            // as the cards are absolutely positioned relative to the cards wrapper, we need to center them
            const cardsWrapperWidth = _.getRect(cardsWrapper).width;
            const cardWidth = _.getRect(firstCategory.block).width;

            const deltaLeft = (cardsWrapperWidth - cardWidth) / 2;

            imagesPerCategory.map(({ block }) => {
                gsap.set(block, { left: deltaLeft });
            });

            return { block: cardsBlock, wrapper: cardsWrapper };
        };


        const { block: cardsBlock, wrapper: cardsWrapper } = createCardsContainer();

        const distanceToProgress = (distance, { i, rect }) => {
            const progress = Object.fromEntries(
                [ 'x', 'y' ].map(axis => {
                    const size = axis === 'x' ? 'width' : 'height';
                    const distanceMax = 1.1 * rect[ size ] / 2;

                    const progress = distance[ axis ] / distanceMax;
                    return [ axis, progress ];
                })
            );


            if (Math.abs(progress.x) > 1 || Math.abs(progress.y) > 1)
                return { x: 0, y: 0 };

            return progress;
        };


        const maxRotation = { x: 6, y: 6 };

        const distanceProgressToRotation = axis => distanceProgress => {
            return gsap.utils.mapRange(-1, 1, -maxRotation[ axis ], maxRotation[ axis ], distanceProgress);
        };

        const maxRotation2 = { x: 3, y: 6 };
        /* const power2Ease = gsap.parseEase('power2.out');
 
         const createMouseDistanceEasing = axis => distance => {
                 const x = gsap.utils.clamp(-1, 1, distance);
             const easeX = power2Ease(Math.abs(x));
 
             return x < 0 ? -easeX : easeX;
             };
         };*/
        const power2Ease = gsap.parseEase('power2.out');
        const power2EaseSymmetric = progress => power2Ease(-progress + 1);

        const distanceEasing = (distanceProgress, data) => {

            const { cardState } = data.item.closest('.card').dataset;
            const m = cardState === 'left' ? 1 : -1;

            const clampedProgress = gsap.utils.clamp(-1, 1);

            const easing = progress => {
                const p = clampedProgress(progress);
                const easeX = power2Ease(Math.abs(p));

                return p < 0 ? -easeX : easeX;
            };

            return {
                x: easing(distanceProgress.x),
                y: power2EaseSymmetric(Math.abs(clampedProgress(distanceProgress.x))) * easing(distanceProgress.y)
            };
        };



        const distanceProgressToRotation2 = axis => distanceProgress => {
            return gsap.utils.mapRange(-1, 1, -maxRotation2[ axis ], maxRotation2[ axis ], distanceProgress);
        };


        return {
            imagesCategories: imagesPerCategory,
            imagesByCategory: imagesPerCategory.map(c => c.images),
            imagesMouseAnimation: imagesPerCategory.map(c => {

                const mouseFollower = window.createMouseFollower({
                    items: c.images,
                    // maxDistance: {x: 290 / 4, y: 440 / 4 }, // {x: 200, y: 200 },
                    // maxRotation: {x: 6, y: 6 },
                    distanceToProgress,
                    /*mouseDistanceEase: {
                x: createMouseDistanceEasing('x'),
            y: createMouseDistanceEasing('y')
                    },*/
                    onMouseMove: data => {
                        const d = mouseFollower.getDistanceEase(data);

                        gsap.to(data.item, {
                            duration: 0.5,
                            rotationX: distanceProgressToRotation('x')(d.y),
                            rotationY: -distanceProgressToRotation('y')(d.x),
                            ease: 'power2.out'
                        });
                    }
                });

                return mouseFollower;
            }),
            cardsMouseAnimation: imagesPerCategory.map(c => {

                const wrapperRect = c.wrapper.getBoundingClientRect();
                let rotationStart = undefined;


                const mouseFollower = window.createMouseFollower({
                    items: [ c.wrapper ],
                    // mouseDistanceEase: 'power2.out',
                    distanceEasing,
                    maxDistance: { x: 0.5 * wrapperRect.width, y: 0.5 * wrapperRect.height },
                    onStart: () => {
                        rotationStart = {
                            x: gsap.getProperty(c.wrapper, 'rotationX'),
                            y: gsap.getProperty(c.wrapper, 'rotationY')
                        };
                    },
                    onMouseMove: data => {
                        const d = mouseFollower.getDistanceEase(data);

                        const { cardState } = data.item.closest('.card').dataset;
                        const m = cardState === 'left' ? 1 : -1;

                        gsap.to(data.item, {
                            duration: 0.5,
                            transformPerspective: 1000,
                            rotationX: m * rotationStart.x + distanceProgressToRotation2('x')(d.y),
                            rotationY: m * rotationStart.y - distanceProgressToRotation2('y')(d.x),
                            ease: 'power2.out'
                        });
                    }
                });

                return mouseFollower;
            }),
            images: imagesPerCategory.flatMap(c => c.images),
            cardsBlock,
            cardsWrapper,
            cards: imagesPerCategory.map(c => c.block)
        };
    };

    const createElements = () => {

        const menuContainer = document.querySelector('#rec747864295 .t959__container');
        const menuItems = [ ...menuContainer.querySelectorAll('.t959__card') ];
        const menuItemsTitles = menuItems.map(m => m.querySelector('.t-card__title'));

        const galleryTitle = document.querySelector('.uc-gallery-title');
        const galleryTitleHeader = document.querySelector('.t030__title');

        galleryTitleHeader.dataset.flipId = 'gallery-title';

        return {
            menuContainer,
            menuItems,
            menuItemsTitles,
            galleryTitle,
            galleryTitleHeader,
            ...createGalleriesLayout()
        };
    };

    const elements = createElements();

    const xPercent = 400;

    const slider = window.createGallerySlider({
        cards: elements.cards,
        xPercent,
        animateCard: element => {

            const wrapper = element.querySelector('.t156__wrapper');

            const cardAnimationTime = {
                duration: 1, // duration of the card animation from x = xPercent% to -xPercent%
            };

            const eases = {
                cardOpacity: 'power1.in',
                time: 'power3.out',
            };


            const tl = gsap.timeline();

            tl
                .fromTo(element,
                    { scale: 0, opacity: 0 },
                    {
                        scale: 1, opacity: 1, zIndex: 100,
                        duration: cardAnimationTime.duration / 2, yoyo: true, repeat: 1, ease: eases.cardOpacity, immediateRender: false
                    }
                )
                .fromTo(element,
                    { xPercent: xPercent },
                    {
                        xPercent: -xPercent,
                        duration: cardAnimationTime.duration, ease: 'none', immediateRender: false
                    },
                    0
                );


            const duration = tl.duration();

            tl.fromTo(wrapper, {
                x: -140, y: -160, z: -270, rotateY: -13, rotateX: -1, rotateZ: 1, transformPerspective: 800,
            }, {
                x: 0, y: 0, z: 0, rotateY: 0, rotateX: -0, rotateZ: 0,
                duration: 0.1 * duration, ease: 'none'
            }, 4 * 0.1);

            tl.fromTo(wrapper, {
                x: 0, y: 0, z: 0, rotateY: 0,
            }, {
                x: 140, y: -160, z: -270, rotateY: 13, rotateX: 1, rotateZ: 1, transformPerspective: 800,
                duration: 0.1 * duration, ease: 'none'
            }, 5 * 0.1);

            return tl;
        }
    });



    const menuItemsImages = elements.menuItems.map(item => item.querySelector('.t959__card-image'));
    const menuItemsImagesSettings = getImagesSettings(menuItemsImages);


    const setMenuItemsImagesStyle = styles => {

        menuItemsImagesSettings.forEach((imagesSettings, i) => {

            const styleStr = styles.map(style => {
                const s = typeof style === 'string' ? { prop: style, mode: 'value' } : style;
                const value = imagesSettings[ s.prop ]?.[ s.mode ];

                return value ? `${s.prop}: ${imagesSettings[ s.prop ][ s.mode ]}` : '';
            }).join(';');

            if (styleStr)
                setStyle(menuItemsImages[ i ], styleStr);
        });
    };


    setMenuItemsImagesStyle([ { prop: 'background-position', mode: 'lg' } ]);

    const addClickAnimation = () => {

        const wrapI = gsap.utils.wrap(0, elements.menuItems.length);



        const createCardSidesScrollFollowAnimation = activeI => {

            const gallerySkeletonContainer = elements.cardsBlock.querySelector('.gallery-skeleton .t-container');
            const item = gallerySkeletonContainer.querySelector('.t156__item');

            // const tl = gsap.timeline({paused: true });

            return [ wrapI(activeI - 1), wrapI(activeI + 1) ].map(i => gsap.timeline({
                scrollTrigger: {
                    markers: true,
                    trigger: gallerySkeletonContainer,
                    pin: elements.cards[ i ],
                    scrub: 0.2,
                    start: `center+=${getRect(item).height / 2} bottom`, // 'bottom-=20 bottom',
                    end: `center+=${getRect(item).height / 2 + getRect(gallerySkeletonContainer).height / 2} bottom`
                    // end: getRect(gallerySkeletonContainer).height / 2
                    // end: 'bottom+=100 bottom',
                }
            }));

            // return tl;
        };


        const createCardSidesScrollFollowAnimation2 = activeI => {

            const gallerySkeletonContainer = elements.cardsBlock.querySelector('.gallery-skeleton .t-container');
            const item = gallerySkeletonContainer.querySelector('.t156__item');

            const imageHeight = getRect(item).height;

            const cardSidesTL = gsap.timeline();

            cardSidesTL.to(elements.cards.filter((_, i) => i !== activeI).map(c => c.querySelector('.t-container')), {
                y: imageHeight / 2,
                //delay: 0.1,
                // duration: 3.5,
                ease: 'power4.out',
                scrollTrigger: {
                    markers: true,
                    trigger: gallerySkeletonContainer,
                    scrub: 1,
                    start: `center+=${imageHeight / 2} bottom`, // 'bottom-=20 bottom',
                    end: `center+=${imageHeight / 2 + imageHeight} bottom`
                }
            });

            return cardSidesTL;
        };


        const gallerySkeletonContainer = elements.cardsBlock.querySelector('.gallery-skeleton .t-container');
        const item = gallerySkeletonContainer.querySelector('.t156__item');


        const imageHeight = getRect(item).height;

        const cardSidesTL = gsap.timeline({
            scrollTrigger: {
                markers: true,
                trigger: gallerySkeletonContainer,
                scrub: 1,
                start: `center+=${imageHeight / 2} bottom`, // 'bottom-=20 bottom',
                end: `center+=${imageHeight / 2 + imageHeight} bottom`
            }
        });

        const createCardSidesScrollFollowAnimation3 = activeI => {

            cardSidesTL.to(elements.cards.filter((_, i) => i !== activeI).map(c => c.querySelector('.t-container')), {
                y: imageHeight / 2,
                //delay: 0.1,
                // duration: 3.5,
                ease: 'power4.out',
            });

            return cardSidesTL;
        };

        let stateAnimation = {};

        const animate = ({ enterI, leaveI, isEmpty }) => {

            const { galleryTitle, galleryTitleHeader, menuItemsTitles, menuContainer, imagesCategories, cards } = elements;

            if (isEmpty) {
                // we scroll to the menu and make it smaller
                gsap.timeline()
                    .to(window, { scrollTo: { y: menuContainer, offsetY: 25 }, duration: 1, ease: 'expo.out' })
                    .to(menuContainer, { height: 120, duration: 1, ease: 'expo.out' }, '<10%');

                gsap.to(galleryTitle, { opacity: 1, duration: 0.5, ease: 'expo.out' });
                // galleryTitleHeader.classList.remove('active');
            }


            slider.goTo(enterI);


            // const {wrapper, images, block} = elements.imagesCategories[ menuIndex ];
            const images = i => imagesCategories[ i ].images;

            const tl = gsap.timeline();

            const setStateCards = (i, action) => {
                cards[ wrapI(i) ].dataset.cardState = action === 'add' ? 'active' : '';
                cards[ wrapI(i - 1) ].dataset.cardState = action === 'add' ? 'left' : '';
                cards[ wrapI(i + 1) ].dataset.cardState = action === 'add' ? 'right' : '';
            };



            if (leaveI !== undefined) {
                setStateCards(leaveI, 'remove');

                // elements.imagesMouseAnimation[leaveI].stop();
                elements.cardsMouseAnimation.forEach(a => a.stop());
                // elements.cardScrollFollowAnimation.forEach(a => a.pause());

                /*tl.to(images(leaveI), {
                scale: 0.1,
            autoAlpha: 0,
            zIndex: -1,
            // x: 400,
            // y: 0,

            stagger: {
                each: 0.05,
            grid: 'auto',
            ease: 'expo.inOut',
            from: 'end'
                    },

            duration: 0.4,
            ease: 'expo.in'
                });*/


                const title = menuItemsTitles[ leaveI ];

                galleryTitleHeader.innerHTML = '';

                const titleState = Flip.getState([ title, galleryTitleHeader ]);

                title.classList.remove('active');
                galleryTitleHeader.classList.remove('active');

                Flip.from(titleState, {
                    duration: 0.4, ease: 'expo.in', toggleClass: 'flipping', absolute: false, /* overwrite: true*/
                });
            }


            if (enterI !== undefined) {

                setStateCards(enterI, 'add');
                // elements.imagesMouseAnimation[enterI].start();

                elements.cardsMouseAnimation[ wrapI(enterI - 1) ].start();
                elements.cardsMouseAnimation[ wrapI(enterI + 1) ].start();

                /*elements.cardScrollFollowAnimation[wrapI(enterI - 1)].invalidate().play();
                elements.cardScrollFollowAnimation[wrapI(enterI + 1)].invalidate().play();*/

                /*tl.fromTo(images(enterI), {
                scale: 0.1,
            autoAlpha: 0,
                    // x: -400,
                    // y: 50
                }, {
                scale: 1,
            autoAlpha: 1,
            // x: 0,
            // y: 0,

            stagger: {
                each: 0.05,
            grid: 'auto',
            ease: 'expo.inOut',
            from: 'end'
                    },

            duration: 0.8,
            ease: 'expo.out'
                }, 0);*/

                const title = menuItemsTitles[ enterI ];

                galleryTitleHeader.innerHTML = title.innerHTML;

                title.dataset.flipId = galleryTitleHeader.dataset.flipId;

                const titleState = Flip.getState([ title, galleryTitleHeader ]);

                title.classList.add('active');
                galleryTitleHeader.classList.add('active');

                Flip.from(titleState, {
                    duration: 0.4, ease: 'expo.out', toggleClass: 'flipping', absolute: false, /* overwrite: true*/
                });
            }


            if (leaveI !== undefined) {
                stateAnimation.cardSidesScrollFollowAnimation?.clear();
                stateAnimation = { ...stateAnimation, cardSidesScrollFollowAnimation: undefined };
            }

            if (enterI !== undefined)
                stateAnimation = { ...stateAnimation, cardSidesScrollFollowAnimation: createCardSidesScrollFollowAnimation3(enterI) };
        };




        let state = undefined;

        const setClassName = (el, className) => action => el?.classList[ action ](className);

        const setActiveMenuItem = (menuItem, action) => setClassName(menuItem, 'active')(action);
        const setActiveTitle = setClassName(elements.galleryTitle, 'active');
        const setActiveCardsBlock = setClassName(elements.cardsBlock, 'active');

        const cardsAppearAnimation = gsap
            .timeline({ paused: true })
            .to(elements.cardsBlock, { opacity: 1, ease: 'expo.out', duration: 1.2 });

        elements.menuItems.forEach((menuItem, i) => {

            menuItem.addEventListener('pointerup', () => {
                const isEmpty = state === undefined;
                const isSame = state?.i === i;

                setActiveMenuItem(state?.menuItem, 'remove');
                setActiveMenuItem(menuItem, 'add');

                if (isEmpty) {
                    setActiveCardsBlock('add');
                    cardsAppearAnimation.play();
                    setActiveTitle('add');
                    // elements.cardsWrapper.classList.add('tiny');
                    setMenuItemsImagesStyle([ { prop: 'background-position', mode: 'xs' } ]);
                    // elements.cardScrollFollowAnimation()/*.invalidate()*/.play();
                }

                animate({ enterI: isSame ? undefined : i, leaveI: state?.i, isEmpty });


                if (isSame) {
                    state = undefined;
                    setActiveCardsBlock('remove');
                    cardsAppearAnimation.reverse();
                    setActiveTitle('remove');
                    // elements.cardsWrapper.classList.remove('tiny');
                    setMenuItemsImagesStyle([ { prop: 'background-position', mode: 'lg' } ]);
                    // elements.cardScrollFollowAnimation.pause();
                } else {
                    state = { menuItem, i };
                }

            }, { passive: true });
        });

    };


    addClickAnimation();

})();
