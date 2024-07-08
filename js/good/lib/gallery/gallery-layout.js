// @ts-check


/**
 * @param {GalleryItems} galleryItems
 */
const createGalleriesLayout = galleryItems => {
    const gallery = _.queryThrow('.mt-gallery');

    const menu = _.queryThrow('.mt-gallery_menu', gallery);
    const slider = _.queryThrow('.mt-gallery_slider', gallery);
    const galleryBackground = _.queryThrow('.mt-gallery_slider_background', slider);

    const containers = {
        slider: _.queryThrow('.mt-gallery_slider-container', slider),
        galleryBackground: _.queryThrow('.mt-gallery_slider_card-container', galleryBackground)
    };

    const references = {
        menuCard: /** @type {HTMLTemplateElement} */(_.queryThrow('.mt-gallery_menu_card_template', menu)),
        sliderCard: /** @type {HTMLTemplateElement} */(_.queryThrow('.mt-gallery_slider_card_template', slider)),
        sliderCardItem:  /** @type {HTMLTemplateElement} */(_.queryThrow('.mt-gallery_slider_card-item_template', slider)),
        galleryBackgroundItem: /** @type {HTMLTemplateElement} */(_.queryThrow('.mt-gallery_slider_background-item_template', galleryBackground))
    };


    /** @param {number} index */
    const createMenuItem = index => {
        const { name } = galleryItems[ index ];
        const { menu } = galleryItems[ index ];

        const { src, alt = `menu for "${name}" series of Kathy Burkes's painting` } = menu;

        const item = _.createElementFromTemplate(references.menuCard);
        item.classList.add(`mt-gallery_menu_card-${index}`);

        const title = _.queryThrow('.mt-gallery_menu_card-title', item);
        const img =/** @type {HTMLImageElement} */(_.queryThrow('.mt-gallery_menu_card-image', item));

        const metaImage = /** @type {HTMLMetaElement} */(_.queryThrow('[itemprop="image"]', item));
        const metaCaption = /** @type {HTMLMetaElement} */(_.queryThrow('[itemprop="caption"]', item));

        title.textContent = name;

        img.src = src;
        metaImage.content = src;

        metaCaption.content = alt;
        img.alt = alt;


        return { item, title, img };
    };

    /**
     * @param {number} categoryI
     * @param {number} cardI
     */
    const createSliderCardItem = (categoryI, cardI) => {
        const { images, name } = galleryItems[ categoryI ];

        const { src, title = name, description = '' } = images[ cardI ];
        const alt = images[ cardI ].alt || `Kathy Burkes's painting entitled "${title}${description ? ` - ${description}` : ''}" of the ${name} series`;

        const slideCardImage = _.createElementFromTemplate(references.sliderCardItem);

        const item = _.cloneElement(slideCardImage);
        item.classList.add(`mt-gallery_slider_card-item-${cardI}`);
        item.dataset.zoomTarget = `${cardI}`;

        const img = _.queryThrow('img', item);

        const metaImage = /** @type {HTMLMetaElement} */(_.queryThrow('[itemprop="image"]', item));
        const metaCaption = /** @type {HTMLMetaElement} */(_.queryThrow('[itemprop="caption"]', item));

        img.src = src;
        img.dataset.imgZoomUrl = src;
        metaImage.content = src;
        // img.dataset.imgZoomUrl = src;
        // img.dataset.original = src;

        img.setAttribute('title', title);

        img.dataset.zoomTarget = `${cardI}`;

        img.alt = alt;
        metaCaption.content = alt;
        img.dataset.imgZoomDescr = description;

        return item;
    };

    /** @param {number} index */
    const createSliderCard = index => {
        const { images } = galleryItems[ index ];

        const item = _.createElementFromTemplate(references.sliderCard);
        const container = _.queryThrow('.mt-gallery_slider_card-container', item);

        item.classList.add(`mt-gallery_slider_card-${index}`);

        const cardImages = images.map((_, imageI) => createSliderCardItem(index, imageI));

        container.append(...cardImages);

        return { card: item, images: cardImages, container };
    };

    /** @param {number} index */
    const createGalleryBackgroundItem = index => {
        const item = _.createElementFromTemplate(references.galleryBackgroundItem);
        item.classList.add(`mt-gallery_slider_card-${index}`);

        return item;
    };

    const galleryElts = galleryItems.map((__, menuI) => {
        const menuItem = createMenuItem(menuI);
        const sliderCard = createSliderCard(menuI);
        const galleryBackgroundItem = createGalleryBackgroundItem(menuI);

        menu.append(menuItem.item);
        containers.slider.append(sliderCard.card);
        containers.galleryBackground.append(galleryBackgroundItem);

        return { menuItem, sliderCard, galleryBackgroundItem };
    });

    Object.values(references).forEach(ref => ref.remove());


    const elements = {
        gallery: { ...galleryElts, block: gallery },
        menu: {
            block: menu,
            menuItems: galleryElts.map(({ menuItem }) => menuItem),
            menuItemsTitles: galleryElts.map(({ menuItem }) => menuItem.title),
            menuItemsImages: galleryElts.map(({ menuItem }) => menuItem.img),
        },
        galleryTitle: {
            block: _.queryThrow('.mt-gallery_title'),
            titles: _.queryAllThrow('.mt-gallery_title_header'),
            descr: _.queryThrow('.mt-gallery_title-descr')
        },
        gallerySlider: {
            block: _.queryThrow('.mt-gallery_slider'),
            wrapper: _.queryThrow('.mt-gallery_slider-wrapper'),
            container: containers.slider,
            cards: galleryElts.map(({ sliderCard }) => sliderCard)
        },
        galleryBackground: {
            block: galleryBackground,
            container: containers.galleryBackground,
            items: galleryElts.map(({ galleryBackgroundItem }) => galleryBackgroundItem)
        }
    };

    return elements;
};



export { createGalleriesLayout };
