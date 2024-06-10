// @ts-check


import { gsap } from '../../../node_modules/gsap/index.js';
Object.assign(window, { gsap });

const getModules = async (...modules) => {
    const exports = (await Promise.allSettled(modules)).map(res => res.status === 'fulfilled' ? res.value : undefined);

    return exports.reduce((mods, mod) => ({ ...mods, ...mod }), {});
};


Object.assign(window, await getModules(
    import('../../../node_modules/gsap/ScrollTrigger.js'),
    import('../../../node_modules/gsap/CustomEase.js'),
    import('../../../node_modules/gsap/Flip.js'),
    import('../../../node_modules/gsap/ScrollToPlugin.js')
));


gsap.registerPlugin(Flip);
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);

await import('./extra-header.js');


const { _ } = await import('../underscore.js');

Object.assign(_, await getModules(
    import('../mouse-follow.js'),
    import('../images-settings.js'),
    import('./gallery-menu.js'),
    import('./gallery-animation.js'),
    import('./gallery-layout.local.js'),
    import('./gallery-slider.js')
));



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

    // .onEvent(_.EventNames.hero.firstScrubDone, () => {
    _.dispatchEvent(_.EventNames.gallery.resize, { isActive });
    // galleryAnimation.animateSlider({ to: 3, from: -1, isInit: true, state: 'desactivated' });
    goTo(3, 'desactivated');
    // });

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
