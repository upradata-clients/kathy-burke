// @ts-check

/** @param {string} name */
const getSettingPropMap = name => {
    switch (name) {
        case 'position': return 'object-position';
        case 'pos': return 'object-position';
        case 'bgPosition': return 'background-position';
        case 'bgPos': return 'background-position';
        default: return name;
    }
};


/**
 * @param {readonly ImageSettings[] | undefined} settings
 * @returns {readonly ImageSettings[]}
 */
const applySettingsPropMap = settings => {
    if (!settings)
        return [];

    return settings.map(setting => Object.entries(setting).reduce(
        (newSetting, [ prop, value ]) => ({ ...newSetting, [ getSettingPropMap(prop) ]: value }), {})
    );
};

/**
 * @param {HTMLElement[]} images
 * @returns {ImageSettings[]}
 */
const getImagesSettings = images => {

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
            const prop = getSettingPropMap(k);

            return { ...settings, [ prop ]: { ...settings[ prop ], [ mode ]: value.trim() } };
        }, {});
    };

    return images.reduce((settings, image) => {
        const altText = image.getAttribute('aria-label');

        const [ realAltText, settingsStr ] = altText?.split('#') || [];

        if (settingsStr) {
            image.setAttribute('aria-label', realAltText.trim());
            return [ ...settings, getImageSettings(settingsStr) ];
        }

        console.error(`Error parsing image setting "${altText}"`);
        return settings;

    }, /** @type {ImageSettings[]} */([]));
};


export { getImagesSettings, getSettingPropMap, applySettingsPropMap };
