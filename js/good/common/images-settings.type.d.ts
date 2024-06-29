import * as imagesSettings from './images-settings';

declare global {
    export type ImagesSettings = typeof imagesSettings;
    export interface UnderScore extends ImagesSettings { }
}
