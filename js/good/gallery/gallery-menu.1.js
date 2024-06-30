// @ts-check


/** @type {typeof import('../underscore.js')._} */
const _ = /** @type {any} */ (window)._;

/**
 * @typedef {import('../images-settings.js').ImageSettings} ImageSettings
 * @typedef {import('../images-settings.js').ImageSettingsProp} ImageSettingsProp
 * @typedef {import('../images-settings.js').ImageSettingsMode} ImageSettingsMode
 */



/**
 * @param {import('./gallery-layout.local.js').Elements} elements
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
 * @typedef {ReturnType<typeof getGalleryMenu>} GalleryMenu3
 */




/**
 * @param {Object} params
 * @param {import('./gallery-layout.local.js').Elements} params.elements
 * @param {() => void | Promise<void>} [params.onStart]
 * @param {(params: { enterI: number | undefined; leaveI: number | undefined }) => void | Promise<void>} [params.onClickMenuItem]
 * @param {() => void | Promise<void>} [params.onLeave]
 */
const createGalleryMenuListener = ({ elements, onStart, onClickMenuItem, onLeave }) => {

    /** @type {{menuItem: HTMLElement; i: number} | undefined} */
    let state = undefined;


    /**
     * @param {HTMLElement | undefined} menuItem - The menu item to modify.
     * @param {string} action - The action to perform ('add' or 'remove').
     */
    const setActiveMenuItem = (menuItem, action) => _.setClassName(menuItem, 'active')(action);

    /** @param {void | Promise<void>} value */
    const waitIfPromise = async value => {
        if (value instanceof Promise)
            await value;
    };

    /** @param {number} i */
    const goTo = async i => {
        const menuItem = elements.menuItems[ i ];

        const isEmpty = state === undefined;
        const isSame = state?.i === i;

        if (isSame) {
            // state = undefined;
            // await waitIfPromise(onLeave?.());
            // _.dispatchEvent(_.EventNames.gallery.leave);
            return;
        }

        setActiveMenuItem(state?.menuItem, 'remove');
        setActiveMenuItem(menuItem, 'add');

        if (isEmpty) {
            _.dispatchEvent(_.EventNames.gallery.enter, { when: 'before' });
            await waitIfPromise(onStart?.());
            _.dispatchEvent(_.EventNames.gallery.enter, { when: 'after' });
        }

        await waitIfPromise(onClickMenuItem?.({ enterI: isSame ? undefined : i, leaveI: state?.i }));

        state = { menuItem, i };
    };


    elements.menuItems.forEach((_, i) => {
        elements.menuItems[ i ].addEventListener('pointerup', () => goTo(i), { passive: true });
        elements.cards[ i ].addEventListener('pointerup', () => goTo(i), { passive: true });
    });


    return { goTo };
};


const galleryMenu = { getGalleryMenu, createGalleryMenuListener };

export { galleryMenu };
