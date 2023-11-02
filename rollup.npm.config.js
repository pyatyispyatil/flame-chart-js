import { fileURLToPath } from 'node:url';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import builtins from 'rollup-plugin-node-builtins';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json').toString());

const moduleName = pkg.name;
const name = 'flameChartJs';
const author = pkg.author;
const inputFileName = './src/index.ts';
const reactInputFileName = './src/react.ts';
const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
];
const config = {
    plugins: [
        resolve({
            browser: true,
            preferBuiltins: true,
        }),
        commonjs(),
        typescript({ compilerOptions: { outDir: './dist' }, noForceEmit: true, tsconfig: './tsconfig.npm.json' }),
        builtins(),
    ],
};

const reactConfig = {
    ...config,
    input: reactInputFileName,
    external: external.concat(fileURLToPath(new URL('src/index.ts', import.meta.url))),
};

const indexPaths = (filePath) => {
    if (filePath.endsWith('src/index.ts')) {
        return pkg.main.replace('dist/', './');
    }

    return filePath;
};

const banner = `
/**
* @license
* author: ${author}
* ${moduleName} v${pkg.version}
* Released under the ${pkg.license} license.
*/
`;

export default [
    // Browser
    {
        ...config,
        input: inputFileName,
        output: [
            {
                file: pkg.exports['.'].umd,
                format: 'umd',
                name: name,
                exports: 'named',
                extend: true,
                banner,
                plugins: [terser()],
            },
        ],
    },

    // ES React
    {
        ...reactConfig,
        output: [
            {
                file: pkg.exports['./react'].default,
                format: 'es',
                banner,
                exports: 'named',
                paths: indexPaths,
            },
        ],
    },

    // JS
    {
        ...config,
        input: inputFileName,
        output: [
            {
                file: pkg.exports['.'].cjs,
                name: name,
                format: 'cjs',
                banner,
                exports: 'named',
            },
            {
                file: pkg.exports['.'].default,
                format: 'es',
                banner,
                exports: 'named',
            },
        ],
        external,
    },
];
