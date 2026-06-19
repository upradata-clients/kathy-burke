import type { Metadata } from 'next';
import './globals.css';
import AppProvider from './providers/app-provider';

const inter = Inter({ subsets: [ 'latin' ] });

/* export const metadata: Metadata = {
    title: 'Kathy Burke Website',
    description: "Kathy Burke's landing page. She is a renowned painter based in Paris and this page shows a few series of her paintings.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body className={inter.className}>{children}</body>
        </html>
    );
} */



const RootLayout = async ({ children }: React.PropsWithChildren) => {
    return (
        <html lang="en">
            <body>
                <AppProvider routes={routes}>
                    {children}
                </AppProvider>
            </body>
        </html>
    );
};


export default RootLayout;


// either Static metadata
export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_PUBLIC_URL!),
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
    },
    icons: {

    },
    title: {
        template: '%s | Kathy Burke Website',
        default: 'Kathy Burke Website', // a default is required when creating a template
    },
    description: "Kathy Burke's landing page. She is a renowned painter based in Paris and this page shows a few series of her paintings.",
    generator: 'Next.js',
    applicationName: 'Victory App',
    referrer: 'origin-when-cross-origin',
    keywords: [ 'Next.js', 'React', 'Typescript', 'Victory', 'Fitness', 'Upra-Data web-designer' ],
    authors: [ { name: 'Upra-Data', url: 'https://digital.upradata.com' } ],
    // colorScheme: 'dark',
    // themeColor: '#ffffff',
    /* themeColor: [
        { media: '(prefers-color-scheme: light)', color: 'cyan' },
        { media: '(prefers-color-scheme: dark)', color: 'black' },
    ], */
    // manifest: 'https://nextjs.org/manifest.json',
    creator: 'Upra-Data',
    publisher: 'Upra-Data',
    /* formatDetection: {
        email: false,
        address: false,
        telephone: false,
    }, */
    /* alternates: {
        canonical: '/',
        languages: {
            'en-US': '/en-US',
            'de-DE': '/de-DE',
        },
    },
    openGraph: {
        title: 'Next.js',
        description: 'The React Framework for the Web',
        type: 'article',
        publishedTime: '2023-01-01T00:00:00.000Z',
        authors: ['Seb', 'Josh'],
        url: 'https://nextjs.org',
        siteName: 'Next.js',
        images: [
        {
            url: 'https://nextjs.org/og.png',
            width: 800,
            height: 600,
        },
        {
            url: 'https://nextjs.org/og-alt.png',
            width: 1800,
            height: 1600,
            alt: 'My custom alt',
        },
        ],
        locale: 'en_US',
        type: 'website',
    },
    robots: {
        index: false,
        follow: true,
        nocache: true,
        googleBot: {
            index: true,
            follow: false,
            noimageindex: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Next.js',
        description: 'The React Framework for the Web',
        siteId: '1467726470533754880',
        creator: '@nextjs',
        creatorId: '1467726470533754880',
        images: ['https://nextjs.org/og.png'],
    }
    */
    /* alternates: {
        canonical: 'https://nextjs.org',
        languages: {
            'en-US': 'https://nextjs.org/en-US',
            'de-DE': 'https://nextjs.org/de-DE',
        },
        media: {
            'only screen and (max-width: 600px)': 'https://nextjs.org/mobile',
        },
        types: {
            'application/rss+xml': 'https://nextjs.org/rss',
        },
    }, */
    /* verification: {
        google: 'google',
        yandex: 'yandex',
        yahoo: 'yahoo',
        other: {
            me: [ 'my-email', 'my-link' ],
        },
    }, */
    /* appLinks: {
        ios: {
            url: 'https://nextjs.org/ios',
            app_store_id: 'app_store_id',
        },
        android: {
            package: 'com.example.android/package',
            app_name: 'app_name_android',
        },
        web: {
            url: 'https://nextjs.org/web',
            should_fallback: true,
        },
    },
    assets: [ 'https://nextjs.org/assets' ],
    category: 'technology', */
};
