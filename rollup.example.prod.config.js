import { generate } from './rollup.config.js';

const config = generate({ env: 'production' });

export default {
    ...config,
};
