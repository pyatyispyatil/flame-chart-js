import ReactDOM from 'react-dom/client';

import { App } from './components/app';

// const colors = {
//     task: '#696969',
//     event: '#a4775b',
// };

const init = () => {
    const rootElement = document.getElementById('root');

    if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);

        root.render(<App />);
    }
};

init();
