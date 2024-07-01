import { createGalleriesLayout } from './gallery-layout';


declare global {

    export type Image = {
        readonly src: string;
        readonly alt: string;
        readonly settings?: ImageSettings;
    };

    export type GalleryItem = {
        readonly name: string;
        readonly menu: Image;
        readonly images: readonly Image[];
    };


    export type GalleryItems = readonly GalleryItem[];


    export type GalleryElements = ReturnType<typeof createGalleriesLayout>;

    export type GallerySliderCard = InferArray<GalleryElements[ 'gallerySlider' ][ 'cards' ]>;
}

export { };
