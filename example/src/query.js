export const query = location.search

export const initQuery = (flameChart) => {
    if (query) {
        const args = query
            .split('?')
            .map((arg) => arg.split('='))
            .reduce((acc, [key, value]) => {
                acc[key] = value;

                return acc;
            }, {});

        if (args.file) {
            fetch(decodeURIComponent(args.file), {
                method: 'GET',
                mode: 'no-cors'
            })
                .then((res) => res.text())
                .then((data) => {
                    flameChart.setData(JSON.parse(data));
                    flameChart.resetView();
                });
        }
    }
}
