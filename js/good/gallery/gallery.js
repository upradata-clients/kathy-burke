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
    const galleryCategories = [
        { name: 'Invisible guests', imagesRecids: [ '746428010', '746428004' ] },
        { name: 'Cathedral Moods', imagesRecids: [ '571578108', '746400014' ] },
        { name: 'Miniatures', imagesRecids: [ '571579724', '571592065' ] },
        { name: 'Paris Portraits', imagesRecids: [ '571579825', '571579742' ] },
        { name: 'Model Sessions', imagesRecids: [ '571579925', '571579800' ] },
        { name: 'Movie Stills', imagesRecids: [ '571579932', '571579802' ] },
        { name: 'The Empty Studio', imagesRecids: [ '571579939', '571579804' ] }
    ];

    const elements = _.createElements(galleryCategories);

    const menu = _.galleryMenu.initGalleryMenu(elements);
    const galleryAnimation = _.createGalleryAnimation({ elements, galleryMenu: menu });

    let isActive = false;

    const { goTo } = _.galleryMenu.createGalleryMenuListener({
        elements,
        onActivating: (from, to, isInit) => {
            isActive = true;
            return galleryAnimation.animateActivationGallery({ state: 'activating', from, to, isInit });
        },
        onClickMenuItem: galleryAnimation.animateSlider,
        onDesactivating: (from, to) => {
            isActive = false;
            return galleryAnimation.animateActivationGallery({ state: 'desactivating', from, to, isInit: false });
        },
        hinterGoTo: menu.hinterGoTo
    });

    window.addEventListener('resize', () => {
        _.dispatchEvent(_.EventNames.gallery.resize, { isActive });
    }, { passive: true });

    _.onEvent(_.EventNames.hero.firstScrubDone, () => {
        _.dispatchEvent(_.EventNames.gallery.resize, { isActive });
        goTo(3, 'desactivated');
        _.dispatchEvent(_.EventNames.ready.gallery);
    }, { isCold: true });

    
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
