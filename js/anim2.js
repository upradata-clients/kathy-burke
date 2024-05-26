// https://gsap.com/community/forums/topic/40555-coverflow-style-z-indexing-using-horizontalloop/
// https://codepen.io/GreenSock/pen/RwKwLWK

/**
 * @typedef {import("gsap").gsap} gsap
 */

gsap.registerPlugin(ScrollTrigger, Draggable);

/**
 * @param {Object} options
 * @param {HTMLElement} options.cardsContainer
 * @param {HTMLElement[]} options.cards
 * @param {HTMLElement} options.pinnedContainer
 */
const createGallerySlider = ({ cardsContainer, cards, pinnedContainer }) => {

    let iteration = 0; // gets iterated when we scroll all the way to the end or start and wraps around - allows us to smoothly continue the playhead scrubbing in the correct direction.

    // set initial state of items
    gsap.set(cards, { xPercent: 400, opacity: 0, scale: 0 });

    const spacing = 0.1; // spacing of the cards (stagger)
    const snapTime = gsap.utils.snap(spacing); // we'll use this to snapTime the playhead on the seamlessLoop
    // const cards = gsap.utils.toArray('.cards');



    /**
     * Builds a seamless loop animation.
     * @param {Array<HTMLElement>} items - The items to animate.
     * @param {number} spacing - The spacing between each item.
     * @param {(element: HTMLElement) => gsap.core.Timeline} animateFunc - The function that animates each item.
     */
    const buildSeamlessLoop = (items, spacing, animateFunc) => {
        // this is where all the 'real' animations live

        const rawSequence = gsap.timeline({ paused: true });

        // this merely scrubs the playhead of the rawSequence so that it appears to seamlessly loop
        const seamlessLoop = gsap.timeline({
            paused: true,
            repeat: -1, // to accommodate infinite scrolling/looping
            onRepeat() { // works around a super rare edge case bug that's fixed GSAP 3.6.1
                this._time === this._dur && (this._tTime += this._dur - 0.01);
            },
            onReverseComplete() {
                this.totalTime(this.rawTime() + this.duration() * 100); // seamless looping backwards
            }
        });

        const cycleDuration = spacing * items.length;
        // the duration of just one animateFunc() (we'll populate it in the .forEach() below...
        let dur;

        // loop through 3 times so we can have an extra cycle at the start and end - we'll scrub the playhead only on the 2nd cycle
        items.concat(items).concat(items).forEach((_, i) => {
            let anim = animateFunc(items[ i % items.length ]);
            rawSequence.add(anim, i * spacing);

            if (!dur)
                dur = anim.duration();
        });

        // animate the playhead linearly from the start of the 2nd cycle to its end (so we'll have one 'extra' cycle at the beginning and end)
        seamlessLoop.fromTo(rawSequence, {
            time: cycleDuration + dur / 2
        }, {
            time: '+=' + cycleDuration,
            duration: cycleDuration,
            ease: 'none'
        });

        return seamlessLoop;
    };


    // below is the dragging functionality (mobile-friendly too)...
    Draggable.create('.drag-proxy', {
        type: 'x',
        trigger: cardsContainer,
        onPress() {
            this.startOffset = scrub.vars.offset;
        },
        onDrag() {
            scrub.vars.offset = this.startOffset + (this.startX - this.x) * 0.001;
            scrub.invalidate().restart(); // same thing as we do in the ScrollTrigger's onUpdate
        },
        onDragEnd() {
            scrollToOffset(scrub.vars.offset);
        }
    });




    // this function will get called for each element in the buildSeamlessLoop() function,
    // and we just need to return an animation that'll get inserted into a master timeline, spaced
    /**
     * @param {HTMLElement} element
     */
    const animateNewCard = element => {

        const tl = gsap.timeline();

        tl
            .fromTo(element,
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: 'power1.in', immediateRender: false }
            )
            .fromTo(element,
                { xPercent: 400 },
                { xPercent: -400, duration: 1, ease: 'none', immediateRender: false },
                0
            );

        return tl;
    };


    const seamlessLoop = buildSeamlessLoop(cards, spacing, animateNewCard);

    // a proxy object we use to simulate the playhead position, but it can go infinitely in either direction and
    // we'll just use an onUpdate to convert it to the corresponding time on the seamlessLoop timeline.
    const playhead = { offset: 0 };

    // feed in any offset (time) and it'll return the corresponding wrapped time (a safe value between 0 and the seamlessLoop's duration)
    const wrapTime = gsap.utils.wrap(0, seamlessLoop.duration());

    // we reuse this tween to smoothly scrub the playhead on the seamlessLoop
    const scrub = gsap.to(playhead, {
        offset: 0,
        onUpdate() {
            seamlessLoop.time(wrapTime(playhead.offset)); // convert the offset to a 'safe' corresponding time on the seamlessLoop timeline
        },
        duration: 0.5,
        ease: 'power3',
        paused: true
    });



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
     * @param {number} offset
     */
    const scrollToOffset = offset => {
        // moves the scroll playhead to the place that corresponds to the totalTime value of the seamlessLoop, and wraps if necessary.
        const snappedTime = snapTime(offset);
        const progress = (snappedTime - seamlessLoop.duration() * iteration) / seamlessLoop.duration();
        const scroll = progressToScroll(progress);

        if (progress >= 1 || progress < 0) {
            return wrap(Math.floor(progress), scroll);
        }

        scrollTrigger.scroll(scroll);
    };


    const scrollTrigger = ScrollTrigger.create({
        start: 0,
        onUpdate: self => {
            const scroll = self.scroll();

            if (scroll > self.end - 1) {
                wrap(1, 2);
            } else if (scroll < 1 && self.direction < 0) {
                wrap(-1, self.end - 2);
            } else {
                scrub.vars.offset = (iteration + self.progress) * seamlessLoop.duration();
                // to improve performance, we just invalidate and restart the same tween. No need for overwrites or creating a new tween on each update.
                scrub.invalidate().restart();
            }
        },
        end: '+=3000', // to changer with the number of cards * width of the card (I think)
        pin: pinnedContainer
    });



    // when the user stops scrolling, snap to the closest item.
    ScrollTrigger.addEventListener('scrollEnd', () => scrollToOffset(scrub.vars.offset));

    document.querySelector('.next').addEventListener('click', () => scrollToOffset(scrub.vars.offset + spacing));
    document.querySelector('.prev').addEventListener('click', () => scrollToOffset(scrub.vars.offset - spacing));




    // if you want a more efficient timeline, but it's a bit more complex to follow the code, use this function instead...
    // function buildSeamlessLoop(items, spacing, animateFunc) {
    //  let overlap = Math.ceil(1 / spacing), // number of EXTRA animations on either side of the start/end to accommodate the seamless looping
    //    startTime = items.length * spacing + 0.5, // the time on the rawSequence at which we'll start the seamless loop
    //    loopTime = (items.length + overlap) * spacing + 1, // the spot at the end where we loop back to the startTime
    //    rawSequence = gsap.timeline({paused: true}), // this is where all the 'real' animations live
    //    seamlessLoop = gsap.timeline({ // this merely scrubs the playhead of the rawSequence so that it appears to seamlessly loop
    //      paused: true,
    //      repeat: -1, // to accommodate infinite scrolling/looping
    //      onRepeat() { // works around a super rare edge case bug that's fixed GSAP 3.6.1
    //        this._time === this._dur && (this._tTime += this._dur - 0.01);
    //      }
    //    }),
    //    l = items.length + overlap * 2,
    //    time, i, index;
    //
    //  // now loop through and create all the animations in a staggered fashion. Remember, we must create EXTRA animations at the end to accommodate the seamless looping.
    //  for (i = 0; i < l; i++) {
    //    index = i % items.length;
    //    time = i * spacing;
    //    rawSequence.add(animateFunc(items[index]), time);
    //    i <= items.length && seamlessLoop.add('label' + i, time); // we don't really need these, but if you wanted to jump to key spots using labels, here ya go.
    //  }
    //
    //  // here's where we set up the scrubbing of the playhead to make it appear seamless.
    //  rawSequence.time(startTime);
    //  seamlessLoop.to(rawSequence, {
    //    time: loopTime,
    //    duration: loopTime - startTime,
    //    ease: 'none'
    //  }).fromTo(rawSequence, {time: overlap * spacing + 1}, {
    //    time: startTime,
    //    duration: startTime - (overlap * spacing + 1),
    //    immediateRender: false,
    //    ease: 'none'
    //  });
    //  return seamlessLoop;
    // }

};
