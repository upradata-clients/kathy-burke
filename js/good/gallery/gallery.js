// @ts-check

/** @type {typeof import('../underscore.js')._} */
const _ = /** @type {any} */ (window)._;

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

    /**
     * @param {gsap.core.Timeline} timeline
     * @returns {Promise<void>}
     */
    const promisifyTimeline = timeline => new Promise(resolve => timeline.then(() => resolve()));

    let isActive = false;

    _.galleryMenu.createGalleryMenuListener({
        elements,
        onStart: async () => {
            isActive = true;

            await Promise.allSettled([
                promisifyTimeline(galleryAnimation.animateCardsApparition('add')),
                Promise.resolve(galleryAnimation.activateCardTitles('add'))
            ]);
        },
        onClickMenuItem: ({ enterI, leaveI }) => galleryAnimation.animateSlider({ enterI, leaveI, isActive}),
        onLeave: async () => {
            isActive = false;

            await Promise.allSettled([
                promisifyTimeline(galleryAnimation.animateCardsApparition('remove')),
                Promise.resolve(galleryAnimation.activateCardTitles('remove'))
            ]);
        }
    });

    window.addEventListener('resize', () => {
        _.dispatchEvent(_.EventNames.gallery.resize, { isActive });
    }, { passive: true });

    _.dispatchEvent(_.EventNames.gallery.resize, { isActive });

    galleryAnimation.animateSlider({ enterI: 3, leaveI: undefined, isActive });

    setTimeout(() => {
        try {
            // @ts-ignore
            window.lazyload_img.skip_invisible = false;
            // @ts-ignore
            window.lazyload_img.update();
        } catch (e) {
            console.error(e);
        }

        // galleryAnimation.animateCardsApparition('add').then(() => {
        //   return galleryAnimation.animateSlider({ enterI: 3, leaveI: undefined, onlySlider: true });
        // });

    }, 501); // in tilda-lazyload-1.0.min.js, there is setTimeout 500 before window.lazyload_img = new window.LazyLoad({...});
});
