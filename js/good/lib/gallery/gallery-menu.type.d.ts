import { galleryMenu } from './gallery-menu';


declare global {
    export type GalleryMenu = ReturnType<typeof galleryMenu.initGalleryMenu>;

}

export { };
