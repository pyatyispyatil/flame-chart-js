import babel from 'rollup-plugin-babel';
import builtins from 'rollup-plugin-node-builtins';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleaner from 'rollup-plugin-cleaner';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

export default [
    {
        input: './src/index.ts',
        output: {
            file: 'dist/bundle.js',
            format: 'cjs',
            name: 'gflame',
            sourcemap: true,
            exports: 'named',
        },
        plugins: [
            esbuild(),
            resolve({
                browser: true,
                preferBuiltins: true,
            }),
            commonjs(),
            builtins(),
            babel({
                exclude: 'node_modules/**',
            }),
            cleaner({
                targets: ['dist'],
            }),
        ],
    },
    {
        input: './src/index.ts',
        plugins: [dts()],
        output: {
            file: 'dist/bundle.d.ts',
            format: 'es',
        },
    },
];
