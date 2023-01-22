import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

import { generate } from './rollup.config.js';

const config = generate({ env: 'development' });

export default {
    ...config,
    plugins: [...config.plugins, serve({ contentBase: './example/dist' }), livereload({ verbose: true, delay: 1000 })],
};
