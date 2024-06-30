// @ts-check



/**
 * @param {HTMLElement[]} images
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


export { getImagesSettings };
