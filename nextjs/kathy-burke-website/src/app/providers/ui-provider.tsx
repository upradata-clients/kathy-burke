'use client';

import { Theme } from '@radix-ui/themes';
import { Dancing_Script, Nunito } from 'next/font/google';

import '@radix-ui/themes/styles.css';

const fonts = {
    h1: Dancing_Script({
        subsets: [ 'latin' ],
        weight: [ '700' ]
    }),
    p: Nunito({
        subsets: [ 'latin' ],
        weight: [ '300', '400', '600' ]
    })
};

export const UiProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    return <Theme className={[ fonts.h1.className, fonts.p.className ].join(' ')}>{children}</Theme>;
};
