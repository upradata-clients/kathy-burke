// @ts-check


/** @type {typeof import('../underscore.js')._} */
const _ = /** @type {any} */ (window)._;


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

_.galleryMenu.createGalleryMenuListener({
    elements,
    onClickFirstMenuItem: () => new Promise(resolve => galleryAnimation.animateCardsApparition('add').then(() => resolve())),
    onClickMenuItem: ({ enterI, leaveI }) => galleryAnimation.animateSlider({ enterI, leaveI }),
    onLeave: () => {
        galleryAnimation.animateCardsApparition('remove');
    }
});
