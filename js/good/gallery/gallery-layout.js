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



/** @typedef {{ images: HTMLElement[]; wrapper: HTMLElement; block: HTMLElement; } CategoryElements} */


/**
 * @param {HTMLElement} element
 * @param {HTMLElement} parent 
 */
const centerPositionedElement = (element, parent) => {
    // element is absolutely positioned relative to the parent, we need to center it
    const { width: parentWidth } = _.getRect(parent);
    const { width: itemWidth } = _.getRect(element);

    const left = (parentWidth - itemWidth) / 2;
    gsap.set(element, { left });
};


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
                block.setAttribute('class', `gallery gallery-${categoryI} card`);
                [ ...wrapper.children ].filter(el => el.innerHTML === '').forEach(el => el.remove());
            } else {
                wrapper.append(...images);
                block.remove();
            }

            return images;
        });


        return { images, wrapper, block };
    };



    /**
     * @param {CategoryElements[]} elementsPerCategory 
     * @returns {{ cardsBlock: HTMLElement; cardsWrapper: HTMLElement; }}
     */
    const createCardsContainer = elementsPerCategory => {

        const firstCategory = elementsPerCategory[ 0 ];

        firstCategory.block.insertAdjacentHTML(
            'beforebegin',
            '<div id="cards" class="cards"><div class="cards__wrapper"></div></div>'
        );

        const cardsBlock = _.queryThrow('#cards');

        const cardsWrapper = _.queryThrow('.cards__wrapper', cardsBlock);

        // we move all images blocks (each block is a category) to the cards wrapper
        cardsWrapper.replaceChildren(...elementsPerCategory.map(({ block }) => block));


        // we create a skeleton block
        const skeletonBlock = /** @type {HTMLElement} */(firstCategory.block.cloneNode(true));

        skeletonBlock.id = 'gallery-skeleton';
        skeletonBlock.className = 'gallery-skeleton';

        // we remove all item contents from the skeleton
        [ ...skeletonBlock.querySelectorAll('.t156__item') ].forEach(el => el.replaceChildren());

        // we insert the skeleton block before the first category block
        firstCategory.block.before(skeletonBlock);

        // as the cards are absolutely positioned relative to the cards wrapper, we need to center them
        elementsPerCategory.map(({ block }) => centerPositionedElement(block, cardsWrapper));


        return { cardsBlock, cardsWrapper };
    };

    const elementsPerCategory = imagesBlocksPerCategory.map(mergeItemsInFirstBlockOfCategory);

    const { cardsBlock, cardsWrapper } = createCardsContainer(elementsPerCategory);


    return {
        cardsBlock,
        cardsWrapper,
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

    return {
        menuContainer,
        menuItems,
        menuItemsTitles,
        galleryTitle,
        galleryTitleHeader,
        ...createGalleriesLayout(galleryCategories)
    };
};

/**
 * @typedef {ReturnType<typeof createElements>} Elements
 */


export { createElements };
