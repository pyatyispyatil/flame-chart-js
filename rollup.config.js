import babel from 'rollup-plugin-babel'
import builtins from 'rollup-plugin-node-builtins'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import html from '@rollup/plugin-html'
import cleaner from 'rollup-plugin-cleaner'
import { template } from './example/src/template.js'
import typescript from '@rollup/plugin-typescript'

export default {
    input: './example/src/index.js',
    output: {
        dir: './example/dist',
        entryFileNames: 'main-[hash].js',
        format: 'iife',
        name: 'bundle'
    },
    plugins: [
        typescript({ compilerOptions: { outDir: './example/dist' } }),
        resolve({
            browser: true,
            preferBuiltins: true
        }),
        commonjs(),
        builtins(),
        babel({
            exclude: 'node_modules/**'
        }),
        json(),
        html({
            template,
        }),
        cleaner({
            targets: [
                './example/dist'
            ]
        })
    ]
}
