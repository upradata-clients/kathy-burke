// @ts-check



/**
 * @template T
 * @typedef {T extends (...args: any[]) => infer R ? R : T} TweenVarsType
 */

/**
 * @template T
 * @typedef {{[ K in keyof T as string extends K ? never : number extends K ? never : symbol extends K ? never : K] : T[K]; }} RemoveIndex<T>
 */

/** 
 * @typedef {RemoveIndex<gsap.TweenVars>} TweenVars
 * @typedef {keyof TweenVars} TweenVarsKeys
 * 
 * @typedef {{[K in TweenVarsKeys]-?: gsap.FunctionBasedValue<any> extends TweenVars[K] ?  K extends `on${string}` ? never: K : never; }} TweenVarsWithFunctionBasedValue
 * 
 * @typedef {TweenVarsWithFunctionBasedValue[TweenVarsKeys]} TweenVarsKeysWithFunctionBasedValue
 */



/**
 * @typedef {Object} MatchMedia
 * @property {string | symbol | MatchMediaBreakpoint} media
 * @property {() => void} [cleanUp]
 */

/** @typedef {MatchMedia['media'] | MatchMedia} MatchMediaOption */


/**
 * @param {MatchMediaOption} media
 * @returns {media is MatchMedia}
 */
const isMatchMedia = media => typeof media === 'object' && 'media' in media;



/**
 * @template [T=TweenVars[TweenVarsKeysWithFunctionBasedValue]]
 * @typedef {Object} ConditionedTweenVarsFunctionBasedValue
 * @property {TweenVarsType<T> | gsap.FunctionBasedValue<TweenVarsType<T>>} value
 * @property {(index: number, target: gsap.TweenTarget, targets: gsap.TweenTarget[]) => boolean} [condition]
 * @property {ReadonlyListOrElement<MatchMediaOption>} [matchMedia]
 */


/**
 * @template {TweenVarsKeys} [K=TweenVarsKeysWithFunctionBasedValue]
 * @typedef {K extends TweenVarsKeysWithFunctionBasedValue ? ConditionedTweenVarsFunctionBasedValue<TweenVars[K]> : never } ConditionedTweenVar
 */

/**
 * @template {TweenVarsKeys} [K=TweenVarsKeys]
 * @typedef {TweenVars[K] | ReadonlyListOrElement<ConditionedTweenVar<K>>} PossiblyConditionedTweenVar
 */


/**
 * @typedef {{ [K in TweenVarsKeys]?: PossiblyConditionedTweenVar<K> }} _PossiblyConditionedTweenVars
 * @typedef {ReadonlyListOrElement<{ media: ReadonlyListOrElement<MatchMediaOption> } & _PossiblyConditionedTweenVars> } _PossiblyConditionedTweenVarsMM
 * @typedef {_PossiblyConditionedTweenVars & { matchMedia?: _PossiblyConditionedTweenVarsMM }} PossiblyConditionedTweenVars
 */


/**
 * @param {PossiblyConditionedTweenVar} v
 * @returns {v is ConditionedTweenVar}
 */
const isConditionedTweenVar = v => typeof v === 'object' && 'value' in v;


/**
 * @template {Record<string, gsap.TweenTarget>} T
 * @typedef {(keyof T) & string | gsap.core.Timeline | gsap.core.Tween | object} AddToTimelineTarget
 */

/**
 * @template {readonly any[]} Elts
 * @typedef {Object} _Timelines
 * @property {gsap.EaseString | gsap.EaseFunction} [ease];
 * @property {(params: { element: InferArray<Elts>; index: number; globalTimeline: gsap.core.Timeline; }) => AddToTimelineOptions} createAnimation;
 * @property {Elts} elements
 */

/**
 * @template {readonly any[]} Elts
 * @typedef {CreateTimelinesOptions & _Timelines<Elts>} Timelines
 */

/**

 * @template {readonly any[]} Elts
 * @typedef {Object} _AddToTimelineOption
 
 * @property {gsap.Position} [start]
 * @property {number} [duration]
 * @property {gsap.core.Timeline} [timeline]
 * @property {Timelines<Elts>} [timelines] 
 * @property {AddToTimelineTarget<{}>} [target]
 * @property {() => boolean} [condition]
 * @property {(index: number, target: gsap.TweenTarget, targets: gsap.TweenTarget[]) => boolean} [propCondition]
 * @property {Record<string, MatchMedia['media']>} [matchMediaDefinitions]
 * @property {ReadonlyListOrElement<MatchMediaOption>} [matchMedia]
 */


/**
 * @typedef {Object} _AddToTimelineOptionActions
 * 
 * @property {PossiblyConditionedTweenVars} [from]
 * @property {PossiblyConditionedTweenVars} [to]
 * @property {PossiblyConditionedTweenVars} [set]
 * @property {Record<'from' | 'to', PossiblyConditionedTweenVars>} [fromTo]
 */


/**
 * @template {readonly any[]} [Elts=readonly any[]]
 * @typedef {_AddToTimelineOption<Elts> & _AddToTimelineOptionActions } AddToTimelineOption
 */

/**
 * @template {readonly any[]} [Elts=readonly any[]]
 * @typedef {ReadonlyListOrElement<AddToTimelineOption<Elts>>} AddToTimelineOptions
 */

/**
 * @template {ReadonlyListOrElement<any>} T
 * @param {T} v
 * @returns {T extends ReadonlyListOrElement<infer U> ? U[] : never}
 */
const ensureArray = v => {
    // @ts-ignore
    return Array.isArray(v) ? v : [ v ];
};



/**
 * @template T
 * @template {readonly T[]} Elts
 * @param {readonly AddToTimelineOption<Elts>[]} listOfOptions
 */
const addToTimeline = (...listOfOptions) => {

    /**
     * @param {gsap.core.Timeline} timeline
     * @param {gsap.core.Timeline | gsap.core.Tween} tl
     * @param {gsap.Position | undefined} start
     * @param {gsap.TweenVars | undefined} options
     */
    const addTimeline = (timeline, tl, start, options) => {
        timeline.add(tl, start);

        const opts = Object.entries(options || {}).reduce((opts, [ k, v ]) => typeof v === 'undefined' ? opts : { ...opts, [ k ]: v }, {});

        if (Object.keys(opts).length === 0)
            return timeline;

        tl.paused(true);
        return timeline.to(tl, opts, start);
    };

    const MATCH_MEDIA_ALL = Symbol('MATCH_MEDIA_ALL');

    /**
     * @param {Record<string, MatchMedia['media']> | undefined} matchMediaDefinitions
     * @param {MatchMedia['media']} matchMedia
     */
    const getMatchMedia = (matchMediaDefinitions, matchMedia) => {
        const media = typeof matchMedia === 'string' ? matchMediaDefinitions?.[ matchMedia ] : matchMedia;

        if (!media)
            throw new Error('media is not defined');

        if (typeof media === 'string' || typeof media === 'symbol')
            return media;

        const { min, max } = media;

        if (min && max === undefined)
            return `(min-width: ${min}px)`;

        if (max && min === undefined)
            return `(max-width: ${max}px)`;

        return `(min-width: ${min}px) and (max-width: ${max}px)`;
    };

    /** @param {ConditionedTweenVarsFunctionBasedValue['matchMedia']} matchMedia */
    const getMatchMedias = matchMedia => {
        if (!matchMedia)
            return [];

        /** @type {readonly MatchMediaOption[]} */
        const matchMedias = ensureArray(matchMedia);

        return matchMedias.map(matchM => {
            if (typeof matchM === 'string')
                return { media: matchM };

            if (isMatchMedia(matchM))
                return matchM;

            return { media: matchM };
        });
    };


    listOfOptions.forEach(options => {
        const {
            start, timeline = gsap, timelines, duration, from, to, fromTo, set, target, condition = () => true, propCondition, matchMediaDefinitions
        } = options;

        /** @typedef {Record<string | symbol, { vars: gsap.TweenVars; matchMedia: string | symbol; cleanUp: () => void }>} OptionsByMatchMedia */

        /**
         * @param {OptionsByMatchMedia} optionsByMatchMedia
         * @param {(vars: gsap.TweenVars) => any} add
         */
        const addWithPossibleMatchMedia = (optionsByMatchMedia, add) => {

            Reflect.ownKeys(optionsByMatchMedia).forEach(key => {
                const { vars, matchMedia, cleanUp } = optionsByMatchMedia[ key ];

                if (matchMedia === MATCH_MEDIA_ALL)
                    return add(vars);

                if (typeof matchMedia === 'symbol')
                    throw new Error('matchMedia is not defined');

                gsap.matchMedia().add(matchMedia, context => {
                    add(vars);
                    return cleanUp;
                });
            });
        };


        if (!condition())
            return timeline;

        if (timelines) {

            const { createAnimation, ease, ...timelinesOptions } = timelines;

            const { timeline: tl, duration } = createTimelines(timelines.elements, (tl, element, index, globalTimeline) => {
                const newOptions = createAnimation({ element, index, globalTimeline });
                const listOfOptions = (Array.isArray(newOptions) ? newOptions : [ newOptions ]).map(opts => ({ ...opts, timeline: tl }));

                addToTimeline(...listOfOptions);
            }, timelinesOptions);

            if (timelinesOptions.withScrub)
                return timeline.fromTo(tl, { time: 0 }, { time: duration, duration, ease }, start);


            if (!options.timeline)
                throw new Error('timeline is not defined in options');

            return options.timeline.add(tl, start);
        }

        const getTweenOptions = () => {
            if (fromTo) return /** @type {const} */({ options: fromTo, type: 'fromTo' });
            if (from) return /** @type {const} */({ options: from, type: 'from' });
            if (to) return /** @type {const} */({ options: to, type: 'to' });
            if (set) return /** @type {const} */({ options: set, type: 'set' });
            return {};
        };

        const tweenOpts = getTweenOptions();


        /**
         * @param {PossiblyConditionedTweenVars | undefined} tweenOpts
         * @param {Object} [options]
         * @param {boolean} [options.withMatchMedia]
         * @returns {OptionsByMatchMedia}
         */
        const tweenOptionsWithMatchMedia = (tweenOpts, { withMatchMedia = true } = {}) => {

            if (!tweenOpts)
                return { [ MATCH_MEDIA_ALL ]: { vars: {}, matchMedia: MATCH_MEDIA_ALL, cleanUp: () => {} } };


            /**
             * @param {any} value
             * @param {AddToTimelineOption['propCondition'] | undefined} condition
             */
            const makeFunctionBasedValueIfConfition = (value, condition) => {
                if (!condition)
                    return value;

                /** @type {gsap.FunctionBasedValue<any>} */
                return (index, target, targets) => {
                    if (condition(index, target, targets))
                        return typeof value === 'function' ? value(index, target, targets) : value;
                };
            };

            /**
             * @typedef {Required<Omit<ConditionedTweenVarsFunctionBasedValue, 'matchMedia'> & { matchMedias: readonly MatchMediaOption[]; }>} ConditionedTV
             * @typedef {Array<[TweenVarsKeys, { value: gsap.TweenValue; matchMedias: MatchMedia[]; }]>} ListOfConditionedTV
             */


            /** @param {PossiblyConditionedTweenVars} tweenOpts */
            const getListOfOptionsWithMediaQuery = tweenOpts => {

                /**
                 * @param {ListOfConditionedTV} allList
                 * @param {_PossiblyConditionedTweenVars} opts
                 * @param {ReadonlyListOrElement<MatchMediaOption>} [conditionedTVarsMatchMedia]
                 * @returns {ListOfConditionedTV}
                 */
                const getListOfConditionedTV = (allList, opts, conditionedTVarsMatchMedia) => Object.entries(opts).reduce((list, keyValue) => {
                    // ['x'] is arbitrary, it could be any key
                    const [ k, val ] =  /** @type {[ TweenVarsKeys, PossiblyConditionedTweenVar<'x'> ]} */(keyValue);

                    const values = ensureArray(val);

                    const conditionedTweenVars = values.map(v => {
                        return isConditionedTweenVar(v) ?
                            { condition: v.condition || propCondition, value: v.value, matchMedia: v.matchMedia || conditionedTVarsMatchMedia } :
                            { condition: propCondition, value: v, matchMedia: conditionedTVarsMatchMedia };
                    });

                    const { condition, matchMedias, value } = conditionedTweenVars.reduce((o, { condition, value, matchMedia }) => ({
                        ...o,
                        condition: (...args) => o.condition(...args) && (condition ? condition(...args) : true),
                        matchMedias: /** @type {readonly MatchMediaOption[]} */([ ...o.matchMedias, matchMedia ].flat().filter(m => !!m)),
                        value
                    }), /** @type {ConditionedTV} */({
                        condition: () => true,
                        matchMedias: [],
                        value: undefined
                    }));


                    const m = matchMedias.length === 0 ? options.matchMedia : matchMedias;

                    return [
                        ...list,
                        [ k, {
                            value: k === 'ease' || k === 'duration' || k === 'stagger' ? value : makeFunctionBasedValueIfConfition(value, condition),
                            matchMedias: m ? getMatchMedias(m) : [ { media: MATCH_MEDIA_ALL } ]
                        } ]
                    ];
                }, allList);

                const { matchMedia: tweenOptsMatchMedia, ...opts } = tweenOpts;

                const list = getListOfConditionedTV([], opts);

                if (tweenOptsMatchMedia) {
                    const tweenOptsMatchMedias = ensureArray(tweenOptsMatchMedia);

                    return tweenOptsMatchMedias.reduce((l, m) => {
                        const { media, ...matchMediaOpts } = m;
                        return getListOfConditionedTV(l, matchMediaOpts, media);
                    }, list);
                }

                return list;
            };


            return getListOfOptionsWithMediaQuery(tweenOpts).reduce((optsWithMQ, [ k, { value, matchMedias } ]) => {
                return matchMedias.reduce((o, m) => {
                    const mediaStr = withMatchMedia ? getMatchMedia(matchMediaDefinitions, m.media) : MATCH_MEDIA_ALL;

                    return {
                        ...o,
                        [ mediaStr ]: {
                            vars: { ...o[ mediaStr ]?.vars, [ k ]: value },
                            matchMedia: mediaStr,
                            cleanUp: () => { o[ mediaStr ]?.cleanUp?.(); m.cleanUp?.(); }
                        }
                    };
                }, optsWithMQ);
            },/** @type {OptionsByMatchMedia} */({}));
        };


        /**
         * @param {gsap.TweenVars | undefined} tweenVars
         */
        const addDuration = tweenVars => ({ duration, ...tweenVars });


        if (target instanceof gsap.core.Timeline || target instanceof gsap.core.Tween) {
            return addWithPossibleMatchMedia(
                tweenOptionsWithMatchMedia(to),
                vars => {
                    if (!options.timeline)
                        throw new Error('timeline is not defined in options');

                    addTimeline(options.timeline, target, start, addDuration(vars));
                });
        }

        if (!target)
            throw new Error('target is not defined in options');

        if (tweenOpts.type === undefined)
            throw new Error('animation type (set, from, to, fromTo) is not defined in options');

        if (tweenOpts.type === 'fromTo') {
            const fromOptions = tweenOptionsWithMatchMedia(tweenOpts.options.from, { withMatchMedia: false })[ MATCH_MEDIA_ALL ].vars;

            return addWithPossibleMatchMedia(
                tweenOptionsWithMatchMedia(tweenOpts.options.to),
                vars => timeline.fromTo(target, fromOptions, addDuration(vars), start)
            );
        }

        return addWithPossibleMatchMedia(
            tweenOptionsWithMatchMedia(tweenOpts.options),
            vars => timeline[ tweenOpts.type ](target, addDuration(vars), start),
        );
    });
};

/**
 * @typedef {{ min?: number; max?: number}} MatchMediaBreakpoint
 */

/**
 * @template T
 * @template {readonly T[]} Elts
 * @param {AddToTimelineOption<Elts> & { matchMediaDefinitions?: Record<string, string | symbol | MatchMediaBreakpoint>}} opts
 */
const bindOptionsAddToTimeline = ({ matchMediaDefinitions, ...options }) => {

    /** @param {readonly AddToTimelineOption<Elts>[]} opts */
    return (...opts) => addToTimeline(...opts.map(option => ({ ...options, ...option, matchMediaDefinitions })));
};


/**
 * @typedef {Object} CreateTimelinesOptions
 * 
 * @property {number} [start]
 * @property {number} [stagger]
 * @property {(i: number, start: number, stagger: number) => gsap.Position} [time]
 * @property {boolean} [withScrub]
 * @property {() => gsap.core.Timeline} [createTimeline]
 */

/**
 * @template {readonly any[]} [Elts=readonly any[]]
 * @typedef {(tl: gsap.core.Timeline, element: InferArray<Elts>, index: number, globalTimeline: gsap.core.Timeline) => void} CreateAnimation
 */

/**
 * @template T
 * @template {readonly T[]} Elts
 * 
 * @param {Elts} elements
 * @param {CreateAnimation<Elts>} createAnimation
 * @param {CreateTimelinesOptions} [options]
 */
const createTimelines = (elements, createAnimation, options = {}) => {
    const {
        start = 0,
        stagger = 0,
        withScrub = false,
        createTimeline = () => gsap.timeline({ paused: withScrub, id: 'createTimelines-tl' })
    } = options;

    const time = options.time || ((i, start = 0, stagger = 0) => start + i * stagger);

    const globalTL = createTimeline();

    elements.forEach((element, i) => {
        const timeline = gsap.timeline({ paused: true /* withScrub */, id: `createTimelines-tl-${i}` });

        createAnimation(timeline, /** @type {InferArray<Elts>} */(element), i, globalTL);
        const position = time(i, start, stagger);

        globalTL.add(timeline, position);
        globalTL.to(timeline, { time: timeline.duration(), duration: timeline.duration() }, position);

        // timeline.eventCallback('onStart', () => { console.log('start', i); });
        // timeline.eventCallback('onComplete', () => { console.log('complete', i); });
    });

    // if (withScrub)
    //     tl.to(tl, { time: duration, duration });

    return { timeline: globalTL, duration: globalTL.duration() };
};


/**
 * @param {gsap.core.Timeline | gsap.core.Tween} timeline
 * @returns {Promise<void>}
 */
const promisifyTimeline = timeline => new Promise(resolve => {
    timeline.eventCallback('onComplete', resolve);
    timeline.eventCallback('onReverseComplete', resolve);
});



const gsapHelpers = {
    promisifyTimeline,
    addToTimeline,
    bindOptionsAddToTimeline,
    createTimelines
};


export { gsapHelpers };
