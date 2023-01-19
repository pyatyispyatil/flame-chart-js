import ReactDOM from 'react-dom/client';

import { App } from './components/app';

const init = () => {
    const rootElement = document.getElementById('root');

    if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);

        root.render(<App />);
    }
};

init();
