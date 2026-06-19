'use client';

import { ColorModeScript } from '@chakra-ui/system';
import { theme } from '@/theme';
import { MetadataProvider } from './metadata-provider';
import { RoutesProvider } from './routes-provider';
import { UiProvider } from './ui-provider';

import type { Routes } from '@/contexts';
import type { GetServerSideProps } from 'next/types';


export const AppProvider: React.FC<React.PropsWithChildren<{ routes: Routes; }>> = ({ routes, children }) => {
    return (
        <>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />

            <UiProvider>
                <RoutesProvider routes={routes}>
                    <MetadataProvider>
                        {children}
                    </MetadataProvider>
                </RoutesProvider>
            </UiProvider>
        </>
    );

};


export default AppProvider;



export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    return {
        props: {
            // first time users will not have any cookies and you may not return
            // undefined here, hence ?? is necessary
            cookies: req.headers.cookie ?? '',
        }
    };
};
