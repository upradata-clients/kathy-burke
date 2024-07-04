import { gsap } from 'gsap';

const tl = gsap.timeline()
    .to({ a: 1 }, { a: 2, duration: 1, delay: 0.5 }, 0.6)
    .to({ b: 1 }, { b: 2, duration: 2 });

console.log(tl.duration());
