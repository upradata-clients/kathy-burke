// @ts-check


/**
 * @typedef {import("gsap")} gsap
 */


/** @type {typeof import('../underscore.js')._} */
const _ = /** @type {any} */ (window)._;


/**
 * An array that holds the categories for the gallery.
 * @typedef {{ name: string; imagesRecids: string[];}[]} GalleryCategories
 */



/** @typedef {{ images: HTMLElement[]; wrapper: HTMLElement; block: HTMLElement; }} CategoryElements} */



/**
 * @param {GalleryCategories} galleryCategories
 */
const createGalleriesLayout = galleryCategories => {

    // we move all images to first images block
    const imagesBlocksPerCategory = galleryCategories.map(({ imagesRecids }) => [ ...imagesRecids.map(_.getElementFromRecid) ]);


    /**
     * 
     * @param {HTMLElement[]} blocks 
     * @param {number} categoryI 
     * @returns {CategoryElements}
     */
    const mergeItemsInFirstBlockOfCategory = (blocks, categoryI) => {

        const block = blocks[ 0 ];
        const wrapper = _.queryThrow('.t156__wrapper', block);

        const images = blocks.flatMap((block, i) => {
            const images = _.toArray('.t156__item', block);

            if (i === 0) {
                block.setAttribute('class', `gallery gallery-${categoryI} card r t-rec`);
                [ ...wrapper.children ].filter(el => el.innerHTML === '').forEach(el => el.remove());
            } else {
                wrapper.append(...images);
                block.remove();
            }

            images.forEach(image => {
                image.dataset.lazyRule = 'skip'; // optimoff
            });

            return images;
        });


        return { images, wrapper, block };
    };



    /**
     * @param {CategoryElements[]} elementsPerCategory 
     * @returns {{ cardsBlock: HTMLElement; cardsWrapper: HTMLElement; galleryBackground: HTMLElement; }}
     */
    const createCardsContainer = elementsPerCategory => {

        const firstCategory = elementsPerCategory[ 0 ];

        firstCategory.block.insertAdjacentHTML(
            'beforebegin',
            '<div id="cards" class="cards"><div class="cards__wrapper"></div></div>'
        );

        const cardsBlock = _.queryThrow('#cards');
        const cardsWrapper = _.queryThrow('.cards__wrapper', cardsBlock);

        cardsWrapper.insertAdjacentHTML(
            'afterbegin',
            '<div class="slider-wrapper"></div>'
        );

        const sliderWrapper = _.queryThrow('.slider-wrapper', cardsWrapper);

        // we move all images blocks (each block is a category) to the cards wrapper
        sliderWrapper.replaceChildren(...elementsPerCategory.map(({ block }) => block));

        // we create a skeleton block
        const galleryBackground = /** @type {HTMLElement} */(firstCategory.block.cloneNode(true));

        galleryBackground.removeAttribute('id');
        galleryBackground.className = 'gallery-background';

        // we remove all item contents from the skeleton
        [ ...galleryBackground.querySelectorAll('.t156__item') ].forEach(el => el.replaceChildren());

        cardsBlock.append(galleryBackground);

        return { cardsBlock, cardsWrapper, galleryBackground };
    };

    const elementsPerCategory = imagesBlocksPerCategory.map(mergeItemsInFirstBlockOfCategory);

    return {
        ...createCardsContainer(elementsPerCategory),
        elementsPerCategory,
        imagesPerCategory: elementsPerCategory.map(c => c.images),
        allImages: elementsPerCategory.flatMap(c => c.images),
        cards: elementsPerCategory.map(c => c.block)
    };
};

/** @param {GalleryCategories} galleryCategories */
const createElements = galleryCategories => {

    const menuContainer = _.queryThrow('.uc-gallery-menu .t959__container');
    const menuItems = _.queryAllThrow('.t959__card', menuContainer);
    const menuItemsTitles = menuItems.map(m => _.queryThrow('.t-card__title', m));

    const galleryTitle = _.queryThrow('.uc-gallery-title');
    const galleryTitleHeader = _.queryThrow('.t030__title', galleryTitle);


    const cards = _.queryAllThrow('.card');

    const elementsPerCategory = cards.map(card => ({
        block: card,
        wrapper: _.queryThrow('.t156__wrapper', card),
        images: _.queryAllThrow('.t156__item', card)
    }));

    return {
        menuContainer,
        menuItems,
        menuItemsTitles,
        galleryTitle,
        galleryTitleHeader,
        elementsPerCategory: cards.map(card => ({
            block: card,
            wrapper: _.queryThrow('.t156__wrapper', card),
            images: _.queryAllThrow('.t156__item', card)
        })),
        imagesPerCategory: elementsPerCategory.map(c => c.images),
        allImages: elementsPerCategory.flatMap(c => c.images),
        cards,
        cardsBlock: _.queryThrow('#cards'),
        cardsWrapper: _.queryThrow('#cards .cards__wrapper'),
        galleryBackground: _.queryThrow('.gallery-background')
    };
};

/**
 * @typedef {ReturnType<typeof createElements>} Elements
 */


export { createElements };
