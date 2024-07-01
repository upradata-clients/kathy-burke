import { initGalleryMenu } from './gallery-menu';


declare global {
    export type GalleryMenu = ReturnType<typeof initGalleryMenu>;

}

export { };
