const tildaZoomIsInited = () => {
    return new Promise((resolve, reject) => {
        
        if (document.querySelector('.t-zoomer__wrapper'))
            return resolve(undefined);

        const bodyChidlrenListener = new MutationObserver(mutations => {
            // 't-zoomer__wrapper'

            mutations.forEach(mutation => {
                if (mutation.type !== 'childList')
                    return false;

                const tildaZoomIsInited = [ ...mutation.addedNodes ].some(node => {
                    return node instanceof HTMLElement && node.classList.contains('t-zoomer__wrapper');
                });

                if (tildaZoomIsInited) {
                    resolve(undefined);
                }
            });

        });

        // to know when tilda zoom is inited, we need to listen to body children changes, because tilda zoom is inited after the page is loaded
        bodyChidlrenListener.observe(document.body, { childList: true, attributes: true });
    });
};



/**
 * 
 * @param {UnderScore} _ 
 */
const applyFixes = _ => {
    const w = /** @type {any} */ (window);

    // here we fix the fact that the zoomed gallery was not circular

    /**
     * @param {'next' | 'prev'} direction 
     */
    w.t_zoom_showSlide = function (direction) {
        const track = _.queryThrow('.t-carousel__zoomer__track');
        if (!(track instanceof HTMLElement)) return;

        const slides = Array.from(track.querySelectorAll('.t-carousel__zoomer__item')).filter(
            node => node instanceof HTMLElement
        );
        if (!slides.length) return;

        const activeSlide = slides.find(node => node.classList.contains('active')) ?? slides[ 0 ];
        let index = slides.findIndex(node => node === activeSlide);
        const hasCachedZoom = track.getAttribute('data-cached-zoom') === 'y';
        const zoomState = w.t_getZoomState();
        const isMobile = zoomState.isMobile;
        const hasLazy = zoomState.hasLazy;

        if (direction === 'next' || direction === 'prev') {
            // here is the FIX: we make the gallery circular by calculating the next index based on the direction and the current index, and then using modulo to wrap around if necessary
            const nextIndex = direction === 'next' ? index + 1 : slides.length + (index - 1);
            index = nextIndex % slides.length;
            track.setAttribute('data-on-transition', 'y');

            if (isMobile && getComputedStyle(track).transitionDuration === '0s' && !hasCachedZoom) {
                track.style.transition = '';
            }
        }

        const nextSlide = slides[ index ];
        const nextSlideOffsetLeft = nextSlide.offsetLeft;

        function onSlideReady() {
            nextSlide.classList.add('active');
            track.style.transform = `translateX(${-nextSlideOffsetLeft}px)`;
            w.t_zoom__hideInnactiveSlides(nextSlide, track);
            w.t_zoom_checkForScale();

            if (hasCachedZoom) {
                track.removeAttribute('data-cached-zoom');
                track.dispatchEvent(new Event('transitionend'));
            }

            if (hasLazy) {
                w.t_zoom__preloadNextSlide(nextSlide, track);
                w.t_onFuncLoad('t_lazyload_update', w.t_lazyload_update);

                const image = nextSlide.querySelector('img');
                if (image instanceof HTMLImageElement && !image.src) {
                    setTimeout(() => {
                        w.t_onFuncLoad('t_lazyload_update', w.t_lazyload_update);
                    }, 200);
                }
            }
        }

        activeSlide.classList.remove('active');

        if (isMobile) {
            onSlideReady();
            return;
        }

        activeSlide.addEventListener(
            'transitionend',
            event => {
                if (event.target === activeSlide) onSlideReady();
            },
            { once: true }
        );
    };




    const originalZoomScaleInit = w.t_zoom_scale_init;

    w.t_zoom_scale_init = () => {
        const zoomerWrapper = _.queryThrow('.t-zoomer__wrapper');

        if (zoomerWrapper.getAttribute('data-zoom-scale') === 'y')
            originalZoomScaleInit();
    };
};



export { tildaZoomIsInited, applyFixes };
