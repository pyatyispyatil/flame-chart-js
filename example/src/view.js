const wrapper = document.getElementById('wrapper');
const canvas = document.getElementById('canvas');

const nodeView = document.getElementById('selected-node');
const inputsContainer = document.getElementById('inputs');

const updateButton = document.getElementById('update-button');
const exportButton = document.getElementById('export-button');
const importButton = document.getElementById('import-button');
const importInput = document.getElementById('import-input');

const addInputs = (inputsDict) => inputsDict.map(({ name, value, units }, index) => {
    const input = document.createElement('input');
    const label = document.createElement('label');
    const div = document.createElement('div');

    div.classList.add('inputWrapper');

    label.classList.add('inputLabel');
    label.setAttribute('for', name);
    label.innerHTML = `${name}${units ? `(${units})` : ''}:`;

    input.id = name;
    input.value = value;
    input.classList.add('input');
    input.setAttribute('type', 'number');
    input.addEventListener('change', (e) => inputsDict[index].value = parseInt(e.target.value));

    div.appendChild(label);
    div.appendChild(input);

    inputsContainer.appendChild(div);
});

const performanceInput = document.getElementById('performance');
let performance = true;
performanceInput.checked = performance;

importButton.addEventListener('click', () => {
    importInput.click();
})


const download = (content, fileName, contentType) => {
    const a = document.createElement("a");
    const file = new Blob([content], {type: contentType});

    a.href = URL.createObjectURL(file);
    a.download = fileName;

    a.click();
}

export const initView = (flameChart, config) => {
    performanceInput.addEventListener('change', (e) => {
        performance = e.target.checked;

        flameChart.setSettings({
            performance
        });
    });

    addInputs(config);
}

export const getInputValues = (config) => config.reduce((acc, {name, value}) => {
    acc[name] = value;
    return acc;
}, {});

export const setNodeView = (text) => {
    nodeView.innerHTML = text;
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
        parseInt(style.getPropertyValue('height')) - 4
    ];
}

export const getCanvas = () => {
    return canvas;
}
