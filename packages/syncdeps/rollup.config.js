
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import executable from 'rollup-plugin-executable';

export default {
  input: `./dist/es2020/index.js`,
  output: {
    file: `./lib/index.js`,
    format: 'es',
    sourcemap: 'inline'
  },
  external: [ /node_modules/ ],
  plugins: [
    json(),
    commonjs(),
    nodeResolve({
      preferBuiltins: true
    }),
    executable()
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