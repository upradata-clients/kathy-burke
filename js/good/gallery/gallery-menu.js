// @ts-check


/** @type {typeof import('../underscore.js')._} */
const _ = /** @type {any} */ (window)._;

/**
 * @typedef {import('../images-settings.js').ImageSettings} ImageSettings
 * @typedef {import('../images-settings.js').ImageSettingsProp} ImageSettingsProp
 * @typedef {import('../images-settings.js').ImageSettingsMode} ImageSettingsMode
 */



/**
 * @param {import('./gallery-layout.js').Elements} elements
 */
const getGalleryMenu = elements => {

    const menuContainer = _.queryThrow('.uc-gallery-menu .t959__container');
    const menuItems = _.queryAllThrow('.t959__card', menuContainer);
    const menuItemsTitles = menuItems.map(m => _.queryThrow('.t-card__title', m));

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


    return {
        menuContainer,
        menuItems,
        menuItemsTitles,
        menuItemsImages,
        menuItemsImagesSettings,
        setMenuItemsImagesStyle
    };
};

/**
 * @typedef {ReturnType<typeof getGalleryMenu>} GalleryMenu
 */


/**  @typedef {import('./gallery-animation.js').AnimateSliderParams} AnimateSliderParams */

/**
 * @param {Object} params
 * @param {import('./gallery-layout.js').Elements} params.elements
 * @param {(index: number) => void | Promise<void>} [params.onEnter]
 * @param {(params: AnimateSliderParams) => void | Promise<void>} [params.onClickMenuItem]
 * @param {(index: number) => void | Promise<void>} [params.onLeave]
 */
const createGalleryMenuListener = ({ elements, onEnter, onClickMenuItem, onLeave }) => {

    /** @type {{menuItem: HTMLElement | undefined; i: number; isInit: boolean; movingI: number | undefined; sliderState: AnimateSliderParams['state']; }} */
    let state = { menuItem: undefined, isInit: false, movingI: undefined, i: -1, sliderState: 'desactivated' };

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
        const isActivating = state.sliderState === 'desactivated' || state.sliderState === 'desactivating'; // !state?.isActive;
        const isDesactivating = isSame && (state.sliderState === 'activated' || state.sliderState === 'activating'); // state?.isActive;

        // const isActive = isEntering ? true : isLeaving ? false : true;
        const nextGalleryState = sliderState ? sliderState : isActivating ? 'activating' : isDesactivating ? 'desactivating' : 'activated';
        state = { ...state, menuItem, movingI: i, sliderState: nextGalleryState };

        setActiveMenuItem(state.menuItem, 'remove');
        setActiveMenuItem(menuItem, 'add');
        _.menuGoTo(i);

        if (sliderState ? sliderState === 'activating' : isActivating) {
            _.dispatchEvent(_.EventNames.gallery.enter, { when: 'before' });
            await waitIfPromise(onEnter?.(i));
            _.dispatchEvent(_.EventNames.gallery.enter, { when: 'after' });
        }

        await waitIfPromise(onClickMenuItem?.({
            // enterI: isLeaving ? -1 : i, leaveI: state?.i ?? -1, isLeaving, isEntering 
            from: state.i,
            to: isDesactivating ? -1 : i,
            state: nextGalleryState,
            isInit: state.isInit
        }));

        state = { ...state, isInit: false };

        if (sliderState ? sliderState === 'desactivating' : isDesactivating) {
            await waitIfPromise(onLeave?.(i));
            _.dispatchEvent(_.EventNames.gallery.leave);
        }

        if (state.movingI === i)
            state = { ...state, i, movingI: undefined };

        state.sliderState = state.sliderState === 'desactivating' ? 'desactivated' : state.sliderState === 'activating' ? 'activated' : state.sliderState;
    };


    elements.menuItems.forEach((__, i) => {
        elements.menuItems[ i ].addEventListener('pointerup', () => goTo(i), { passive: true });
        elements.cards[ i ].addEventListener('pointerup', () => goTo(i), { passive: true });
        elements.cards[ i ].addEventListener('pointerenter', () => _.menuGoTo(i), { passive: true });
    });


    return { goTo };
};


const galleryMenu = { getGalleryMenu, createGalleryMenuListener };

export { galleryMenu };
