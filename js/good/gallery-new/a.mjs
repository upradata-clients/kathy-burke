import path from 'path';
import fs from 'fs';


const fromTildaImage = s => `fromTildaImage('${s}')`;

const items = [
    {
        name: 'Invisible guests',
        menu: {
            src: fromTildaImage('tild3234-6531-4631-a666-303231346134/-/resize/360x480/-/format/webp/1-small.jpeg'),
            alt: '',
            settings: { position: { xs: 'center 55%' } }
        },
        images: [
            {
                src: fromTildaImage('tild3237-3630-4432-b430-366631396664/-/format/webp/1-small.jpeg'),
                alt: 'Invisible visitors - Acrylic on raw linen 2020',
                settings: { position: { xs: 'center 20%' } }
            },
            {
                src: fromTildaImage('tild3333-3034-4464-b136-646565373933/-/format/webp/2-small.jpeg'),
                alt: 'Invisible visitors - Detail of Acrylic on raw linen 2020',
                settings: { position: { xs: 'center 80%' } }
            },
            {
                src: fromTildaImage('tild6130-6366-4366-b331-643366306632/-/format/webp/3-small.jpeg'),
                alt: 'Invisible visitors - Detail 2 of Acrylic on raw linen 2020',
                settings: { position: { xs: 'center 50%' } }
            },
            {
                // src: fromTildaImage('tild3531-3638-4766-a634-353561313063/-/format/webp/4-small.jpeg'),
                src: fromTildaImage('tild6238-3262-4634-b431-373863653330/-/format/webp/6-small.jpeg'),
                alt: 'Invisible visitors - ?',
                settings: { position: { xs: 'center 35%' } }
            },
            {
                // src: fromTildaImage('tild3861-6237-4965-a163-616338316539/-/format/webp/5-small.jpeg'),
                src: fromTildaImage('tild3337-6234-4866-b632-333263613766/-/format/webp/7-small.jpeg'),
                alt: 'Invisible visitors - Acrylic on raw linen 2021',
                settings: { position: { xs: 'center 50%' } }
            },
            {
                // src: fromTildaImage('tild6238-3262-4634-b431-373863653330/-/format/webp/6-small.jpeg'),
                src: 'https://static.tildacdn.com/tild3238-3566-4366-b538-623331373638/DSC_0002.jpeg',
                alt: 'Invisible visitors - Acrylic on raw linen 2020',
                settings: { position: { xs: 'center 35%' } }
            },
            {
                src: fromTildaImage('tild3861-6237-4965-a163-616338316539/-/format/webp/5-small.jpeg'),
                // src: fromTildaImage('tild3337-6234-4866-b632-333263613766/-/format/webp/7-small.jpeg'),
                alt: 'Invisible visitors - Acrylic on raw linen 2022',
                settings: { position: { xs: 'center 20%' } }
            },
            {
                src: fromTildaImage('tild6562-6334-4238-b335-376530303563/-/format/webp/5.jpeg'),
                alt: 'Invisible visitors - Acrylic on raw linen 2018',
                settings: { position: { xs: 'center 40%' } }
            }
        ]
    },
    {
        name: 'Cathedral Moods',
        menu: {
            src: fromTildaImage('tild6633-6639-4766-a134-653861373061/-/resize/360x480/-/format/webp/2-small.jpeg'),
            alt: '',
            settings: { position: { xs: 'center 35%' } }
        },
        images: [
            {
                src: fromTildaImage('tild3337-3261-4534-b630-323961353166/-/format/webp/1-small.jpeg'),
                description: 'Acrylic on raw linen 2014 (58 x 45 in / 146 x 114 cm)'
            },
            {
                src: fromTildaImage('tild3135-3665-4632-b166-643764346366/-/format/webp/2-small.jpeg'),
                description: 'Acrylic on raw linen 2014 (58 x 45 in / 146 x 114 cm)'
            },
            {
                src: fromTildaImage('tild3631-3836-4364-a339-373861363536/-/format/webp/3-small.jpeg'),
                description: 'Acrylic on raw linen 2014 (58 x 45 in / 146 x 114 cm)'
            },
            {
                src: fromTildaImage('tild6165-3862-4934-a264-396532376332/-/format/webp/4-small.jpeg'),
                description: 'Acrylic on raw linen 2014 (58 x 45 in / 146 x 114 cm)'
            },
            {
                src: fromTildaImage('tild3534-3036-4332-b463-363966326466/-/format/webp/5-small.jpeg'),
                description: 'Acrylic on raw linen 2014 (58 x 45 in / 146 x 114 cm)'
            },
            {
                src: fromTildaImage('tild3566-3062-4132-a638-376466393135/-/format/webp/6-small.jpeg'),
                description: 'Acrylic on raw linen 2014 (58 x 45 in / 146 x 114 cm)'
            },
            {
                src: fromTildaImage('tild3762-3732-4035-a134-383066303236/-/format/webp/7-small.jpeg'),
                description: 'Acrylic on raw linen 2014 (58 x 45 in / 146 x 114 cm)'
            },
            {
                src: fromTildaImage('tild3938-3262-4533-b734-636232383263/-/format/webp/8-small.jpeg'),
                description: 'Acrylic on raw linen 2014 (58 x 45 in / 146 x 114 cm)'
            }
        ],
    },
    {
        name: 'Miniatures',
        menu: {
            src: fromTildaImage('tild6637-3239-4538-a265-623663633865/-/resize/360x480/-/format/webp/2-small.jpeg'),
            alt: 'Miniatures - ',
            settings: { position: { xs: 'center 20%' } }
        },
        images: [
            {
                src: fromTildaImage('tild3039-3336-4463-a131-623031353866/-/format/webp/1-small.jpeg'),
                alt: 'Miniatures - '
            },
            {
                src: fromTildaImage('tild3462-6530-4564-b461-633732633031/-/format/webp/2-small.jpeg'),
                alt: 'Miniatures - '
            },
            {
                src: fromTildaImage('tild6233-3262-4430-a238-326435353937/-/format/webp/3-small.jpeg'),
                alt: 'Miniatures - '
            },
            {
                src: fromTildaImage('tild3434-3866-4034-a161-356333623665/-/format/webp/4-small.jpeg'),
                alt: 'Miniatures - '
            },
            {
                src: fromTildaImage('tild3838-3832-4666-b433-383039303064/-/format/webp/5-small.jpeg'),
                alt: 'Miniatures - '
            },
            {
                src: fromTildaImage('tild6463-6536-4331-a264-306336353861/-/format/webp/6-small.jpeg'),
                alt: 'Miniatures - '
            },
            {
                src: fromTildaImage('tild6261-6134-4533-b634-656638636230/-/format/webp/7-small.jpeg'),
                alt: 'Miniatures - '
            },
            {
                src: fromTildaImage('tild3961-3736-4032-b262-633036343735/-/format/webp/8-small.jpeg'),
                alt: 'Miniatures - '
            }
        ],
    },
    {
        name: 'Paris Portraits',
        menu: {
            src: fromTildaImage('tild6336-3031-4137-b237-396339326366/-/resize/360x480/-/format/webp/2-small.jpeg'),
            alt: '',
            settings: { position: { xs: 'center 10%', lg: 'center 20%' } }
        },
        images: [
            {
                src: fromTildaImage('tild3538-3939-4163-b762-353938316363/-/format/webp/1-small.jpeg'),
                alt: 'Paris Portraits - '
            },
            {
                src: fromTildaImage('tild6361-3430-4335-a363-343965616335/-/format/webp/2-small.jpeg'),
                alt: 'Paris Portraits - '
            },
            {
                src: fromTildaImage('tild6664-6430-4465-b730-646433613133/-/format/webp/3-small.jpeg'),
                alt: 'Paris Portraits - '
            },
            {
                src: fromTildaImage('tild6533-3539-4566-b138-336237373033/-/format/webp/4-small.jpeg'),
                alt: 'Paris Portraits - '
            },
            {
                src: fromTildaImage('tild3064-3866-4664-b738-306637636537/-/format/webp/5-small.jpeg'),
                alt: 'Paris Portraits - '
            },
            {
                src: fromTildaImage('tild6335-3433-4439-b832-306137323766/-/format/webp/6-small.jpeg'),
                alt: 'Paris Portraits - '
            },
            {
                src: fromTildaImage('tild3136-6430-4937-b131-366332616132/-/format/webp/7-small.jpeg'),
                alt: 'Paris Portraits - '
            },
            {
                src: fromTildaImage('tild6236-3339-4061-a434-373862613763/-/format/webp/8-small.jpeg'),
                alt: 'Paris Portraits - '
            }
        ],
    },
    {
        name: 'Model Sessions',
        menu: {
            src: fromTildaImage('tild3662-6530-4335-a237-616363333262/-/resize/360x480/-/format/webp/8-small.jpeg'),
            alt: '',
            settings: { position: { xs: 'center 10%' } }
        },
        images: [
            {
                src: fromTildaImage('tild3364-3463-4337-a536-313232303834/-/format/webp/1-small.jpeg'),
                alt: 'Model Sessions - '
            },
            {
                src: fromTildaImage('tild3064-3539-4838-a432-663534333564/-/format/webp/2-small.jpeg'),
                alt: 'Model Sessions - '
            },
            {
                src: fromTildaImage('tild6134-3463-4736-b031-353031326133/-/format/webp/3-small.jpeg'),
                alt: 'Model Sessions - '
            },
            {
                src: fromTildaImage('tild6536-6364-4837-b831-626135353630/-/format/webp/4-small.jpeg'),
                alt: 'Model Sessions - '
            },
            {
                src: fromTildaImage('tild3336-3234-4435-b865-643830323334/-/format/webp/5-small.jpeg'),
                alt: 'Model Sessions - '
            },
            {
                src: fromTildaImage('tild3965-3830-4838-a636-666537663734/-/format/webp/6-small.jpeg'),
                alt: 'Model Sessions - '
            },
            {
                src: fromTildaImage('tild3464-3231-4035-b462-346563663764/-/format/webp/7-small.jpeg'),
                alt: 'Model Sessions - '
            },
            {
                src: fromTildaImage('tild3766-3932-4432-b130-303139633265/-/format/webp/8-small.jpeg'),
                alt: 'Model Sessions - '
            }
        ],
    },
    {
        name: 'Movie Stills',
        menu: {
            src: fromTildaImage('tild3836-3236-4462-b566-353330373365/-/resize/360x480/-/format/webp/4-small.jpeg'),
            alt: '',
            settings: { position: { xs: 'center 25%' } }
        },
        images: [
            {
                src: fromTildaImage('tild3338-6636-4136-b035-323639376330/-/format/webp/1-small.jpeg'),
                alt: 'Movie Stills - '
            },
            {
                src: fromTildaImage('tild3661-3839-4161-b738-376433326463/-/format/webp/2-small.jpeg'),
                alt: 'Movie Stills - '
            },
            {
                src: fromTildaImage('tild6536-3339-4562-a238-343665623763/-/format/webp/3-small.jpeg'),
                alt: 'Movie Stills - '
            },
            {
                src: fromTildaImage('tild3161-3531-4265-a139-613962613033/-/format/webp/4-small.jpeg'),
                alt: 'Movie Stills - '
            },
            {
                src: fromTildaImage('tild6232-3335-4566-b333-343739383834/-/format/webp/5-small.jpeg'),
                alt: 'Movie Stills - '
            },
            {
                src: fromTildaImage('tild3131-3839-4137-a636-363232366361/-/format/webp/6-small.jpeg'),
                alt: 'Movie Stills - '
            },
            {
                src: fromTildaImage('tild3764-6666-4332-b761-663937333763/-/format/webp/7-small.jpeg'),
                alt: 'Movie Stills - '
            },
            {
                src: fromTildaImage('tild3239-6565-4332-b862-353962323766/-/format/webp/movie_stils_8.jpg'),
                alt: 'Movie Stills - '
            }
        ]
    },
    {
        name: 'The Empty Studio',
        menu: {
            src: fromTildaImage('tild3462-3566-4236-b930-333233373963/-/resize/360x480/-/format/webp/4-small.jpeg'),
            alt: '',
            settings: { position: { xs: 'center 90%', lg: 'center 70%' } }
        },
        images: [
            {
                src: fromTildaImage('tild6464-3933-4633-b465-326266616432/-/format/webp/1-small.jpeg'),
                alt: 'The Empty Studio - 46 x 29 in. (116 x 73 cm) - Acrylic on linen 1999',
            },
            {
                src: fromTildaImage('tild6334-6266-4365-b637-663834346439/-/format/webp/2-small.jpeg'),
                alt: ''
            },
            {
                src: fromTildaImage('tild6163-6436-4961-b739-373034626464/-/format/webp/3-small.jpeg'),
                alt: ''
            },
            {
                src: fromTildaImage('tild3763-3163-4132-b861-303161663737/-/format/webp/4-small.jpeg'),
                alt: ''
            },
            {
                src: fromTildaImage('tild3836-3138-4866-a532-633135383166/-/format/webp/5-small.jpeg'),
                alt: ''
            },
            {
                src: fromTildaImage('tild3563-6562-4765-a134-633865373966/-/format/webp/6-small.jpeg'),
                alt: ''
            },
            {
                src: fromTildaImage('tild6363-6163-4634-a336-313930393530/-/format/webp/7-small.jpeg'),
                alt: ''
            },
            {
                src: fromTildaImage('tild3336-3266-4038-a239-313063376530/-/format/webp/DSC_0132-small.jpeg'),
                alt: ''
            }
        ]
    }
];


const descriptions = [
    {
        name: 'Cathedral Moods',
        descr: [
            "58 X 45 IN. (146 X 114 CM) - ACRYLIC ON RAW LINEN 2014",
            "58 X 45 IN. (146 X 114 CM) - ACRYLIC ON RAW LINEN 2015",
            "58 X 45 IN. (146 X 114 CM) - ACRYLIC ON RAW LINEN 2014",
            "58 X 45 IN. (146 X 114 CM) - ACRYLIC ON RAW LINEN 2014",
            "58 X 45 IN. (146 X 114 CM) - ACRYLIC ON RAW LINEN 2014",
            "58 X 45 IN. (146 X 114 CM) - ACRYLIC ON RAW LINEN 2013",
            "58 X 45 IN. (146 X 114 CM) - ACRYLIC ON RAW LINEN 2014",
            "58  X  45  iN. (146 X 114 CM)  — ACRYLIC ON RAW LINEN  2018"
        ]
    },

    {
        name: 'Miniatures',
        descr: [
            "11 X 6 1/2 IN. (27 X 16 CM) - ACRYLIC ON LINEN 2016",
            "9 1/2 X 7 1/2 IN. (24 X 19 CM) - ACRYLIC ON LINEN 2016",
            "9 1/2 X 7 1/2 IN. (24 X 19 CM) -ACRYLIC ON LINEN 2016",
            "9 1/2 X 7 1/2 IN. (24 X 19 CM) - ACRYLIC ON LINEN 2016",
            "9 1/2 X 7 1/2 IN. (24 X 19 CM) - ACRYLIC ON LINEN 2016",
            "11 X 9 IN. (27 X 22 CM) - ACRYLIC ON LINEN 2016",
            "11 X 9 IN. (27 X 22 CM) - ACRYLIC ON LINEN 2016",
            "9 1/2 X 7 1/2 IN. (24 X 19 CM) - ACRYLIC ON LINEN 2016" ]
    },

    {
        name: 'Paris Portraits',
        descr: [
            "78 X 38 IN. (195 X 97 CM) - ACRYLIC ON RAW LINEN 2007",
            "78 X 38 IN. (195 X 97 CM) - ACRYLIC ON RAW LINEN 2007",
            "78 X 38 IN. (195 X 97 CM) - ACRYLIC ON RAW LINEN 2007",
            "78 X 38 IN. (197 X 97 CM) - ACRYLIC ON RAW LINEN 2003",
            "78 X 38 IN. (197 X 97 CM) - ACRYLIC ON RAW LINEN 2007",
            "78 X 38 IN. (197 X 97 CM) - ACRYLIC ON RAW LINEN 2007",
            "78 X 38 IN. (197 X 97 CM) - ACRYLIC ON RAW LINEN 1999",
            "78 X 38 IN. (197 X 97 CM) - ACRYLIC ON RAW LINEN 2007" ]
    },

    {
        name: 'Model Sessions',
        descr: [
            "PHOTO OF THE ARTIST AND MODEL IN A SESSION",
            "46 X 29 IN. (116 X 73 CM) - ACRYLIC ON LINEN 1997",
            "29 X 21 IN. (73 X 54 CM) - ACRYLIC ON LINEN 2001",
            "46 X 29 IN. (116 X 73 CM) - ACRYLIC ON LINEN 1999",
            "29 X 21 IN. (73 X 54 CM) - OIL ON LINEN 1991",
            "22 X 16 IN. (55 X 46 CM) - ACRYLIC ON LINEN 2001",
            "24 X 14 IN. (61 X 38 CM) - ACRYLIC ON LINEN 2001",
            "29 X 21 IN. (73 X 54 CM) - OIL ON LINEN 1991" ]
    },
    {
        name: 'Movie Stills',
        descr: [
            "58 X 45 IN. (146 X 114 CM) - OIL ON LINEN 1988",
            "58 X 45 IN. (146 X 114 CM) - OIL ON LINEN 1990",
            "58 X 45 IN. (146 X 114 CM) - OIL ON LINEN 1990",
            "58 X 45 IN. (146 X 114 CM) - OIL ON LINEN 1990",
            "58 X 45 IN. (146 X 114 CM) - OIL ON LINEN 1989",
            "58 X 45 IN. (146 X 114 CM) - OIL ON LINEN 1990",
            "58 X 45 IN. (146 X 114 CM) - OIL ON LINEN 1990",
            "58 X 45 IN. (146 X 114 CM) - OIL ON LINEN 1987" ]
    },
    {
        name: 'The Empty Studio',
        descr: [
            "46 X 29 IN. (116 X 73 CM) - ACRYLIC ON LINEN 1999",
            "58 X 45 IN. (146 X 114 CM) - OIL ON LINEN 1990",
            "58 X 45 IN. (146 X 114 CM) - OIL ON LINEN 1989",
            "78 X 38 IN. (195 X 97 CM) - ACRYLIC ON LINEN 2005",
            "58 X 45 IN. (146 X 114 CM) - OIL ON LINEN 1987",
            "58 X 45 IN. (146 X 114 CM) - OIL ON LINEN 1990",
            "58 X 45 IN. (146 X 114 CM) - OIL ON LINEN 1990",
            "58 X 45 IN. (146 X 114 CM) - OIL ON LINEN 1992" ]
    },
].map(data => {

    const descr = data.descr.map(s => {
        const descr = s.trim().toLocaleLowerCase();
        const [ dim, date ] = descr.split(' - ');

        const inDim = dim.match(/\d+\s+x\s+\d+\s+in/)?.[ 0 ];
        const cmDim = dim.match(/\d+\s+x\s+\d+\s+cm/)?.[ 0 ];

        return `${date} - ${cmDim} (${inDim})`;
    });

    return { ...data, descr };
}, {});


const res = items.map(item => {
    const data = descriptions.find(d => d.name === item.name);

    if (data)
        return { ...item, images: item.images.map((img, i) => ({ ...img, description: data.descr[ i ] })) };

    return item;
});

/* console.log(res); */

fs.writeFile('a.json', JSON.stringify(res, null, 4), () => {});
