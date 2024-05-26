/**
 * @typedef {import("gsap").gsap} gsap
 */


/**
 * @param {Object} params
 * @param {HTMLElement[]} params.items
 * @param {HTMLElement} [params.elementToListenTheMouse]
 * @param {number} [params.duration]
 * @param {gsap.EaseString | gsap.EaseFunction} [params.rotationEase]
 * @param {Partial<Record<'x'|'y', gasp.EaseString | ((progress: number, i:number) => number)>>} [params.mouseDistanceEase]
 * @param {{x: number; y: number}} [params.maxDistance]
 * @param {{x: number; y: number}} [params.maxRotation] 
 * @param {Partial<Record<'x'|'y', (distanceProgress: number, i:number) => number>>} [params.distanceProgressToRotationMap]
 * @returns {{start: () => void; stop: () => void}}
 */
const createCardMousePointerAnimation = (params) => {
    const {
        items,
        elementToListenTheMouse = document.documentElement,
        duration = 0.5,
        rotationEase = 'power2.out'
    } = params;


    const maxDistance = { x: 300, y: 300, ...params.maxDistance };
    const maxRotation = { x: 10, y: 10, ...params.maxRotation };

    /**
     * Creates a mouse distance easing function.
     * @returns {(axis: 'x'|'y') => (distance: number, i: number) => number}
     */
    const createMouseDistanceEasing = axis => {
        const paramEase = params.mouseDistanceEase?.[ axis ];

        if (typeof paramEase === 'function')
            return paramEase;

        const ease = gsap.parseEase(paramEase || 'power1.out');

        return distance => {
            const x = gsap.utils.clamp(-1, 1, distance);
            const easeX = ease(Math.abs(x));

            return x < 0 ? -easeX : easeX;
        };
    };

    /** @type {Record<'x'|'y', (distance: number) => number} */
    const mouseDistanceEaseFn = {
        x: createMouseDistanceEasing('x'),
        y: createMouseDistanceEasing('y')
    };

    /** @type {(axis: 'x'|'y') => (distanceProgress: number) => number} */
    const distanceProgressToRotationMapDefault = axis => distanceProgress => {
        return gsap.utils.mapRange(-1, 1, -maxRotation[ axis ], maxRotation[ axis ], distanceProgress);
    };

    const distanceProgressToRotationMap = {
        x: params.distanceProgressToRotationMap?.x || distanceProgressToRotationMapDefault('x'),
        y: params.distanceProgressToRotationMap?.y || distanceProgressToRotationMapDefault('y')
    };

    /** @type {(params: { axis: 'x'|'y'; item: HTMLElement; mousePosition: number; i:number }) => number} */
    const mouseToRotation = ({ axis, item, mousePosition, i }) => {

        const size = axis === 'x' ? 'width' : 'height';

        const rect = item.getBoundingClientRect();

        const X = rect[ axis ];
        const middle = X + rect[ size ] / 2;

        const easeX = mouseDistanceEaseFn[ axis ]((middle - mousePosition) / maxDistance[ axis ], i);
        return distanceProgressToRotationMap[ axis ](easeX, i);
    };

    /** @param {MouseEvent} event */
    const listener = ({ clientX: mouseX, clientY: mouseY }) => {
        gsap.to(items, {
            duration,
            rotationX: i => mouseToRotation({ axis: 'y', item: items[ i ], mousePosition: mouseY, i }),
            rotationY: i => -mouseToRotation({ axis: 'x', item: items[ i ], mousePosition: mouseX, i }),
            ease: rotationEase
        });
    };

    return {
        start: () => elementToListenTheMouse.addEventListener('mousemove', listener, { passive: true }),
        stop: () => elementToListenTheMouse.removeEventListener('mousemove', listener, { passive: true })
    };
};
