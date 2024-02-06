/* eslint-disable */

import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import json from '@rollup/plugin-json';

const common = {
  plugins: [
    json(),
    commonjs({
      browser: true,
      requireReturnsDefault: 'auto',
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: true,
    }),
    nodePolyfills(),
    terser({ keep_classnames: true, keep_fnames: true })
  ],
  onwarn(warning, rollupWarn) {
    // Remove some of the warnings noise:
    // - CIRCULAR_DEPENDENCY -> not sure if this is an issue
    // - THIS_IS_UNDEFINED -> result of using typescript polyfills
    // - EVAL -> sometimes people just use eval. Deal with it.
    if (warning.code !== 'CIRCULAR_DEPENDENCY' && warning.code !== 'THIS_IS_UNDEFINED' && warning.code !== 'EVAL') {
      rollupWarn(warning);
    }
  }
}

export default [
  {
    input: './dist/es2020/Polyfill-jira.js',
    output: {
      file: './dist/ap-jira.js',
      format: 'iife'
    },
    ...common
  },
  {
    input: './dist/es2020/Polyfill-confluence.js',
    output: {
      file: './dist/ap-confluence.js',
      format: 'iife'
    },
    ...common
  },
]