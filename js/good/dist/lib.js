// common/mouse-follow.js
_.define(() => {
    // @ts-check


    /**
     * @typedef {import("gsap")} gsap
     */

    /**
     * @typedef {Record<'x'|'y', number>} Vector2D
     */


    /**
     * @typedef {Object} MouseFollowerData
     * @property {number} i
     * @property {HTMLElement} item
     * @property {DOMRect} rect
     * @property {Vector2D} mouse
     */


    /**
     * @typedef {(distance: Vector2D, data: MouseFollowerData) => Vector2D} DistanceToProgress
     * @typedef {(progress: Vector2D, data: MouseFollowerData) => Vector2D} ProgressEase
     * @typedef {(progress: number, data: MouseFollowerData) => number} ProgressEase1D
     * @typedef {Record<'x'|'y', gsap.EaseString | ProgressEase1D> } ProgressEase2D
     */


    /**
     * @param {Object} params
     * @param {HTMLElement[]} params.items
     * @param {HTMLElement} [params.elementToListenTheMouse]
     * @param {Partial<ProgressEase2D> | ProgressEase} [params.distanceEasing]
     * @param {Partial<Vector2D>} [params.maxDistance]
     * @param {DistanceToProgress} [params.distanceToProgress]
     * @param {Partial<Record<'x'|'y', { min?: number; max?: number;}>>} [params.progressClamp]
     * @param {(data: MouseFollowerData) => void} params.onMouseMove
     * @param {() => void} [params.onStart]
     * @param {() => void | Promise<void>} [params.onStop]
     */
    const createMouseFollower = params => {
        const {
            items,
            elementToListenTheMouse = document.documentElement,
            onMouseMove
        } = params;


        const maxDistance = {
            x: 300,
            y: 300,
            ...params.maxDistance
        };

        /**
         * Creates a mouse distance easing function.
         * @type {(distance: number, maxDistance: number) => number}
         */
        const distanceToProgressDefault = (distance, maxDistance) => distance / maxDistance;

        /** @type {DistanceToProgress} */
        const distanceToProgress = params.distanceToProgress || (distance => ({
            x: distanceToProgressDefault(distance.x, maxDistance.x),
            y: distanceToProgressDefault(distance.y, maxDistance.y)
        }));


        /** @type {ProgressEase} */
        const distanceEasing = (distanceProgress, data) => {

            if (typeof params.distanceEasing === 'function')
                return params.distanceEasing(distanceProgress, data);

            const {
                x: xEase,
                y: yEase
            } = params.distanceEasing || {};

            const ease1D = {
                x: typeof xEase === 'function' ? xEase : gsap.parseEase(xEase || 'power1.out'),
                y: typeof yEase === 'function' ? yEase : gsap.parseEase(yEase || 'power1.out')
            };

            /** @type {(axis: 'x' | 'y') => ProgressEase1D} */
            const createEasing = axis => distanceProgress => {
                const clampMin = params.progressClamp?.[axis]?.min || -1;
                const clampMax = params.progressClamp?.[axis]?.max || 1;

                const clampedProgress = gsap.utils.clamp(clampMin, clampMax, distanceProgress);
                const easeX = ease1D[axis](Math.abs(clampedProgress), data);

                return clampedProgress < 0 ? -easeX : easeX;
            };

            return {
                x: createEasing('x')(distanceProgress.x, data),
                y: createEasing('y')(distanceProgress.y, data)
            };
        };


        /** @type {(data: MouseFollowerData) => Vector2D} */
        const getDistanceEase = data => {
            const {
                rect,
                mouse
            } = data;

            const distance = /** @type {Vector2D}*/ (Object.fromEntries(['x', 'y'].map(axis => {
                const size = axis === 'x' ? 'width' : 'height';

                const X = rect[axis];
                const middle = X + rect[size] / 2;

                return [axis, middle - mouse[axis]];
            })));

            const progress = distanceToProgress(distance, data);

            return distanceEasing(progress, data);
        };

        /** @type {(this: HTMLElement, ev: MouseEvent) => any} */
        const listener = ({
            clientX: mouseX,
            clientY: mouseY
        }) => {
            if (!isActive) {
                console.log('not active');
                return;
            }

            items.forEach((item, i) => {
                const mouse = {
                    x: mouseX,
                    y: mouseY
                };
                const rect = item.getBoundingClientRect();

                onMouseMove({
                    i,
                    item,
                    rect,
                    mouse
                });
            });
        };

        let isActive = false;

        return {
            start: () => {
                isActive = true;
                params.onStart?.();
                elementToListenTheMouse.addEventListener('mousemove', listener, {
                    passive: true
                });
            },
            stop: () => {
                isActive = false;
                elementToListenTheMouse.removeEventListener('mousemove', listener, {});
                return params.onStop?.();
            },
            getDistanceEase
        };
    };


    return {
        createMouseFollower
    };

});

// common/images-settings.js
_.define(() => {
    // @ts-check



    /**
     * @typedef {string | 'value'} ImageSettingsMode
     * @typedef {string} ImageSettingsProp
     * @typedef {Record<ImageSettingsProp, Record<ImageSettingsMode, string>>} ImageSettings
     */

    /**
     * @param {HTMLElement[]} images
     * @returns {ImageSettings[]}
     */
    const getImagesSettings = images => {

        /** @param {string} name */
        const settingNameToProp = name => {
            switch (name) {
                case 'position':
                    return 'background-position';
                default:
                    return name;
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

                const [, key, value] = result;

                const [, mode = 'value', k] = key.match(/(?:(.+)-)?(.*)/) || [];
                const prop = settingNameToProp(k);

                return {
                    ...settings,
                    [prop]: {
                        ...settings[prop],
                        [mode]: value.trim()
                    }
                };
            }, {});
        };

        return images.reduce((settings, image) => {
            const altText = image.getAttribute('aria-label');

            const [realAltText, settingsStr] = altText?.split('#') || [];

            if (settingsStr) {
                image.setAttribute('aria-label', realAltText.trim());
                return [...settings, getImageSettings(settingsStr)];
            }

            console.error(`Error parsing image setting "${altText}"`);
            return settings;

        }, /** @type {ImageSettings[]} */ ([]));
    };


    return {
        getImagesSettings
    };

});
