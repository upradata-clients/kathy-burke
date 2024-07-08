//@ts-check

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CustomEase } from '../../../node_modules/gsap/dist/CustomEase.js';
import { JSDOM } from 'jsdom';
import { svgPathProperties } from 'svg-path-properties';



const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @param {number} n */
const round2Decimals = n => Math.round(n * 100) / 100;


const signatureSvg = await fs.readFile(path.join(__dirname, '../../../../images/signature4-2.svg'), 'utf-8');
const { window: { document: svg } } = new JSDOM(signatureSvg);

const pathsLengths = [ ...svg.querySelectorAll('path') ].map(path => ({
    length: new svgPathProperties(path.getAttribute('d') || '').getTotalLength(),
    letter: path.getAttribute('data-letter') || ''
}));

const totalPathsLength = pathsLengths.reduce((acc, { length }) => acc + length, 0);

const pathsLengthsByLetter = pathsLengths.reduce((o, { length, letter }) => ({
    ...o,
    [ letter ]: [ ...(o[ letter ] || []), length ]
}), /** @type {Record<string, number[]>} */({}));


const lettersData = Object.entries(pathsLengthsByLetter).map(([ letter, lengths ]) => {

    const totalLetterLength = lengths.reduce((acc, l) => acc + l, 0);

    return {
        letter,
        totalLength: totalLetterLength,
        totalProportion: totalLetterLength / totalPathsLength,
        innerProportions: lengths.map(l => l / totalLetterLength),
        isImmediate: letter === 'point',
        lengths
    };
});

const generateSignatureLoader = () => {

    /**
     * @param {Object} options
     * @param {number[]} options.pathsProportions
     */
    const generateKeyFrames = ({ pathsProportions }) => {

        const { keyframes } = pathsProportions.reduce(({ keyframes, currentProgress }, proportion) => {

            const deltaProgress = round2Decimals(proportion * 100);

            const keyframe = `
            ${currentProgress}% {
                opacity: 1;
                stroke-dashoffset: 100%;
            }
            ${currentProgress + deltaProgress}% {
                stroke-dashoffset: 0%;
            }
        `;

            return {
                keyframes: [ ...keyframes, keyframe ],
                currentProgress: currentProgress + deltaProgress
            };

        }, (/** @type {{ keyframes: string[]; currentProgress: number; }} */(
            { keyframes: [], currentProgress: 0 }
        )));

        return keyframes;
    };

    const handWritingkeyFrames = `
        @keyframes hand-writing {
            to {
                stroke-dashoffset: 0;
            }
        }
    `.trim();

    /* 
            signature paths totalLength = 242.52
            paths proportions: 
            [
                0.020660871015855443 = 02.07%
                0.1338513632230078   = 13.38%
                0.1356224970877821   = 13.56%
                0.009491653952220427 = 9.49%
                0.07341752693047425  = 07.34%
                0.23784112195704016  = 23.78%
                0.1657946893930826   = 16.58%
                0.06767310727493152  = 60.77%
                0.15564716916560573  = 15.60%
            ]
            
            For a duration of 2s, we have paths durations:
            [
               [0.041s, 0.268s, 0.271s, 0.190s, 0.147s, 0.476s, 0.332s, 1.216s, 0.312s] 
            ]
        
        */


    /** @param {number} t */
    const expoInEase = t => t ? Math.pow(2, 10 * (t - 1)) : 0;
    /** @param {number} t */
    const expoOutEase = t => 1 - expoInEase(1 - t);


    // const timeEasing = t => t < 0.5 ? Math.pow(2 * t, 1 / 2) / 2 : 1 - Math.pow(2 * (1 - t), 1 / 2) / 2;
    //  eases.circInOut;
    /** @type {(t: number) => number} */
    const timeEasing = CustomEase.create('custom', 'M0,0 C0,0 0.049,0.038 0.133,0.078 0.189,0.105 0.293,0.189 0.293,0.189 0.537,0.496 0.798,0.702 0.798,0.702 0.798,0.702 0.902,0.938 0.902,0.938 1.006,0.945 0.986,0.995 1,1');
    // 'M0,0 C0,0 0.102,0.257 0.228,0.383 0.375,0.53 0.714,0.625 0.87,0.742 1,0.87 1,1 1,1');

    /**
     * @param {Object} options
     * @param {typeof lettersData} options.lettersData
     * @param {number} options.duration 
     * @param {number} [options.initDelay]
     */
    const generateCssAnimations = ({ /* pathsProportions */  lettersData, duration, initDelay = 0 }) => {

        const datas = lettersData.flatMap(d => d.innerProportions.map((p, i) => ({
            proportion: p * d.totalProportion,
            letter: d.letter,
            isImmediate: d.isImmediate,
            length: d.lengths[ i ]
        })));

        const r = round2Decimals;

        const { animations } = datas.reduce(({ animations, currentProgress }, { proportion, letter, length }, i) => {

            const deltaP = timeEasing(currentProgress + proportion) - timeEasing(currentProgress);

            // console.log({ letter, proportion, t: currentProgress + proportion, deltaP });

            const d = /* isImmediate ? 0 : */ r(deltaP * duration);
            const delay = r(initDelay + timeEasing(currentProgress) * duration);

            return {
                animations: [
                    ...animations,
                    `.init-loader.active .svg-signature path:nth-child(${i + 1}) {
                        stroke-dashoffset: ${r(length + 1)};
                        stroke-dasharray: ${r(length + 1)};
                        animation: ${d}s linear ${delay}s forwards hand-writing;
                    }`.trim()
                ],
                currentProgress: currentProgress + proportion
            };
        }, /** @type {{ animations: string[]; currentProgress: number; }} */(
            { animations: [], currentProgress: 0 }
        ));

        return animations;
    };


    // const pathsProportions = [
    //     0.020660871015855443,
    //     0.1338513632230078,
    //     0.1356224970877821,
    //     0.009491653952220427,
    //     0.07341752693047425,
    //     0.23784112195704016,
    //     0.1657946893930826,
    //     0.06767310727493152,
    //     0.15564716916560573
    // ]; // .map(round2Decimals);

    // const pathsProportions = pathsLengths.map(l => l / totalLength);

    const cssAnimations = generateCssAnimations({ /* pathsProportions */lettersData, duration: 1.5, initDelay: 1 });

    return [
        cssAnimations.join('\n'),
        '',
        handWritingkeyFrames
    ].join('\n').trim();

};


const cssFile = path.join(__dirname, 'signature-loader.css');

await fs.writeFile(cssFile, generateSignatureLoader());

console.log(`${path.relative(process.cwd(), cssFile)} created successfully`);
