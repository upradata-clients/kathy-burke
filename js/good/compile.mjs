// @ts-check

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'minify';
import jsBeautify from 'js-beautify';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @param {string[]} paths */
const fromHere = (...paths) => path.resolve(__dirname, ...paths);


const globalJsFiles = [
    fromHere('./common/underscore.js'),
    fromHere('./common/gsap.plugins.js')
];


const libJsFiles = [
    fromHere('./common/mouse-follow.js'),
    fromHere('./common/images-settings.js'),
];

const galleryJsFiles = [
    fromHere('./gallery/gallery-layout.js'),
    fromHere('./gallery/gallery-menu.js'),
    fromHere('./gallery/gallery-animation.js'),
    fromHere('./gallery/gallery-slider.js'),
    fromHere('./gallery/gallery.js'),
];

/** 
 * @param {string[]} files
 * @param {Object} options
 * @param {string} options.outputPath
 * @param {(s: string) => string} [options.wrapper]
 * @param {boolean} [options.isProd]
 */
const compile = async (files, { outputPath, isProd, wrapper = s => `_.define(() => {\n${s}\n});` }) => {
    const contents = await Promise.all(files.map(async file => await fs.readFile(file, 'utf-8')));

    const compiled = contents.reduce((compiled, content, i) => {

        const c = content.replace(/export\s+{(.|\n)+?}/g, s => {
            return s
                .replace(/export\s+default/g, 'return')
                .replace('export ', 'return ')
                .replace(/(\S*)\s+as\s+(\S*)/g, '$2: $1');
        });


        return [
            ...compiled,
            `// ${path.relative(__dirname, files[ i ])}\n${wrapper(c)}`
        ];
    }, /** @type {string[]} */([])).join('\n\n');

    const postProcess = async () => {
        if (isProd) {
            const tmpFile = fromHere(`./dist/${path.basename(outputPath, '.js')}__tmp.js`);
            await fs.writeFile(tmpFile, compiled, 'utf-8');

            const result = await minify(
                tmpFile,
                {
                    js: {
                        // wrong ts type
                        type: 'terser',
                        terser: /** @type {import('minify').Options} */({
                            keep_fnames: true,
                            keep_classnames: true,
                            compress: true,
                            mangle: true,
                            format: {
                                beautify: false,
                                comments: 'some',
                                indent_level: 2,
                                quote_style: 3
                            },
                            ecma: 2020
                        })
                    }
                }
            );

            await fs.rm(tmpFile);
            return result;
        }

        return jsBeautify.js_beautify(compiled, {
            indent_size: 4,
            end_with_newline: true
        });
    };


    await fs.writeFile(outputPath, await postProcess(), 'utf-8');
};

/** @param {string} filePath */
const isFileExists = filePath => fs.stat(filePath).then(() => false).catch(() => true);

if (await isFileExists(fromHere('./dist')))
    await fs.mkdir(fromHere('./dist'));

const isProd = process.argv.includes('--prod');

Promise.all([
    compile(globalJsFiles, { outputPath: fromHere('./dist/global.js'), isProd, wrapper: s => `(() => {\n${s}\n})();` }),
    compile(libJsFiles, { outputPath: fromHere('./dist/lib.js'), isProd }),
    compile(galleryJsFiles, { outputPath: fromHere('./dist/gallery.js'), isProd })
]).then(() => {
    console.log('Compilation complete');
}).catch(console.error);
