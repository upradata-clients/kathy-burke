// @ts-check

const addMenuHinter = () => {

    const container = document.querySelector('#rec747864295 .t959__container');
    const items = [ ...container.querySelectorAll('.t959__card') ];


    container.querySelector('.t959__card-overlay').setAttribute('style', '');

    items.forEach(item => {
        container.append(item);
        item.classList.remove('t959__card_25');
    });

    items[ 0 ].insertAdjacentHTML('beforeend', `
        <div class="card--hint">
            <span class="hinter"></span>
            <span class="hinter"></span>
            <span class="hinter"></span>
        </div>
    `.trim());


    [ ...container.querySelectorAll('.t959__row') ].forEach(el => el.remove());

    // menu cards appear animation
    gsap.from(items, {
        scrollTrigger: {
            // markers: true,
            trigger: container,
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


    const onHover = (el, callbacks) => {
        if (callbacks.enter)
            el.addEventListener('pointerenter', callbacks.enter);
        if (callbacks.leave)
            el.addEventListener('pointerleave', callbacks.leave);
    };

    const hinter = items[ 0 ].querySelector('.card--hint');
    const hinters = [ ...hinter.querySelectorAll('.card--hint .hinter') ];

    /** @param {number} i */
    const goTo = i => {
        const itemHovered = items[ i ];

        const state = Flip.getState(hinters, { props: 'opacity' });

        itemHovered.append(hinter);
        gsap.set(hinters, { opacity: 1 });

        Flip.from(state, { duration: 0.5, ease: 'expo.inOut', stagger: 0.1, overwrite: true });
    };

    const addHoverAnimation = () => {

        let isActive = false;

        onHover(container, {
            enter: () => { isActive = true; },
            leave: () => {
                isActive = false;
                gsap.to(hinters, { opacity: 0, duration: 0.2, ease: 'power4.out', stagger: 0.04, overwrite: true });
            },
        });


        items.forEach((item, i) => onHover(item, { enter: () => goTo(i) }));
    };


    addHoverAnimation();

    return { goTo };
};


export { addMenuHinter };
