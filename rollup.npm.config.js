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
                file: pkg.main.replace('.js', '.min.js'),
                format: 'umd',
                name: name,
                exports: 'named',
                extend: true,
                banner,
                plugins: [terser()],
            },
        ],
    },

    // ES
    {
        ...config,
        input: inputFileName,
        output: [
            {
                file: pkg.module,
                format: 'es',
                banner,
                exports: 'named',
            },
        ],
        external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})],
    },

    // CommonJS
    {
        ...config,
        input: inputFileName,
        output: [
            {
                file: pkg.main,
                name: name,
                format: 'cjs',
                banner,
                exports: 'named',
            },
        ],
        external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})],
    },
];
