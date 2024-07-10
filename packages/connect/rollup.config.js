/* eslint-disable */

import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import axios from 'axios';

const common = (replacements) => ({
  plugins: [
    json(),
    replace(replacements),
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
})

export default (async () => {

  const { data: DARK_THEME_STYLING } = await axios('https://connect-cdn.atl-paas.net/themes/atlaskit-tokens_dark.css');
  const { data: LIGHT_THEME_STYLING } = await axios('https://connect-cdn.atl-paas.net/themes/atlaskit-tokens_light.css');
  const { data: SPACING_STYLING } = await axios('https://connect-cdn.atl-paas.net/themes/atlaskit-tokens_spacing.css');

  return [
    {
      input: './dist/es2020/Polyfill-jira.js',
      output: {
        file: './dist/ap-jira.js',
        format: 'iife'
      },
      ...common({
        'process.env.LIGHT_THEME_STYLING': JSON.stringify(LIGHT_THEME_STYLING),
        'process.env.DARK_THEME_STYLING': JSON.stringify(DARK_THEME_STYLING),
        'process.env.SPACING_STYLING': JSON.stringify(SPACING_STYLING)
      })
    },
    {
      input: './dist/es2020/Polyfill-confluence.js',
      output: {
        file: './dist/ap-confluence.js',
        format: 'iife'
      },
      ...common({
        'process.env.LIGHT_THEME_STYLING': JSON.stringify(LIGHT_THEME_STYLING),
        'process.env.DARK_THEME_STYLING': JSON.stringify(DARK_THEME_STYLING),
        'process.env.SPACING_STYLING': JSON.stringify(SPACING_STYLING)
      })
    },
  ]
})();