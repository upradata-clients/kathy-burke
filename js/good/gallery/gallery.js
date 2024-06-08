// @ts-check


/** @type {typeof import('../underscore.js')._} */
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

    const galleryAnimation = _.createGalleryAnimation({ elements });

    let isActive = false;

    _.galleryMenu.createGalleryMenuListener({
        elements,
        onEnter: index => {
            isActive = true;
            return galleryAnimation.animateActivationGallery('activate', index);
        },
        onClickMenuItem: galleryAnimation.animateSlider,
        onLeave: index => {
            isActive = false;
            return galleryAnimation.animateActivationGallery('desactivate', index);
        }
    });

    window.addEventListener('resize', () => {
        _.dispatchEvent(_.EventNames.gallery.resize, { isActive });
    }, { passive: true });

    _.onEvent(_.EventNames.hero.firstScrubDone, () => {
        _.dispatchEvent(_.EventNames.gallery.resize, { isActive });
        galleryAnimation.animateSlider({ enterI: 3, leaveI: -1, isEntering: false, isLeaving: false });
    });

    // _.dispatchEvent(_.EventNames.gallery.resize, { isActive });



    setTimeout(() => {
        try {
            // @ts-ignore
            window.lazyload_img.skip_invisible = false;
            // @ts-ignore
            window.lazyload_img.update();
        } catch (e) {
            console.error(e);
        }

    }, 501); // in tilda-lazyload-1.0.min.js, there is setTimeout 500 before window.lazyload_img = new window.LazyLoad({...});
});
