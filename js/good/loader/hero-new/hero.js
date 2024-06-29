// @ts-check


_.EventNames.hero = {
    firstScrubDone: 'hero:first-scrub-done'
};

const heroBlock = _.queryThrow('.uc-hero-block');
const heroBlockImg = _.queryThrow('.uc-hero-block-img');
const signatureBlock = _.queryThrow('.uc-signature');


const createHeroAnimation = async () => {

    signatureBlock.classList.remove('r_hidden', 'r_anim');
    heroBlockImg.classList.remove('r_hidden', 'r_anim');

    await _.svgImageToInline(_.queryThrow('img', heroBlock));
    await _.svgImageToInline(_.queryThrow('img', signatureBlock));


    heroBlock.classList.add('svg-active');
    heroBlockImg.classList.add('svg-active');

    heroBlock.append(signatureBlock);


    const tl = gsap.timeline();

    const apparitionTL = gsap.timeline();
    apparitionTL.to(signatureBlock, { opacity: 1, duration: 1, ease: 'expo.out' });

    const signaturePaths = /** @type {SVGPathElement[]} */ (/** @type {unknown} */(_.queryAllThrow('svg path', signatureBlock)));

    const drawTl = gsap.timeline({ paused: true });
    const duration = 2;

    const getLength = DrawSVGPlugin.getLength;
    /** @param {gsap.DrawSVGTarget} path */
    const getProportion = path => getLength(path) / totalLength;

    const totalLength = signaturePaths.reduce((total, path) => total + getLength(path), 0);

    signaturePaths.forEach(path => drawTl.from(path, { duration: getProportion(path) * duration, drawSVG: 0 }));


    tl.add(apparitionTL);

    tl.to(drawTl, {
        time: drawTl.duration(),
        duration: drawTl.duration(),
        ease: 'power1.inOut'
    }, 0.5);
};

const createHeroToImagePinAnimation = () => {

    const heroContainer = _.queryThrow('.t107', heroBlock);

    const notreDame = _.queryThrow('.uc-notre-dame-block');
    const notreDameTitle = _.queryThrow('.uc-nd-title-block h3');

    // notreDameTitle.classList.add('hand-font');

    notreDame.append(notreDameTitle);

    heroBlock.append(notreDame);

    const centralPainting = _.queryThrow('#painting-5', heroContainer);

    let isScrubHasLeft = false;


    const tlScrub = gsap.timeline({
        scrollTrigger: {
            onLeave: () => {
                if (!isScrubHasLeft) {
                    _.dispatchEvent(_.EventNames.hero.firstScrubDone);
                }

                isScrubHasLeft = true;
            },
            markers: false,
            trigger: heroBlock,
            scrub: 1,
            pin: heroBlock,
            toggleActions: 'restart complete reverse reset',
            start: 'top=50 top',
            end: 'bottom+=200% top'
        }
    });



    const heroRect = heroBlock.getBoundingClientRect();
    const paintingRect = centralPainting.getBoundingClientRect();


    gsap.set(notreDame, { autoAlpha: 0 });
    _.queryThrow('img', notreDame).dataset.lazyRule = 'skip'; // optimoff

    const notreDameImgCopy = /** @type {HTMLImageElement} */(_.queryThrow('img', notreDame).cloneNode(true));


    const setNotreDameImgCopyPosition = () => {
        const paintingRect = centralPainting.getBoundingClientRect();

        gsap.set(notreDameImgCopy, {
            position: 'absolute',
            top: window.scrollY + paintingRect.top,
            left: window.scrollX + paintingRect.left,
            width: paintingRect.width,
            height: paintingRect.height
        });
    };

    setNotreDameImgCopyPosition();
    gsap.set(notreDameImgCopy, { opacity: 0 });


    heroContainer.append(notreDameImgCopy);


    /**
     * @param {number} a
     */
    const half = a => a / 2;

    const delta = {
        x: half(heroRect.width - paintingRect.width) / heroRect.width,
        y: half(heroRect.height - paintingRect.height) / heroRect.height,
    };


    tlScrub.to(signatureBlock, { opacity: 0, duration: 0.5, ease: 'expo.out' });


    const scale = {
        start: 0,
        duration: 1,
        value: 1.5
    };

    tlScrub.to(heroContainer, {
        transformOrigin: `${50 - delta.x}% ${50 - delta.y}%`,
        scale: scale.value,
        ease: 'power2.inOut',
        duration: scale.duration,
    }, scale.start);

    tlScrub.to(notreDameImgCopy, {
        opacity: 1,
        ease: 'power2.inOut',
        duration: 0.6
    }, 0.2);


    tlScrub.to(centralPainting, {
        opacity: 0,
        ease: 'power2.inOut',
        duration: 0.6,
    }, 0.2);


    // because of a bug with scrollTrigger when page loads when scrollTrigger is not 0
    let notreDameSizeState = undefined;

    /** @param {string} prop */
    const getNotreDamePosition = prop => () => {
        const rect = notreDameImgCopy.getBoundingClientRect();

        const scrollTrigger = /** @type {ScrollTrigger} */(tlScrub.scrollTrigger);
        const progress = gsap.utils.clamp(0, 1, scrollTrigger.progress / (scale.duration - scale.start));

        if (notreDameSizeState === undefined) {
            notreDameSizeState = {
                top: window.scrollY + rect.top,
                left: window.scrollX + rect.left,
                width: rect.width,
                height: rect.height,
                progress
            };
        }

        return notreDameSizeState[ prop ];
    };


    tlScrub.set(notreDame, {
        top: getNotreDamePosition('top'),
        left: getNotreDamePosition('left'),
        width: getNotreDamePosition('width'),
        height: getNotreDamePosition('height'),
        autoAlpha: 1
    }, 1);

    tlScrub.to(notreDame, {
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        ease: 'expo.in',
        duration: 1
    }, '+=0.01');

    tlScrub.to(notreDameTitle, { opacity: 1, duration: 0.4, ease: 'expo.out' }, "+=0.4");
    tlScrub.to(notreDame, { duration: 1 });

};



_.onMultipleEvents([
    _.EventNames.ready.gsap,
    _.EventNames.ready.document
], async () => {
    await createHeroAnimation();
    createHeroToImagePinAnimation();
}, { isCold: true });
