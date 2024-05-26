/**
 * @typedef {import("gsap").gsap} gsap
 */

gsap.registerPlugin(ScrollTrigger, Draggable);

/**
 * @typedef {Object} Eases
 * @property {gsap.EaseString | gsap.EaseFunction} [cardOpacity]
 * @property {gsap.EaseString | gsap.EaseFunction} [time]
 */


/**
 * @param {Object} params
 * @param {HTMLElement[]} params.cards
 * @param {Eases} [eases]
 */
const createGallerySlider = params => {
    const {
        cards
    } = params;


    /**
     * @type {Eases}
     */
    const eases = {
        cardOpacity: 'power1.in',
        time: 'power3.out',
        ...params.eases
    };

    // gets iterated when we scroll all the way to the end or start and wraps around
    // allows us to smoothly continue the playhead scrubbing in the correct direction.
    let iteration = 0;

    // set initial state of items
    gsap.set(cards, { xPercent: 400, opacity: 0, scale: 0 });

    const cardAnimationTime = {
        duration: 1, // duration of the card animation from x = 400% to -400%
        dtStagger: 0.1 // delta T (stagger) between each card animation
    };

    const snapTime = gsap.utils.snap(cardAnimationTime.dtStagger); // we'll use this to snapTime the playhead on the seamlessLoop


    /**
     * Builds a seamless loop animation.
     * @param {Object} options
     * @param {Array<HTMLElement>} options.items - The items to animate.
     * @param {number} options.dtStagger - The delta T (stagger) between each card animation.
     * @param {(element: HTMLElement) => gsap.core.Timeline} options.cardAnimation - The card animation for each item.
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
        const cardAnimationDuration = cardAnimation(items[ 0 ]).duration();

        // loop through 3 times so we can have an extra cycle at the start and end - we'll scrub the playhead only on the 2nd cycle
        items.concat(items).concat(items).forEach((_, i) => {
            let anim = cardAnimation(items[ i % items.length ]);
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
     * @param {HTMLElement} element
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
                { xPercent: 400 },
                { xPercent: -400, duration: cardAnimationTime.duration, ease: 'none', immediateRender: false },
                0
            );

        return tl;
    };


    const seamlessLoop = buildSeamlessLoop(cards, cardAnimationTime.dtStagger, animateCard);

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

    const createScrollTrigger = () => {
        const state = {
            progress: 0,
            end: cards.length,
        };

        /**
         * @param {number} i
         */
        const scroll = (i) => {
            state.current = i;
        };

        const update = () => {
            if (state.current > cards.length - 1) {
                wrap(1, 2);
            } else if (state.current < 1 && state.direction < 0) {
                wrap(-1, state.end - 2);
            } else {
                scrub.vars.t = (iteration + state.progress) * seamlessLoop.duration();
                // to improve performance, we just invalidate and restart the same tween. No need for overwrites or creating a new tween on each update.
                scrub.invalidate().restart();
            }
        };

        return {
            end: state.end,
            scroll,
            update,
        };
    };

    const scrollTrigger = createScrollTrigger();

    // const scrollTrigger = ScrollTrigger.create({
    //     start: 0,
    //     onUpdate: self => {
    //         const scroll = self.scroll();

    //         if (scroll > self.end - 1) {
    //             wrap(1, 2);
    //         } else if (scroll < 1 && self.direction < 0) {
    //             wrap(-1, self.end - 2);
    //         } else {
    //             scrub.vars.offset = (iteration + self.progress) * seamlessLoop.duration();
    //             // to improve performance, we just invalidate and restart the same tween. No need for overwrites or creating a new tween on each update.
    //             scrub.invalidate().restart();
    //         }
    //     },
    //     end: `+=${cards.length * scrollOneCardHeight}`,
    //     pin: pinnedContainer
    // });


    // converts a progress value (0-1, but could go outside those bounds when wrapping) into a 'safe' scroll value
    // that's at least 1 away from the start or end because we reserve those for sensing when the user scrolls ALL the way up or down, to wrap.
    /**
     * @param {number} progress
     */
    const progressToScroll = progress => gsap.utils.clamp(1, scrollTrigger.end - 1, gsap.utils.wrap(0, 1, progress) * scrollTrigger.end);

    /**
     * @param {number} iterationDelta
     * @param {number} scrollTo
     */
    const wrap = (iterationDelta, scrollTo) => {
        iteration += iterationDelta;
        scrollTrigger.scroll(scrollTo);
        scrollTrigger.update(); // by default, when we trigger.scroll(), it waits 1 tick to update().
    };


    // feed in an offset (like a time on the seamlessLoop timeline, but it can exceed 0 and duration() in either direction;it'll wrap)
    // and it'll set the scroll position accordingly. That'll call the onUpdate() on the trigger if there's a change.
    /**
     * @param {number} t
     */
    const scrollToTime = t => {
        // moves the scroll playhead to the place that corresponds to the totalTime value of the seamlessLoop, and wraps if necessary.
        const snappedTime = snapTime(t);
        const progress = (snappedTime - seamlessLoop.duration() * iteration) / seamlessLoop.duration();
        const scroll = progressToScroll(progress);

        if (progress >= 1 || progress < 0) {
            return wrap(Math.floor(progress), scroll);
        }

        scrollTrigger.scroll(scroll);
    };

    /**
     * Moves the scrub to a specific time.
     * @param {number} t - The time to move the scrub to.
     */
    const moveScrubTo = t => {
        scrub.vars.t = t;
        scrub.invalidate().restart();
    };


    const goTo = (index) => {
        moveScrubTo(scrub.vars.t + index * dtStagger);
    };

    const next = () => {
        moveScrubTo(scrub.vars.t + dtStagger);
    };

    const prev = () => {
        moveScrubTo(scrub.vars.t - dtStagger);
    };

    return { goTo, next, prev };
};
