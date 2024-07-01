// @ts-check


const initGalleryMenu = () => {

    const galleryMenuBlock = _.queryThrow('#rec747864295');

    const galleryMenuContainer = _.queryThrow('.t959__container', galleryMenuBlock);
    const galleryMenuCards = _.queryAllThrow('.t959__card', galleryMenuContainer);


    _.queryThrow('.t959__card-overlay', galleryMenuContainer).setAttribute('style', '');

    galleryMenuCards.forEach(item => {
        galleryMenuContainer.append(item);
        item.classList.remove('t959__card_25');
    });

    galleryMenuCards[ 0 ].insertAdjacentHTML('beforeend', `
        <div class="card--hint">
            <span class="hinter"></span>
            <span class="hinter"></span>
            <span class="hinter"></span>
        </div>
    `.trim());


    _.queryAllThrow('.t959__row', galleryMenuContainer).forEach(el => el.remove());

    const hinter = _.queryThrow('.card--hint', galleryMenuCards[ 0 ]);
    const hinterItems = _.queryAllThrow('.card--hint .hinter', galleryMenuCards[ 0 ]);


    /** @param {number} i */
    const hinterGoTo = i => {
        const itemHovered = galleryMenuCards[ i ];

        const state = Flip.getState(hinterItems, { props: 'opacity' });

        itemHovered.append(hinter);
        gsap.set(hinterItems, { opacity: 1 });

        Flip.from(state, { duration: 0.5, ease: 'expo.inOut', stagger: 0.1, overwrite: true });
    };


    return {
        galleryMenuBlock,
        galleryMenuContainer,
        galleryMenuCards,
        hinter,
        hinterItems,
        hinterGoTo
    };
};



/** @typedef {ReturnType<typeof initGalleryMenu>} GalleryMenu2 */


/** @param {GalleryMenu2} params */
const addMenuAppareanceAnimation = ({ galleryMenuCards, galleryMenuContainer }) => {

    // menu cards appear animation
    gsap.from(galleryMenuCards, {
        scrollTrigger: {
            // markers: true,
            trigger: galleryMenuContainer,
            toggleActions: 'play none none reverse',
            start: 'center bottom'
        },
        opacity: 0,
        scale: 0.3,
        x: 200,
        y: 50,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power4.out'
    });
};




/** @param {GalleryMenu2} params */
const addMenuOnHover = ({ galleryMenuCards, galleryMenuContainer, hinterGoTo, hinterItems }) => {

    /**
     * @param {HTMLElement} el
     * @param {{ enter?: (this: HTMLElement, ev: PointerEvent) => any, leave?: (this: HTMLElement, ev: PointerEvent) => any }} callbacks
     */
    const onHover = (el, callbacks) => {
        if (callbacks.enter)
            el.addEventListener('pointerenter', callbacks.enter);
        if (callbacks.leave)
            el.addEventListener('pointerleave', callbacks.leave);
    };


    let isActive = false;

    onHover(galleryMenuContainer, {
        enter: () => { isActive = true; },
        leave: () => {
            isActive = false;
            gsap.to(hinterItems, { opacity: 0, duration: 0.2, ease: 'power4.out', stagger: 0.04, overwrite: true });
        },
    });


    galleryMenuCards.forEach((item, i) => onHover(item, { enter: () => hinterGoTo(i) }));

};




export { addMenuAppareanceAnimation, addMenuOnHover, initGalleryMenu };
