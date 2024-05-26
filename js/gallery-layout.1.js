// uc-easel-block
/**
 * @typedef {import("gsap")} gsap
 */


/** @type {typeof import('./underscore.js')._} */
const _ = window._;

/**
 * An array that holds the categories for the gallery.
 * @typedef {{ name: string; imagesRecids: string[];}[]} GalleryCategories
 */



/** @typedef {{ images: HTMLElement[]; wrapper: HTMLElement; block: HTMLElement; } CategoryElements} */


/**
 * @param {HTMLElement} element
 * @param {HTMLElement} parent 
 */
const centerPositionedElement = (element, parent) => {
    // el is absolutely positioned relative to the parent, we need to center it
    const { width: parentWidth } = _.getRect(parent);
    const { width: itemWidth } = _.getRect(element);

    const left = (parentWidth - itemWidth) / 2;
    gsap.set(el, { left });
};


/**
 * @param {GalleryCategories} galleryCategories
 */
const createGalleriesLayout = galleryCategories => {

    // we move all images to first images block
    const imagesBlocksPerCategory = galleryCategories.map(({ imagesRecids }) => [ ...imagesRecids.map(_.getElementFromRecid) ]);


    /**
     * 
     * @param {HTMLElement[]} blocks 
     * @param {number} categoryI 
     * @returns {CategoryElements}
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



    /**
     * @param {CategoryElements[]} elementsPerCategory 
     * @returns {{ cardsBlock: HTMLElement; cardsWrapper: HTMLElement; }}
     */
    const createCardsContainer = elementsPerCategory => {

        const firstCategory = elementsPerCategory[ 0 ];

        firstCategory.block.insertAdjacentHTML(
            'beforebegin',
            '<div id="cards" class="cards"><div class="cards__wrapper"></div></div>'
        );

        const cardsBlock = document.querySelector('#cards');

        const cardsWrapper = cardsBlock.querySelector('.cards__wrapper');

        // we move all images blocks (each block is a category) to the cards wrapper
        cardsWrapper.replaceChildren(...elementsPerCategory.map(({ block }) => block));


        // we create a skeleton block
        const skeletonBlock = firstCategory.block.cloneNode(true);

        skeletonBlock.id = 'gallery-skeleton';
        skeletonBlock.className = 'gallery-skeleton';

        // we remove all item contents from the skeleton
        [ ...skeletonBlock.querySelectorAll('.t156__item') ].forEach(el => el.replaceChildren());

        // we insert the skeleton block before the first category block
        firstCategory.block.before(skeletonBlock);

        // as the cards are absolutely positioned relative to the cards wrapper, we need to center them
        elementsPerCategory.map(({ block }) => centerPositionedElement(block), cardsWrapper);


        return { cardsBlock, cardsWrapper };
    };

    const elementsPerCategory = imagesBlocksPerCategory.map(mergeItemsInFirstBlockOfCategory);

    const { cardsBlock, cardsWrapper } = createCardsContainer(elementsPerCategory);


    return {
        cardsBlock,
        cardsWrapper,
        elementsPerCategory,
        imagesPerCategory: elementsPerCategory.map(c => c.images),
        allImages: elementsPerCategory.flatMap(c => c.images),
        cards: elementsPerCategory.map(c => c.block)
    };
};

/** @param {GalleryCategories} galleryCategories */
const createElements = galleryCategories => {

    const menuContainer = document.querySelector('.uc-gallery-menu .t959__container');
    const menuItems = [ ...menuContainer.querySelectorAll('.t959__card') ];
    const menuItemsTitles = menuItems.map(m => m.querySelector('.t-card__title'));

    const galleryTitle = document.querySelector('.uc-gallery-title');
    const galleryTitleHeader = galleryTitle.querySelector('.t030__title');

    return {
        menuContainer,
        menuItems,
        menuItemsTitles,
        galleryTitle,
        galleryTitleHeader,
        ...createGalleriesLayout(galleryCategories)
    };
};

/**
 * @typedef {ReturnType<typeof createElements>} Elements
 */


/**
     * @param {Object} params
     * @param {CategoryElements[]} params.elementsPerCategory
     * @param {Record<Axis, number>} params.maxRotation
     * @param {Record<Axis, number>} params.maxDistance
     * @returns {gsap.core.Timeline[]}
     */
const createSideCardsMouseAnimation = ({ elementsPerCategory, maxRotation, maxDistance }) => {

    const power2Ease = gsap.parseEase('power2.out');
    // power2EaseSymmetric is the same as power2Ease but symmetric on 1/2 ("y" goes from 1 to 0 when "x=progress" goes from 0 to 1)
    const power2EaseSymmetric = progress => power2Ease(-progress + 1);

    /** @type {(distanceProgress: {x: number; y: number}) => {x: number; y: number}} */
    const distanceEasing = distanceProgress => {

        const clampP = gsap.utils.clamp(-1, 1);

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

    /** @type {(axis: Axis) => (distanceProgress: number) => number} */
    const distanceProgressToRotation = axis => distanceProgress => {
        return gsap.utils.mapRange(-1, 1, -maxRotation[ axis ], maxRotation[ axis ], distanceProgress);
    };

    const cardsMouseAnimation = elementsPerCategory.map(({ wrapper }) => {

        // we need to store the initial rotation values to add the new ones
        let rotationStart = undefined;

        const mouseFollower = _.createMouseFollower({
            items: [ wrapper ],
            distanceEasing,
            maxDistance,
            onStart: () => {
                rotationStart = {
                    x: gsap.getProperty(wrapper, 'rotationX'),
                    y: gsap.getProperty(wrapper, 'rotationY')
                };
            },
            onMouseMove: data => {
                const d = mouseFollower.getDistanceEase(data);

                const { cardState } = data.item.closest('.card').dataset;
                const m = cardState === 'left' ? 1 : -1;

                gsap.to(data.item, {
                    duration: 0.5,
                    transformPerspective: 1000,
                    rotationX: m * rotationStart.x + distanceProgressToRotation('x')(d.y),
                    rotationY: m * rotationStart.y - distanceProgressToRotation('y')(d.x),
                    ease: 'power2.out'
                });
            }
        });

        return mouseFollower;
    });

    return cardsMouseAnimation;
};


/**
 * @param {HTMLElement[]} cards
 * @returns {gsap.core.Timeline}
 */
const createGallerySlider = cards => {

    // translation of the card at the beginning of the animation
    const xPercent = 400;

    const slider = _.createGallerySlider({
        cards,
        xPercent,
        animateCard: element => {

            const wrapper = element.querySelector('.t156__wrapper');

            // duration of the card animation from x = xPercent% to -xPercent%
            const animationDuration = 1;

            const tl = gsap.timeline();

            tl
                .fromTo(element,
                    { scale: 0, opacity: 0 },
                    {
                        scale: 1, opacity: 1, zIndex: 100,
                        duration: animationDuration / 2, yoyo: true, repeat: 1, ease: 'power1.in', immediateRender: false
                    }
                )
                .fromTo(element,
                    { xPercent: xPercent },
                    {
                        xPercent: -xPercent,
                        duration: animationDuration, ease: 'none', immediateRender: false
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

    return slider;
};


/**
 * @param {HTMLElement} gallerySkeleton
 */
const createSideCardsScrollFollow = gallerySkeleton => {

    const gallerySkeletonContainer = gallerySkeleton;
    const item = gallerySkeletonContainer.querySelector('.t156__item');

    const imageHeight = getRect(item).height;

    const cardSidesTL = gsap.timeline({
        scrollTrigger: {
            markers: true,
            trigger: gallerySkeletonContainer,
            scrub: 1,
            start: `center+=${imageHeight / 2} bottom`,
            end: `center+=${imageHeight / 2 + imageHeight} bottom`
        }
    });

    /**
     * @param {number} activeI
     * @returns {gsap.core.Timeline}
     */
    const create = activeI => {

        cardSidesTL.to(elements.cards.filter((_, i) => i !== activeI).map(c => c.querySelector('.t-container')), {
            y: imageHeight / 2,
            ease: 'power4.out',
        });

        return cardSidesTL;
    };

    const clear = () => cardSidesTL.clear();

    return { create, clear };
};

const createGalleryApparationAnimation = () => {
    return gsap
        .timeline({ paused: true })
        .to(elements.cardsBlock, { opacity: 1, ease: 'expo.out', duration: 1.2 });
};

/**
 * @param {object} params
 * @param {Elements} params.elements
 */
const createGalleryAnimation = ({ elements }) => {

    const { menuContainer, menuItems, cards, galleryTitle } = elements;

    const galleryMenu = _.getGalleryMenu();
    galleryMenu.setMenuItemsImagesStyle([ { prop: 'background-position', mode: 'lg' } ]);

    const slider = createGallerySlider();

    const sideCardsMouseAnimation = createSideCardsMouseAnimation({
        elementsPerCategory: elements.elementsPerCategory,
        maxRotation: { x: 3, y: 6 },
        maxDistance: { x: 0.5 * wrapperRect.width, y: 0.5 * wrapperRect.height }
    });

    const sideCardsScrollFollow = createSideCardsScrollFollow(elements.cardsBlock.querySelector('.gallery-skeleton .t-container'));


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


    /**
     * @param {object} params
     * @param {number} params.enterI
     * @param {number} params.leaveI
     */
    const animateSlider = ({ enterI, leaveI }) => {

        const isFirst = leaveI === undefined && enterI !== undefined;

        if (isFirst) {
            animateMenuToSmallState();
            gsap.to(galleryTitle, { opacity: 1, duration: 0.5, ease: 'expo.out' });
        }


        slider.goTo(enterI);


        if (leaveI !== undefined) {
            setStateCards(leaveI, 'remove');

            sideCardsMouseAnimation.forEach(a => a.stop());

            flipTitles(enterI, 'remove');
        }


        if (enterI !== undefined) {

            setStateCards(enterI, 'add');

            sideCardsMouseAnimation[ wrapI(enterI - 1) ].start();
            sideCardsMouseAnimation[ wrapI(enterI + 1) ].start();

            flipTitles(enterI, 'add');

            sideCardsScrollFollow.clear();
        }


        if (enterI !== undefined)
            sideCardsScrollFollow.create(enterI);
    };



    const setActiveTitle = setClassName(elements.galleryTitle, 'active');
    const setActiveCardsBlock = setClassName(elements.cardsBlock, 'active');

    const cardsAppearAnimation = createGalleryApparationAnimation();

    /** @param {'add'|'remove'} action */
    const animateCardsApparition = action => {

        setActiveCardsBlock(action);

        action === 'add' ? cardsAppearAnimation.play() : cardsAppearAnimation.reverse();

        setActiveTitle(action);
        galleryMenu.setMenuItemsImagesStyle([ { prop: 'background-position', mode: action === 'add' ? 'xs' : 'lg' } ]);
    };


    return { animateSlider, animateCardsApparition };
};


/** @param {GalleryCategories} galleryCategories */
const addGalleryMenuListener = galleryCategories => {

    let state = undefined;

    const elements = createElements(galleryCategories);
    const galleryAnimation = createGalleryAnimation({ elements });

    /**
     * @param {HTMLElement} menuItem - The menu item to modify.
     * @param {string} action - The action to perform ('add' or 'remove').
     */
    const setActiveMenuItem = (menuItem, action) => _.setClassName(menuItem, 'active')(action);


    elements.menuItems.forEach((menuItem, i) => {

        menuItem.addEventListener('pointerup', () => {
            const isEmpty = state === undefined;
            const isSame = state?.i === i;

            setActiveMenuItem(state?.menuItem, 'remove');
            setActiveMenuItem(menuItem, 'add');

            if (isEmpty) {
                galleryAnimation.animateCardsApparition('add');
            }

            galleryAnimation.animateSlider({ enterI: isSame ? undefined : i, leaveI: state?.i });

            if (isSame) {
                state = undefined;
                galleryAnimation.animateCardsApparition('remove');
            } else {
                state = { menuItem, i };
            }

        }, { passive: true });
    });

};


export { addGalleryMenuListener }; 
