import * as galleryLayout from './gallery-layout';
import * as galleryMenu from './gallery-menu';
import * as gallerySlider from './gallery-slider';
import * as galleryAnimation from './gallery-animation';


declare global {
    export type Gallery = typeof galleryLayout & typeof galleryMenu & typeof gallerySlider & typeof galleryAnimation;
    export interface UnderScore {
        gallery: Gallery;
    }
}
