// @ts-check
import { registerUnderScore } from '../lib/register-underscore.js';

const _ = await registerUnderScore();


_.onLoad(() => {

    const galleryItems = getGalleryItems();
    const elements = _.gallery.createGalleriesLayout(galleryItems);

    const menu = _.gallery.galleryMenu.initGalleryMenu({ galleryElements: elements, galleryItems });
    const galleryAnimation = _.gallery.createGalleryAnimation({ elements, galleryMenu: menu });

    let isActive = false;

    const { goTo } = _.gallery.galleryMenu.createGalleryMenuListener({
        elements,
        onActivating: (from, to, isInit) => {
            isActive = true;
            return galleryAnimation.animateActivatingGallery({ state: 'activating', from, to, isInit });
        },
        onClickMenuItem: galleryAnimation.animateSlider,
        onDesactivating: (from, to) => {
            isActive = false;
            return galleryAnimation.animateDesactivatingGallery({ state: 'desactivating', from, to, isInit: false });
        },
        onActivated: galleryAnimation.animateActivatedGallery,
        onDesactivated: galleryAnimation.animateDesactivatedGallery,
        hinterGoTo: menu.hinterGoTo
    });

    window.addEventListener('resize', () => {
        _.dispatchEvent(_.EventNames.gallery.resize, { isActive });
    }, { passive: true });

    // .onEvent(_.EventNames.hero.firstScrubDone, () => {
    _.dispatchEvent(_.EventNames.gallery.resize, { isActive });
    // galleryAnimation.animateSlider({ to: 3, from: -1, isInit: true, state: 'desactivated' });

    /** @type {any} */(window).t_initZoom(elements.gallerySlider.cards.flatMap(card => card.images.map(img => _.queryThrow('img', img))));

    goTo(3, 'desactivated');
    // });

    // _.dispatchEvent(_.EventNames.gallery.resize, { isActive });



    /* setTimeout(() => {
        try {
            if ('lazyload_img' in globalThis) {
                globalThis.lazyload_img.skip_invisible = false;
                globalThis.lazyload_img.update();
            }
        } catch (e) {
            console.error(e);
        }

    }, 501); // in tilda-lazyload-1.0.min.js, there is setTimeout 500 before window.lazyload_img = new window.LazyLoad({...}); */
});




/** @returns {GalleryItems} */
function getGalleryItems() {

    /** @param {string} path */
    const fromTildaImage = path => {
        const [ tildaId, imageName ] = path.split('/');
        return `https://optim.tildacdn.net/${tildaId}/-/format/webp/${imageName}`;
    };
    // const fromTildaImage = (...paths) => [ 'https://static.tildacdn.com', ...paths ].join('/').replace(/\/{2,}/g, '/');


    return [
        {
            name: 'Invisible visitors',
            menu: {
                src: fromTildaImage('tild3234-6531-4631-a666-303231346134/1-small.jpeg'),
                settings: { position: { xs: 'center 55%' } }
            },

            images: [
                {
                    src: fromTildaImage('tild3237-3630-4432-b430-366631396664/1-small.jpeg'),
                    description: 'Acrylic on raw linen 2020 - 146 x 114 cm (58 x 45 in)',
                    settings: { position: { xs: 'center 20%' } }
                },
                {
                    src: fromTildaImage('tild3333-3034-4464-b136-646565373933/2-small.jpeg'),
                    description: 'Detail of Acrylic on raw linen 2020 - 146 x 114 cm (58 x 45 in)',
                    settings: { position: { xs: 'center 80%' } }
                },
                {
                    src: fromTildaImage('tild6130-6366-4366-b331-643366306632/3-small.jpeg'),
                    description: 'Detail 2 of Acrylic on raw linen 2020 - 146 x 114 cm (58 x 45 in)',
                    settings: { position: { xs: 'center 50%' } }
                },
                {
                    src: fromTildaImage('tild3466-3330-4830-a463-396336363562/4-small.jpeg'),
                    description: 'Acrylic on raw linen 2020 - 146 x 114 cm (58 x 45 in)',
                    settings: { position: { xs: 'center 35%' } }
                },
                {
                    src: fromTildaImage('tild3638-6335-4465-b634-386430626534/5-small.jpeg'),
                    description: 'Acrylic on raw linen 2024 - 146 x 114 cm (58 x 45 in)',
                    settings: { position: { xs: 'center 60%' } }
                },
                {
                    src: fromTildaImage('tild3938-3739-4336-b330-326333333433/6-small.jpeg'),
                    description: 'Acrylic on raw linen 2022 - 146 x 114 cm (58 x 45 in)',
                    settings: { position: { xs: 'center 20%' } }
                },
                {
                    src: fromTildaImage('tild6661-6138-4965-b738-636537626233/7-small.jpg'),
                    description: 'Acrylic on raw linen 2018 - 146 x 114 cm (58 x 45 in)',
                    settings: { position: { xs: 'center 40%' } }
                },
                {
                    src: fromTildaImage('tild3630-6233-4266-b835-643333303439/8-small.jpeg'),
                    description: 'Acrylic on raw linen 2018 - 146 x 114 cm (58 x 45 in)',
                    settings: { position: { xs: 'center 40%' } }
                }
            ]
        },
        {
            name: 'Cathedral Moods',
            menu: {
                src: fromTildaImage('tild6633-6639-4766-a134-653861373061/2-small.jpeg'),
                settings: { position: { xs: 'center 35%' } }
            },
            images: [
                {
                    src: fromTildaImage('tild3337-3261-4534-b630-323961353166/1-small.jpeg'),
                    description: 'Acrylic on raw linen 2014 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild3135-3665-4632-b166-643764346366/2-small.jpeg'),
                    description: 'Acrylic on raw linen 2015 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild3631-3836-4364-a339-373861363536/3-small.jpeg'),
                    description: 'Acrylic on raw linen 2014 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild6165-3862-4934-a264-396532376332/4-small.jpeg'),
                    description: 'Acrylic on raw linen 2014 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild3534-3036-4332-b463-363966326466/5-small.jpeg'),
                    description: 'Acrylic on raw linen 2014 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild3566-3062-4132-a638-376466393135/6-small.jpeg'),
                    description: 'Acrylic on raw linen 2013 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild3762-3732-4035-a134-383066303236/7-small.jpeg'),
                    description: 'Acrylic on raw linen 2014 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild3938-3262-4533-b734-636232383263/8-small.jpeg'),
                    description: 'Acrylic on raw linen 2018 - 146 x 114 cm (58 x 45 in)'
                }
            ]
        },
        {
            name: 'Miniatures',
            menu: {
                src: fromTildaImage('tild6637-3239-4538-a265-623663633865/2-small.jpeg'),
                settings: { position: { xs: 'center 20%' } }
            },
            images: [
                {
                    src: fromTildaImage('tild3039-3336-4463-a131-623031353866/1-small.jpeg'),
                    description: 'Acrylic on linen 2016 - 27 x 16 cm (9 x 6.5 in)'
                },
                {
                    src: fromTildaImage('tild3462-6530-4564-b461-633732633031/2-small.jpeg'),
                    description: 'Acrylic on linen 2016 - 24 x 19 cm (11 x 7.5 in)'
                },
                {
                    src: fromTildaImage('tild6233-3262-4430-a238-326435353937/3-small.jpeg'),
                    description: 'Acrylic on linen 2016 - 24 x 19 cm (11 x 7.5 in)'
                },
                {
                    src: fromTildaImage('tild3434-3866-4034-a161-356333623665/4-small.jpeg'),
                    description: 'Acrylic on linen 2016 - 24 x 19 cm (11 x 7.5 in)'
                },
                {
                    src: fromTildaImage('tild3838-3832-4666-b433-383039303064/5-small.jpeg'),
                    description: 'Acrylic on linen 2016 - 24 x 19 cm (11 x 7.5 in)'
                },
                {
                    src: fromTildaImage('tild6463-6536-4331-a264-306336353861/6-small.jpeg'),
                    description: 'Acrylic on linen 2016 - 27 x 22 cm (11 x 9 in)'
                },
                {
                    src: fromTildaImage('tild6261-6134-4533-b634-656638636230/7-small.jpeg'),
                    description: 'Acrylic on linen 2016 - 27 x 22 cm (11 x 9 in)'
                },
                {
                    src: fromTildaImage('tild3961-3736-4032-b262-633036343735/8-small.jpeg'),
                    description: 'Acrylic on linen 2016 - 24 x 19 cm (11 x 7.5 in)'
                }
            ]
        },
        {
            name: 'Paris Portraits',
            menu: {
                src: fromTildaImage('tild6336-3031-4137-b237-396339326366/2-small.jpeg'),
                settings: { position: { xs: 'center 10%', lg: 'center 20%' } }
            },
            images: [
                {
                    src: fromTildaImage('tild3538-3939-4163-b762-353938316363/1-small.jpeg'),
                    description: 'Acrylic on raw linen 2007 - 195 x 97 cm (78 x 38 in)'
                },
                {
                    src: fromTildaImage('tild6361-3430-4335-a363-343965616335/2-small.jpeg'),
                    description: 'Acrylic on raw linen 2007 - 195 x 97 cm (78 x 38 in)'
                },
                {
                    src: fromTildaImage('tild6664-6430-4465-b730-646433613133/3-small.jpeg'),
                    description: 'Acrylic on raw linen 2007 - 195 x 97 cm (78 x 38 in)'
                },
                {
                    src: fromTildaImage('tild6533-3539-4566-b138-336237373033/4-small.jpeg'),
                    description: 'Acrylic on raw linen 2003 - 197 x 97 cm (78 x 38 in)'
                },
                {
                    src: fromTildaImage('tild3064-3866-4664-b738-306637636537/5-small.jpeg'),
                    description: 'Acrylic on raw linen 2007 - 197 x 97 cm (78 x 38 in)'
                },
                {
                    src: fromTildaImage('tild6335-3433-4439-b832-306137323766/6-small.jpeg'),
                    description: 'Acrylic on raw linen 2007 - 197 x 97 cm (78 x 38 in)'
                },
                {
                    src: fromTildaImage('tild3136-6430-4937-b131-366332616132/7-small.jpeg'),
                    description: 'Acrylic on raw linen 1999 - 197 x 97 cm (78 x 38 in)'
                },
                {
                    src: fromTildaImage('tild6236-3339-4061-a434-373862613763/8-small.jpeg'),
                    description: 'Acrylic on raw linen 2007 - 197 x 97 cm (78 x 38 in)'
                }
            ]
        },
        {
            name: 'Model Sessions',
            menu: {
                src: fromTildaImage('tild3662-6530-4335-a237-616363333262/8-small.jpeg'),
                settings: { position: { xs: 'center 10%' } }
            },
            images: [
                {
                    src: fromTildaImage('tild3364-3463-4337-a536-313232303834/1-small.jpeg'),
                    description: 'Photo of the artist and model in a session'
                },
                {
                    src: fromTildaImage('tild3064-3539-4838-a432-663534333564/2-small.jpeg'),
                    description: 'Acrylic on linen 1997 - 116 x 73 cm (46 x 29 in)'
                },
                {
                    src: fromTildaImage('tild6134-3463-4736-b031-353031326133/3-small.jpeg'),
                    description: 'Acrylic on linen 2001 - 73 x 54 cm (29 x 21 in)'
                },
                {
                    src: fromTildaImage('tild6536-6364-4837-b831-626135353630/4-small.jpeg'),
                    description: 'Acrylic on linen 1999 - 116 x 73 cm (46 x 29 in)'
                },
                {
                    src: fromTildaImage('tild3336-3234-4435-b865-643830323334/5-small.jpeg'),
                    description: 'Oil on linen 1991 - 73 x 54 cm (29 x 21 in)'
                },
                {
                    src: fromTildaImage('tild3965-3830-4838-a636-666537663734/6-small.jpeg'),
                    description: 'Acrylic on linen 2001 - 55 x 46 cm (22 x 16 in)'
                },
                {
                    src: fromTildaImage('tild3464-3231-4035-b462-346563663764/7-small.jpeg'),
                    description: 'Acrylic on linen 2001 - 61 x 38 cm (24 x 14 in)'
                },
                {
                    src: fromTildaImage('tild3766-3932-4432-b130-303139633265/8-small.jpeg'),
                    description: 'Oil on linen 1991 - 73 x 54 cm (29 x 21 in)'
                }
            ]
        },
        {
            name: 'Movie Stills',
            menu: {
                src: fromTildaImage('tild3836-3236-4462-b566-353330373365/4-small.jpeg'),
                settings: { position: { xs: 'center 25%' } }
            },
            images: [
                {
                    src: fromTildaImage('tild3338-6636-4136-b035-323639376330/1-small.jpeg'),
                    description: 'Oil on linen 1988 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild3661-3839-4161-b738-376433326463/2-small.jpeg'),
                    description: 'Oil on linen 1990 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild6536-3339-4562-a238-343665623763/3-small.jpeg'),
                    description: 'Oil on linen 1990 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild3161-3531-4265-a139-613962613033/4-small.jpeg'),
                    description: 'Oil on linen 1990 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild6232-3335-4566-b333-343739383834/5-small.jpeg'),
                    description: 'Oil on linen 1989 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild3131-3839-4137-a636-363232366361/6-small.jpeg'),
                    description: 'Oil on linen 1990 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild3764-6666-4332-b761-663937333763/7-small.jpeg'),
                    description: 'Oil on linen 1990 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild3239-6565-4332-b862-353962323766/movie_stils_8.jpg'),
                    description: 'Oil on linen 1987 - 146 x 114 cm (58 x 45 in)'
                }
            ]
        },
        {
            name: 'The Empty Studio',
            menu: {
                src: fromTildaImage('tild3462-3566-4236-b930-333233373963/4-small.jpeg'),
                settings: { position: { xs: 'center 90%', lg: 'center 70%' } }
            },
            images: [
                {
                    src: fromTildaImage('tild6464-3933-4633-b465-326266616432/1-small.jpeg'),
                    description: 'Acrylic on linen 1999 - 116 x 73 cm (46 x 29 in)'
                },
                {
                    src: fromTildaImage('tild6334-6266-4365-b637-663834346439/2-small.jpeg'),
                    description: 'Oil on linen 1990 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild6163-6436-4961-b739-373034626464/3-small.jpeg'),
                    description: 'Oil on linen 1989 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild3763-3163-4132-b861-303161663737/4-small.jpeg'),
                    description: 'Acrylic on linen 2005 - 195 x 97 cm (78 x 38 in)'
                },
                {
                    src: fromTildaImage('tild3836-3138-4866-a532-633135383166/5-small.jpeg'),
                    description: 'Oil on linen 1987 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild3563-6562-4765-a134-633865373966/6-small.jpeg'),
                    description: 'Oil on linen 1990 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild6363-6163-4634-a336-313930393530/7-small.jpeg'),
                    description: 'Oil on linen 1990 - 146 x 114 cm (58 x 45 in)'
                },
                {
                    src: fromTildaImage('tild6232-3561-4536-a331-613564316366/8-small.jpeg'),
                    description: 'Oil on linen 1992 - 146 x 114 cm (58 x 45 in)'
                }
            ]
        }
    ];
}
