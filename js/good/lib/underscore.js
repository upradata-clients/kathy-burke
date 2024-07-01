// @ts-check

/** @param {() => void | Record<string, any>} fn */
const define = fn => {
    const newStuff = fn();

    if (newStuff) {
        // @ts-ignore
        globalThis._ = { ...(globalThis._ || {}), ...newStuff };
    }
};



const _ = { define };
/** @type {any} */(globalThis)._ = _;

// /** @typedef {typeof _} _ */

export { _ };
