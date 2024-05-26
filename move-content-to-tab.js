(() => {

    const html = `
    <div class="ud-tab-content">
        <div class="ud-tab-content__col1 t819__content-col t819__content-col_2"></div>
        <div class="ud-tab-content__col2 t819__content-col t819__content-col_2"></div>
    </div>
    `;

    const moveContentsToTab = (tabId, contents) => {
        const tab = document.getElementById(tabId);
        tab.replaceChildren(); // empty it
        tab.insertAdjacentHTML('afterbegin', html);

        contents.forEach(({ col, elements }) => {
            tab.querySelector(`.ud-tab-content__col${col}`)?.append(...elements);
        });
    };

    const getElements = (selector) => [ ...document.querySelectorAll(selector) ].map(el => {
        const tCol = el.querySelector('.t-col');

        if (tCol) {
            const tColClasses = [ ...tCol.classList.values() ].filter(name => name.startsWith('t-col'));
            tCol.classList.remove(...tColClasses);
        }

        return el;
    });

    const datas = [
        {
            id: 'content-tab1_571929051',
            name: 'cathedral-moods',
            content: [
                { col: 1, elements: getElements(`.uc-tab-content1-col1`) },
                { col: 2, elements: getElements(`.uc-tab-content1-col2`) },
            ]
        }
    ];

    datas.forEach(({ id, content }) => {
        moveContentsToTab(id, content);
    });
})();


(() => {
    const focusClass = 'ud-input-focus';

    document.querySelectorAll('#form571941213 .t-input-block').forEach(el => {
        el.addEventListener('focusin', () => { el.classList.add(focusClass); });
        el.addEventListener('focusout', () => { el.classList.remove(focusClass); });
    });
})();
