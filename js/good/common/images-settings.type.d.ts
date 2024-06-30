import * as imagesSettings from './images-settings';

declare global {
    type _ImagesSettings = typeof imagesSettings;
    export interface UnderScore extends _ImagesSettings { }


    // export type ImageSettingsMode = string | 'value';
    // export type ImageSettingsProp = string;
    // export type ImageSettings = Record<ImageSettingsProp, Record<ImageSettingsMode, string>>;

    type ImageSettingsMediaQueries = 'xs' | 'md' | 'lg' | 'xl' | 'all';
    type ImageSettingsKeys = 'position' | 'bgPosition';

    export type ImageSettings<Keys extends string = ImageSettingsKeys, MediaQ extends string = ImageSettingsMediaQueries> = {
        [ K in Keys ]?: { [ MQ in MediaQ ]?: number | string; };
    };

}
