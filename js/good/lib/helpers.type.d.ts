import { helpers } from './helpers';

declare global {
    export type Helpers = typeof helpers;
    export interface UnderScore extends Helpers { }


    export interface GlobalEventNames {
        ready: {
            document: 'document:ready',
            gsap: 'gsap:ready',
            gallery: 'gallery:ready';
        },
        resize: 'resize';
    }

    export interface EventNames extends GlobalEventNames { }

    export type EventData<T extends string> = unknown extends _EventData[ T ] ? undefined : _EventData[ T ];

    export interface _EventData { }
}
