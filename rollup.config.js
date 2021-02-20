import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import builtins from 'rollup-plugin-node-builtins';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: './example/src/index.js',
    output: {
        file: './example/index.js',
        format: 'iife',
        name: 'bundle'
    },
    plugins: [
        resolve({
            browser: true,
            preferBuiltins: true
        }),
        commonjs(),
        builtins(),
        babel({
            exclude: 'node_modules/**'
        }),
        uglify()
    ]
}