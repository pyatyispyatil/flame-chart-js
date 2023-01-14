export const template = ({ bundle }) => {
    const scripts = Object.keys(bundle)
        .filter((name) => name?.endsWith('js'))
        .map((name) => `<script src="${name}"></script>`)
        .join('');

    const styles = Object.keys(bundle)
        .filter((name) => name?.endsWith('css'))
        .map((name) => `<link href="${name}" rel="stylesheet" type="text/css">`)
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>flame-chart-js</title>
    ${styles}
</head>
<body>
<div id="root"></div>
${scripts}
</body>
</html>`;
};
