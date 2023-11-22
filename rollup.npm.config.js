import { fileURLToPath } from 'node:url';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import builtins from 'rollup-plugin-node-builtins';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json').toString());

const name = 'flameChartJs';
const inputFileName = './src/index.ts';
const reactInputFileName = './src/react.ts';
const external = Object.keys(pkg.dependencies || {});

const basePlugins = [
    resolve({
        browser: true,
        preferBuiltins: true,
    }),
    commonjs(),
    typescript({ compilerOptions: { outDir: './dist' }, noForceEmit: true, tsconfig: './tsconfig.npm.json' }),
    builtins(),
];
const plugins = basePlugins.concat(peerDepsExternal());

const reactConfig = {
    plugins,
    input: reactInputFileName,
    external: [fileURLToPath(new URL('src/index.ts', import.meta.url)), ...external],
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
* author: ${pkg.author}
* ${pkg.name} v${pkg.version}
* Released under the ${pkg.license} license.
*/
`;

export default [
    // Browser
    {
        plugins: basePlugins,
        input: inputFileName,
        output: [
            {
                banner,
                name,
                file: pkg.exports['.'].umd,
                format: 'umd',
                exports: 'named',
                extend: true,
                plugins: [terser()],
            },
        ],
    },

    // ES React
    {
        ...reactConfig,
        output: [
            {
                banner,
                file: pkg.exports['./react'].default,
                format: 'es',
                exports: 'named',
                paths: indexPaths,
            },
        ],
    },

    // JS
    {
        plugins,
        input: inputFileName,
        external,
        output: [
            {
                banner,
                file: pkg.exports['.'].cjs,
                format: 'cjs',
                exports: 'named',
            },
            {
                banner,
                file: pkg.exports['.'].default,
                format: 'es',
                exports: 'named',
            },
        ],
    },
];
