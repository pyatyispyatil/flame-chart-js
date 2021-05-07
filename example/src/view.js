const wrapper = document.getElementById('wrapper');
const canvas = document.getElementById('canvas');

const nodeView = document.getElementById('selected-node');
const dataInputsContainer = document.getElementById('data-inputs');
const stylesInputsContainer = document.getElementById('styles-inputs');

const updateStylesButton = document.getElementById('update-styles-button');
const updateButton = document.getElementById('update-button');
const exportButton = document.getElementById('export-button');
const importButton = document.getElementById('import-button');
const importInput = document.getElementById('import-input');

const customStyles = {};

const createInput = ({
                         name,
                         units,
                         value,
                         type = 'number'
                     }, prefix) => {
    const input = document.createElement('input');
    const label = document.createElement('label');
    const div = document.createElement('div');

    const id = (prefix ? prefix + '-' : '') + name;

    div.classList.add('inputWrapper');

    label.classList.add('inputLabel');
    label.setAttribute('for', id);
    label.innerHTML = `${name}${units ? `(${units})` : ''}:`;

    input.id = id;
    input.value = value;
    input.classList.add('input');
    input.setAttribute('type', type);

    div.appendChild(label);
    div.appendChild(input);

    return {
        div, input, label
    }
}

const addInputs = (inputsContainer, inputsDict) => {
    const fragment = document.createDocumentFragment();

    inputsDict.forEach((item, index) => {
        const { div, input } = createInput(item);

        input.addEventListener('change', (e) => inputsDict[index].value = parseInt(e.target.value));

        fragment.appendChild(div);
    });

    inputsContainer.appendChild(fragment);
}

const addStylesInputs = (inputsContainer, styles) => {
    const fragment = document.createDocumentFragment();

    Object.entries(styles).forEach(([key, value]) => {
        customStyles[key] = {
            ...value
        };
    });

    Object.entries(styles).forEach(([component, stylesBlock]) => {
        const title = document.createElement('div');
        title.innerHTML = component;
        title.classList.add('inputsTitle');

        fragment.appendChild(title);

        Object.entries(stylesBlock).forEach(([styleName, value]) => {
            const isNumber = typeof value === 'number';
            const { input, div } = createInput({
                name: styleName,
                value,
                type: isNumber ? 'number' : 'text'
            }, component);

            input.addEventListener('change', (e) => {
                customStyles[component][styleName] = isNumber ? parseInt(e.target.value) : e.target.value;
            });

            fragment.appendChild(div);
        });
    });

    inputsContainer.appendChild(fragment);
}

importButton.addEventListener('click', () => {
    importInput.click();
})


const download = (content, fileName, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });

    a.href = URL.createObjectURL(file);
    a.download = fileName;

    a.click();
}

export const initView = (flameChart, config, styles) => {
    addInputs(dataInputsContainer, config);
    addStylesInputs(stylesInputsContainer, styles);
}

export const getInputValues = (config) => config.reduce((acc, { name, value }) => {
    acc[name] = value;
    return acc;
}, {});

export const setNodeView = (text) => {
    nodeView.innerHTML = text;
}

export const onApplyStyles = (cb) => {
    updateStylesButton.addEventListener('click', () => {
        cb(customStyles);
    });
}

export const onUpdate = (cb) => {
    updateButton.addEventListener('click', () => {
        updateButton.innerHTML = 'Generating...';
        updateButton.setAttribute('disabled', 'true');

        setTimeout(() => {
            cb();
            updateButton.removeAttribute('disabled');
            updateButton.innerHTML = 'Generate random tree';
        }, 1);
    });
}

export const onExport = (cb) => {
    exportButton.addEventListener('click', () => {
        const data = cb();

        download(data, 'data.json', 'application/json');
    });
}

export const onImport = (cb) => {
    importInput.addEventListener('change', (e) => {
        e.target.files[0].text().then(cb);
    })
}

export const getWrapperWH = () => {
    const style = window.getComputedStyle(wrapper, null);

    return [
        parseInt(style.getPropertyValue('width')),
        parseInt(style.getPropertyValue('height')) - 3
    ];
}

export const getCanvas = () => {
    return canvas;
}
