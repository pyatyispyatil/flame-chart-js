import resolve from 'rollup-plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import cleaner from 'rollup-plugin-cleaner';
import { template } from './example/src/template.js';
import typescript from '@rollup/plugin-typescript';
import builtins from 'rollup-plugin-node-builtins';

export function generate(compilerOptions) {
    return {
        input: './example/src/index.ts',
        output: {
            dir: './example/dist',
            entryFileNames: 'main-[hash].js',
            format: 'iife',
            name: 'bundle',
            sourcemap: 'inline',
        },
        plugins: [
            typescript({ compilerOptions: { outDir: './example/dist', ...(compilerOptions || {}) } }),
            resolve({
                browser: true,
                preferBuiltins: true,
            }),

            commonjs(),
            builtins(),
            html({
                template,
            }),
            cleaner({
                targets: ['./example/dist'],
            }),
        ],
    };
}

export default generate();
