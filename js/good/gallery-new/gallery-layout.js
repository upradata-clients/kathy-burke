// @ts-check


/**
 * @param {GalleryItems} galleryItems
 */
const createGalleriesLayout = galleryItems => {
    const gallery = _.queryThrow('.gallery');

    const menu = _.queryThrow('.uc-gallery-menu', gallery);
    const menuContainer = _.queryThrow('.t959__container', menu);

    const slider = _.queryThrow('.uc-slider-cards', gallery);
    const sliderWrapper = _.queryThrow('.slider-wrapper', slider);

    const galleryBackground = _.queryThrow('.gallery-background', slider);

    const references = {
        menuCard: _.queryThrow('.t959__card', menuContainer),
        sliderCard: _.queryThrow('.card', slider),
        galleryBackgroundItem: _.queryThrow('.t156__item', galleryBackground)
    };

    /** @param {number} index */
    const createMenuItem = index => {
        const { name, menu: { src, alt } } = galleryItems[ index ];

        const item = /** @type {HTMLElement} */(references.menuCard.cloneNode(true));
        item.classList.add(`menu-item-${index}`);

        const title = _.queryThrow('.t-card__title', item);
        const img = _.queryThrow('img', item);

        const metaImage = /** @type {HTMLMetaElement} */(_.queryThrow('[itemprop="image"]', item));
        const metaCaption = /** @type {HTMLMetaElement} */(_.queryThrow('[itemprop="caption"]', item));

        title.textContent = name;
        metaCaption.content = alt;

        img.src = src;
        img.alt = alt;
        metaImage.content = src;

        return { item, title };
    };

    /**
     * @param {number} categoryI
     * @param {number} cardI
     */
    const createSliderCardImage = (categoryI, cardI) => {
        const { images } = galleryItems[ categoryI ];
        const { src, alt } = images[ cardI ];

        const slideCardImage = _.queryThrow('.t156__item', references.sliderCard);

        const item = /** @type {HTMLElement} */(slideCardImage.cloneNode(true));

        const img = _.queryThrow('img', item);

        const metaImage = /** @type {HTMLMetaElement} */(_.queryThrow('[itemprop="image"]', item));
        const metaCaption = /** @type {HTMLMetaElement} */(_.queryThrow('[itemprop="caption"]', item));

        metaCaption.content = alt;

        img.src = src;
        img.dataset.galleryImgZoomUrl = src;
        // img.dataset.imgZoomUrl = src;
        // img.dataset.original = src;
        metaImage.content = src;

        img.dataset.zoomTarget = `${cardI}`;
        img.dataset.imgZoomDescr = alt;

        return item;
    };

    /** @param {number} index */
    const createSliderCard = index => {
        const { images } = galleryItems[ index ];

        const item = /** @type {HTMLElement} */(references.sliderCard.cloneNode(true));
        const wrapper = _.queryThrow('.t156__wrapper', item);

        _.queryThrow('.t156__item', item).remove();

        item.classList.add(`gallery-item-${index}`);

        const cardImages = images.map((_, imageI) => createSliderCardImage(index, imageI));

        wrapper.append(...cardImages);

        return { card: item, images: cardImages, wrapper };
    };

    /** @param {number} index */
    const createGalleryBackgroundItem = index => {
        const item = /** @type {HTMLElement} */(references.galleryBackgroundItem.cloneNode(true));
        item.classList.add(`gallery-item-${index}`);

        return item;
    };

    const galleryElts = galleryItems.map((__, menuI) => {
        const menuItem = createMenuItem(menuI);
        const sliderCard = createSliderCard(menuI);
        const galleryBackgroundItem = createGalleryBackgroundItem(menuI);

        menuContainer.append(menuItem.item);
        sliderWrapper.append(sliderCard.card);
        _.queryThrow('.t156__wrapper', galleryBackground).append(galleryBackgroundItem);

        return { menuItem, sliderCard, galleryBackgroundItem };
    });

    Object.values(references).forEach(ref => ref.remove());

    const galleryTitle = _.queryThrow('.uc-gallery-title');

    const elements = {
        gallery: galleryElts,
        menu: {
            block: menu,
            menuContainer,
            menuItems: galleryElts.map(({ menuItem }) => menuItem)
        },
        galleryTitle: {
            block: galleryTitle,
            titles: _.queryAllThrow('.t-title', galleryTitle),
            descr: _.queryThrow('.t-descr ', galleryTitle)
        },
        gallerySlider: {
            block: _.queryThrow('.uc-slider-cards'),
            wrapper: sliderWrapper,
            cards: galleryElts.map(({ sliderCard }) => sliderCard)
        },
        galleryBackground: {
            block: galleryBackground,
            container: _.queryThrow('.t-container', galleryBackground),
            items: galleryElts.map(({ galleryBackgroundItem }) => galleryBackgroundItem)
        }
    };

    return elements;
};



export { createGalleriesLayout };
