// @ts-check


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

                const { prop, mode } = typeof style === 'string' ? { prop: style, mode: 'value' } : style;

                const value = imagesSettings[ prop ]?.[ mode ];

                return value ? { ...cssStyles, [ prop ]: imagesSettings[ prop ][ mode ] } : cssStyles;
            }, {});

            if (cssStyles)
                gsap.set(menuItemsImages[ i ], cssStyles);
        });
    };

    const params = { menuItems: elements.menuItems, menuContainer: elements.menuContainer };

    const hinter = createMenuHinter(params);

    addMenuAppareanceAnimation(params);
    addMenuOnHover({ ...params, ...hinter });

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
const createMenuHinter = ({ menuContainer, menuItems }) => {

    _.queryThrow('.t959__card-overlay', menuContainer).setAttribute('style', '');

    menuItems.forEach(item => {
        menuContainer.append(item);
        item.classList.remove('t959__card_25');
    });

    menuItems[ 0 ].insertAdjacentHTML('beforeend', `
        <div class="card--hint">
            <span class="hinter"></span>
            <span class="hinter"></span>
            <span class="hinter"></span>
        </div>
    `.trim());


    _.queryAllThrow('.t959__row', menuContainer).forEach(el => el.remove());

    const hinter = _.queryThrow('.card--hint', menuItems[ 0 ]);
    const hinterItems = _.queryAllThrow('.card--hint .hinter', menuItems[ 0 ]);


    /** @param {number} i */
    const hinterGoTo = i => {
        const itemHovered = menuItems[ i ];

        const state = Flip.getState(hinterItems, { props: 'opacity' });

        itemHovered.append(hinter);
        gsap.set(hinterItems, { opacity: 1 });

        Flip.from(state, { duration: 0.5, ease: 'expo.inOut', stagger: 0.05, overwrite: true });
    };


    return {
        hinter,
        hinterItems,
        hinterGoTo
    };
};


/** @typedef {ReturnType<typeof createMenuHinter>} Hinter */




/** @param {Pick<import('./gallery-layout.js').Elements,'menuItems' | 'menuContainer'>} params */
const addMenuAppareanceAnimation = ({ menuItems, menuContainer }) => {

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
const addMenuOnHover = ({ menuItems, menuContainer, hinterGoTo, hinterItems }) => {

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
        enter: () => { isActive = true; },
        leave: () => {
            if (isActive)
                return;

            isActive = false;
            gsap.to(hinterItems, { opacity: 0, duration: 0.2, ease: 'power4.out', stagger: 0.04, overwrite: true });
        },
    });


    menuItems.forEach((item, i) => onHover(item, { enter: () => hinterGoTo(i) }));

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
const createGalleryMenuListener = ({ elements, onActivating, onClickMenuItem, onDesactivating, hinterGoTo }) => {

    /** @type {{menuItem: HTMLElement | undefined; i: number; isInit: boolean; movingI: number | undefined; sliderState: AnimateSliderParams['state']; }} */
    let state = { menuItem: undefined, isInit: true, movingI: undefined, i: -1, sliderState: 'desactivated' };

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
        const menuItem = elements.menuItems[ i ];

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

        state = { ...state, menuItem, movingI: i, sliderState: newGalleryState };

        hinterGoTo(i);


        if (sliderState ? sliderState === 'activating' : isActivating) {
            _.dispatchEvent(_.EventNames.gallery.enter, { when: 'before' });
            await waitIfPromise(onActivating?.(sliderParams.from, sliderParams.to, state.isInit));
            _.dispatchEvent(_.EventNames.gallery.enter, { when: 'after' });
        }

        await waitIfPromise(onClickMenuItem?.(sliderParams));

        state = { ...state, isInit: false };

        if (sliderState ? sliderState === 'desactivating' : isDesactivating) {
            await waitIfPromise(onDesactivating?.(sliderParams.from, sliderParams.to));
            _.dispatchEvent(_.EventNames.gallery.leave);
        }

        if (state.movingI === i)
            state = { ...state, i, movingI: undefined };

        state.sliderState = state.sliderState === 'desactivating' ? 'desactivated' : state.sliderState === 'activating' ? 'activated' : state.sliderState;
    };


    elements.menuItems.forEach((menuItem, i) => {
        const card = elements.cards[ i ];

        const isStateI = () => typeof state.movingI !== 'undefined' ? state.movingI === i : state.i === i;

        menuItem.addEventListener('pointerup', () => goTo(i), { passive: true });

        card.addEventListener('pointerup', () => {
            if (state.sliderState === 'desactivated' || state.sliderState === 'desactivating' || !isStateI())
                goTo(i);
        }, { passive: true });

        menuItem.addEventListener('pointerenter', () => {
            if (state.sliderState === 'desactivated' && !isStateI())
                goTo(i, 'desactivated');
        }, { passive: true });


        const cardOpacityAnimation = gsap.timeline({ paused: true }).to(card, {
            opacity: 1,
            duration: 0.3,
            ease: 'power4.out'
        });

        card.addEventListener('pointerenter', () => {
            if (typeof state.movingI !== 'undefined')
                hinterGoTo(i);

            if (state.sliderState === 'desactivated')
                cardOpacityAnimation.play();
        }, { passive: true });

        card.addEventListener('pointerleave', () => {
            if (state.sliderState === 'desactivated')
                cardOpacityAnimation.reverse();
        }, { passive: true });
    });


    return { goTo };
};


const galleryMenu = { initGalleryMenu, createGalleryMenuListener };

export { galleryMenu };
