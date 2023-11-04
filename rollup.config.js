import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleaner from 'rollup-plugin-cleaner';
import typescript from '@rollup/plugin-typescript';
import builtins from 'rollup-plugin-node-builtins';
import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import html from '@rollup/plugin-html';
import fs from 'fs';

import { template } from './example/src/template.js';

const pkg = JSON.parse(fs.readFileSync('./package.json').toString());

const defaultOptions = { env: 'production' };

export function generate(compilerOptions = {}) {
    const options = {
        ...defaultOptions,
        ...compilerOptions,
    };

    console.log('Environment:', options.env);

    return {
        input: './example/src/index.tsx',
        output: {
            dir: './example/dist',
            entryFileNames: 'main-[hash].js',
            format: 'iife',
            name: 'bundle',
            sourcemap: 'inline',
        },
        plugins: [
            typescript({
                compilerOptions: { outDir: './example/dist' },
                include: ['./example/src/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
            }),
            resolve({
                browser: true,
                preferBuiltins: true,
            }),
            postcss({
                plugins: [autoprefixer()],
                modules: true,
                sourceMap: true,
                extract: true,
                minimize: true,
            }),
            html({
                template: template({
                    app: {
                        version: pkg.version,
                    },
                }),
            }),
            commonjs(),
            builtins(),
            cleaner({
                targets: ['./example/dist'],
            }),
            replace({
                preventAssignment: true,
                'process.env.NODE_ENV': JSON.stringify(options.env),
            }),
        ],
    };
}

export default generate();
