export const template = ({ bundle }) => (
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>flame-chart-js</title>
    <style>
        html {
            height: 100%;
        }

        body {
            height: 100%;
            font-family: monospace;
        }

        .root {
            display: flex;
            flex-direction: column;
            height: 75%;
        }

        .inputLabel {
            padding: 0 6px 0 0;
        }

        .input {
            width: 150px;
        }

        .inputWrapper {
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
        }

        #inputs {
            display: inline-block;
        }

        .button {
            margin: 16px 0 0 0;
            width: 100px;
            height: 30px;
            cursor: pointer;
        }
        
        .button:not(:first-child) {
            margin-left: 14px; 
        }
        
        .updateButton {
            flex: 1;
        }
        
        .updateButtonWrapper {
            display: flex;
        }
        
        .buttonsWrapper {
            display: inline-block;
            width: 100%;
        }
        
        .stylesButton {
            width: 100%;
        }
        
        .fileButtons {
            display: flex;
            justify-content: space-between;
        }
        
        .fileInput {
            display: block;
            visibility: hidden;
            width: 0;
            height: 0;
            position: absolute;
        }
        
        .inputsTitle {
            text-decoration: underline;
            font-weight: bold;
            margin: 16px 0 8px 0;
        }
        
        .footer {
            margin-top: 24px;
            display: flex;
        }
        
        .selectedNode {
            margin-left: 42px;
        }
        
        .footerSection {
            border: 1px solid black;
            padding: 4px;
            margin-right: 16px;
            max-height: 360px;
        }
        
        .footerSectionTitle{
            text-align: center;
            margin-bottom: 16px;
        }
        
        .footerSectionInputs {
            max-height: 278px;
            overflow: auto; 
        }

        #wrapper {
            padding: 20px;
            border: 1px solid black;
            flex: 1;
        }
    </style>
</head>
<body>
<div class="root">
    <div id="wrapper">
        <canvas id="canvas"></canvas>
    </div>
    <div class="footer">
        <div class="footerSection">
            <div>
                <div class="footerSectionTitle">Data generator</div>
                <div id="data-inputs"></div>
            </div>
            <div>
                <div class="buttonsWrapper">
                    <div class="updateButtonWrapper">
                        <button class="button updateButton" id="update-button">Generate random tree</button>
                    </div>
                    <div class="fileButtons">
                        <button class="button" id="export-button">Export</button>
                        <button class="button" id="import-button">Import</button>
                        <input class="fileInput" type="file" id="import-input"/>
                    </div>
                </div>
            </div>
        </div>
        <div class="footerSection">
            <div>
                <div class="footerSectionTitle">Styles</div>
                <div  class="footerSectionInputs" id="styles-inputs"></div>
            </div>
            <div>
                <div class="buttonsWrapper stylesButton">
                    <div class="updateButtonWrapper">
                        <button class="button updateButton" id="update-styles-button">Apply styles</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="selectedNode">
            <pre id="selected-node"></pre>
        </div>
    </div>
</div>
${
        Object.keys(bundle).filter((name) => name && name.endsWith('js')).map((name) => (
            `<script src="${name}"></script>`
        )).join('')
    }
</body>
</html>`
)
