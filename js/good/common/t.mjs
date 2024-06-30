/**
 * @typedef {string | 'value'} ImageSettingsMode
 * @typedef {string} ImageSettingsProp
 * @typedef {Record<ImageSettingsProp, Record<ImageSettingsMode, string>>} ImageSettings
 */

/**
 * @param {any[]} images
 * @returns {ImageSettings[]}
 */
const getImagesSettings = images => {

    /** @param {string} name */
    const settingNameToProp = name => {
        switch (name) {
            case 'position': return 'background-position';
            default: return name;
        }
    };

    /**
     * @param {string} settingsStr
     * @returns {ImageSettings}
     */
    const getImageSettings = settingsStr => {
        return settingsStr.split(',').reduce((settings, settingStr) => {

            const result = settingStr.match(/\s*(?<key>\S+)\s*:\s*(?<value>.*)\s*/);

            if (!result) {
                console.log(`Wrong alt text setting: ${settingStr}`);
                return settings;
            }

            const [ , key, value ] = result;

            const [ , mode = 'value', k ] = key.match(/(?:(.+)-)?(.*)/) || [];
            const prop = settingNameToProp(k);

            return { ...settings, [ prop ]: { ...settings[ prop ], [ mode ]: value.trim() } };
        }, {});
    };

    return images.reduce((settings, image) => {
        const altText = image.alt;

        const [ realAltText, settingsStr ] = altText?.split('#') || [];

        if (settingsStr) {
            //  image.setAttribute('aria-label', realAltText.trim());
            return [ ...settings, getImageSettings(settingsStr) ];
        }

        console.error(`Error parsing image setting "${altText}"`);
        return settings;

    }, /** @type {ImageSettings[]} */([]));
};


const fromTildaImage = (...paths) => [ 'https://optim.tildacdn.net', ...paths ].join('/');


console.log(getImagesSettings([
    {
        alt: 'Invisible visitors - Acrylic on raw linen 2020 #xs-position: center 20%',
    },
    {
        alt: 'Invisible visitors - Detail of Acrylic on raw linen 2020 #xs-position: center 80%'
    },
    {
        alt: 'Invisible visitors - Detail 2 of Acrylic on raw linen 2020 #xs-position: center 50%'
    },
    {
        alt: 'Invisible visitors - ?#xs-position: center 35%'
    },
    {
        alt: 'Invisible visitors - Acrylic on raw linen 2021 #xs-position: center 50%'
    },
    {
        alt: 'Invisible visitors - Acrylic on raw linen 2020 #xs-position: center 35%'
    },
    {
        alt: 'Invisible visitors - Acrylic on raw linen 2022 #xs-position: center 20%'
    },
    {
        alt: 'Invisible visitors - Acrylic on raw linen 2018 #xs-position: center 40%'
    }
]));


console.log(getImagesSettings([
    "Invisible Visitors - Acrylic on raw linen 2020 #xs-position: center 55%",
    "Cathedral Moods - Acrylic on raw linen 2015 #xs-position: center 35%",
    "Miniatures - Acrylic on raw linen 2016 #xs-position: center 20%",
    "Paris Portraits - Acrylic on raw linen 2007 #lg-position: center 20%, xs-position: center 10%",
    "Model Sessions - Oil on linen 1991 #xs-position: center 10%",
    "Movie Stills - Oil on linen 1990 #xs-position: center 25%",
    "The Empty Studio - Acrylic on linen 2005 #lg-position: center 70%, xs-position: center 90%"
].map(s => ({ alt: s }))));
