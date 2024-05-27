// @ts-check


/**
 * @typedef {import("gsap").gsap}
 */

// gsap.registerPlugin(ScrollTrigger, Draggable);

/**
 * @typedef {Object} Eases
 * @property {gsap.EaseString | gsap.EaseFunction} [cardOpacity]
 * @property {gsap.EaseString | gsap.EaseFunction} [time]
 */


/**
 * @typedef {(data: { dtStagger: number; item: HTMLElement; index: number; }) => gsap.core.Timeline} CardAnimation
 */

/**
 * @param {Object} params
 * @param {HTMLElement[]} params.cards
 * @param {number} [params.xPercent]
 * @param {CardAnimation} [params.animateCard]
 * @param {Eases} [params.eases]
 */
const createGallerySlider = params => {
    const {
        cards,
        xPercent = 400
    } = params;


    /**
     * @type {Eases}
     */
    const eases = {
        cardOpacity: 'power1.in',
        time: 'power3.out',
        ...params.eases
    };

    // set initial state of items
    gsap.set(cards, { xPercent, opacity: 0, scale: 0 });

    const cardAnimationTime = {
        duration: 1, // duration of the card animation from x = xPercent% to -xPercent%
        dtStagger: 0.1 // delta T (stagger) between each card animation
    };

    /**
     * Builds a seamless loop animation.
     * @param {Object} options
     * @param {Array<HTMLElement>} options.items - The items to animate.
     * @param {number} options.dtStagger - The delta T (stagger) between each card animation.
     * @param {CardAnimation} options.cardAnimation - The card animation for each item.
     */
    const buildSeamlessLoop = ({ items, dtStagger, cardAnimation }) => {
        // this is where all the 'real' animations live

        const rawSequence = gsap.timeline({ paused: true });

        // this merely scrubs the playhead of the rawSequence so that it appears to seamlessly loop
        const seamlessLoop = gsap.timeline({
            paused: true,
            repeat: -1, // to accommodate infinite scrolling/looping
            onRepeat() {
                // works around a super rare edge case bug that's fixed GSAP 3.6.1
                this._time === this._dur && (this._tTime += this._dur - 0.01);
            },
            onReverseComplete() {
                this.totalTime(this.rawTime() + this.duration() * 100); // seamless looping backwards
            }
        });

        const cycleDuration = dtStagger * items.length;
        // the duration of just one animateFunc() (we'll populate it in the .forEach() below...
        const cardAnimationDuration = cardAnimation({ item: items[ 0 ], index: 0, dtStagger }).duration();

        // loop through 3 times so we can have an extra cycle at the start and end - we'll scrub the playhead only on the 2nd cycle
        items.concat(items).concat(items).forEach((_, i) => {
            const anim = cardAnimation({ item: items[ i % items.length ], index: i, dtStagger });
            rawSequence.add(anim, i * dtStagger);
        });

        // animate the playhead linearly from the start of the 2nd cycle to its end (so we'll have one 'extra' cycle at the beginning and end)
        seamlessLoop.fromTo(rawSequence, {
            time: cycleDuration + cardAnimationDuration / 2
        }, {
            time: `+=${cycleDuration}`,
            duration: cycleDuration,
            ease: 'none'
        });

        return seamlessLoop;
    };


    // this function will get called for each element in the buildSeamlessLoop() function,
    // and we just need to return an animation that'll get inserted into a master timeline, spaced
    /**
     * @type {CardAnimation}
     */
    const animateCard = element => {

        const tl = gsap.timeline();

        tl
            .fromTo(element,
                { scale: 0, opacity: 0 },
                {
                    scale: 1, opacity: 1, zIndex: 100,
                    duration: cardAnimationTime.duration / 2, yoyo: true, repeat: 1, ease: eases.cardOpacity, immediateRender: false
                }
            )
            .fromTo(element,
                { xPercent },
                {
                    xPercent: -xPercent,
                    duration: cardAnimationTime.duration, ease: 'none', immediateRender: false
                },
                0
            );

        return tl;
    };


    const seamlessLoop = buildSeamlessLoop({
        items: cards,
        dtStagger: cardAnimationTime.dtStagger,
        cardAnimation: params.animateCard || animateCard
    });

    // feed in any offset (time) and it'll return the corresponding wrapped time (a safe value between 0 and the seamlessLoop's duration)
    const wrapTime = gsap.utils.wrap(0, seamlessLoop.duration());


    // a proxy object we use to simulate the playhead position, but it can go infinitely in either direction and
    // we'll just use an onUpdate to convert it to the corresponding time on the seamlessLoop timeline.
    const playhead = { t: 0 };

    // we reuse this tween to smoothly scrub the playhead on the seamlessLoop
    const scrub = gsap.to(playhead, {
        t: 0,
        onUpdate() {
            // convert the offset to a 'safe' corresponding time on the seamlessLoop timeline
            seamlessLoop.time(wrapTime(playhead.t));
        },
        duration: cardAnimationTime.duration / 2,
        ease: eases.time,
        paused: true
    });


    /**
     * @template {gsap.core.Timeline | gsap.core.Tween} T
     * @param {T} timelineOrTween
     * @returns {Promise<void>}
     */
    const promisifyTimelineOrTween = timelineOrTween => new Promise(resolve => timelineOrTween.then(() => resolve()));


    /**
     * Moves the scrub to a specific time.
     * @param {number} t - The time to move the scrub to.
     */
    const moveScrubTo = t => {
        scrub.vars.t = t;
        return promisifyTimelineOrTween(scrub.invalidate().restart());
    };

    /**
     * Moves the scrub to a specific index.
     * @param {number} index - The index to move the scrub to.
     * @returns {Promise<void>}
     */
    const goTo = index => moveScrubTo(index * cardAnimationTime.dtStagger);

    const next = () => moveScrubTo(scrub.vars.t + cardAnimationTime.dtStagger);

    const prev = () => moveScrubTo(scrub.vars.t - cardAnimationTime.dtStagger);

    return { goTo, next, prev };
};


/** @typedef {ReturnType<typeof createGallerySlider>} GallerySlider */


const GallerySlider = {
    create: createGallerySlider
};

export { GallerySlider };
