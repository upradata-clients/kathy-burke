// @ts-check

import * as galleryLayout from './gallery-layout.js';
import * as galleryMenu from './gallery-menu.js';
import * as gallerySlider from './gallery-slider.js';
import * as galleryAnimation from './gallery-animation.js';

/** @param {UnderScore} _ */
const registerGallery = _ => {
    _.EventNames.gallery = /** @type {EventNames['gallery']} */({
        enter: 'gallery:enter',
        leave: 'gallery:leave',
        resize: 'gallery:resize'
    });


    _.define(() => ({
        gallery: {
            ...galleryLayout,
            ...galleryMenu,
            ...gallerySlider,
            ...galleryAnimation,
            getImagesSettings: () => []
        }
    }));

    return _;
};


export { registerGallery };
