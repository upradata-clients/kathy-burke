
// @ts-check


/**
 * @typedef {Object} TextSplit
 * @property {HTMLElement} container
 * @property {HTMLElement[]} groups
 * @property {HTMLElement[]} words
 * @property {HTMLElement[]} chars
 * @property {{ group: HTMLElement; words: { word: HTMLElement; chars: HTMLElement[] }[]; chars: HTMLElement[] }[] } all
 */

/**
 * @param {HTMLElement} element
 * @param {Object} [gsapOptions]
 * @param {Partial<Record<'char' | 'word' | 'group', string | RegExp>>} [gsapOptions.separator]
 * @param {Partial<Record<'char' | 'word' | 'group' | 'groups', string>>} [gsapOptions.cssClass]
 * @param {{ 
 *      group?: (options: { groupI: number; words: HTMLElement[]}) => HTMLElement;
 *      word?: (options: { groupI: number; wordI: number; chars: HTMLElement[] }) => HTMLElement;
 *      char?: (options: { groupI: number; wordI: number;  charI: number, char: string }) => HTMLElement;}
 * } [gsapOptions.createElement]
 * 
 * @returns {TextSplit}
 */
const createTextSplit = (element, options = {}) => {
    const {
        group: groupSeparator,
        word: wordSeparator = /\s+/,
        char: charSeparator = ''
    } = options.separator || {};

    const {
        groups: groupsCssClass = 'groups',
        group: groupCssClass = 'group',
        word: wordCssClass = 'word',
        char: charCssClass = 'char'
    } = options.cssClass || {};

    const {
        char: createChar = ({ charI = 0, char }) => {
            const el = document.createElement('span');
            el.append(char);
            el.classList.add(charCssClass, `${charCssClass}-${charI}`);
            return el;
        },
        word: createWord = ({ wordI, chars }) => {
            const el = document.createElement('div');
            el.classList.add(wordCssClass, `${wordCssClass}-${wordI}`);
            el.append(...chars);
            return el;
        },
        group: createGroup = ({ groupI, words }) => {
            const el = document.createElement('div');
            el.classList.add(groupCssClass, `${groupCssClass}-${groupI}`);
            el.append(...words);
            return el;
        }
    } = options.createElement || {};


    const content = element.textContent;

    if (!content)
        return { all: [], groups: [], words: [], chars: [], container: element };


    /**
     * @param {string} content
     * @param {number} groupI
     * @param {HTMLElement} container
     */
    const createWords = (content, groupI, container) => {

        const words = content.split(wordSeparator).map(w => w.trim()).filter(w => w);

        const wordsElts = words.map((w, i) => {
            const chars = w.split(charSeparator);

            const charsElts = chars.map((c, j) => createChar({ groupI, wordI: i, charI: j, char: c }));
            const wordElt = createWord({ groupI, wordI: i, chars: charsElts });

            return wordElt;
        });

        container.append(...wordsElts);

        const wordsData = wordsElts.map(word => ({
            word,
            chars: /** @type {HTMLElement[]} */([ ...word.children ])
        }));

        return {
            words: wordsData,
            chars: wordsData.flatMap(({ chars }) => chars)
        };
    };

    const createGroups = () => {
        const groups = groupSeparator ? content.split(groupSeparator).map(w => w.trim()).filter(w => w) : [ content ];

        return groups.map((groupStr, i) => {
            const wordsDiv = document.createElement('div');
            wordsDiv.classList.add('words');

            const { words, chars } = createWords(groupStr, i, wordsDiv);
            const group = createGroup({ groupI: i, words: words.map(({ word }) => word) });

            return { group, words, chars };
        });
    };

    const createSplit = () => {
        const groups = createGroups();

        if (groups.length === 1) {
            element.replaceWith(groups[ 0 ].group);
            return { groups, container: groups[ 0 ].group };
        }

        {
            const groupsDiv = document.createElement('div');
            groupsDiv.classList.add(groupsCssClass);

            groupsDiv.append(...groups.map(({ group }) => group));
            element.replaceWith(groupsDiv);

            return { groups, container: groupsDiv };
        }
    };

    const { groups, container } = createSplit();
    container.style.cssText += element.style.cssText;
    container.classList.add(...element.classList);

    return {
        container,
        all: groups,
        groups: groups.map(({ group }) => group),
        words: groups.flatMap(({ words }) => words.map(({ word }) => word)),
        chars: groups.flatMap(({ words }) => words.flatMap(({ chars }) => chars)),
    };
};


export { createTextSplit };
