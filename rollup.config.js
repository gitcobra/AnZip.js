import {terser} from 'rollup-plugin-terser';

export default {
  input: 'src/anzip.js',
  output: [
    {
      file: 'dist/anzip.umd.js',
      format: 'umd',
      name: 'AnZip',
    }, {
      file: 'dist/anzip.umd.min.js',
      format: 'umd',
      name: 'AnZip',
      plugins: [terser()],
    }, {
      file: 'dist/anzip.esm.js',
      format: 'esm',
    }, {
      file: 'dist/anzip.esm.min.js',
      format: 'esm',
      plugins: [terser()],
    }, {
      file: 'dist/anzip.iife.js',
      format: 'iife',
      name: 'AnZip',
      esModule: false,
    }, {
      file: 'dist/anzip.iife.min.js',
      format: 'iife',
      esModule: false,
      plugins: [terser()],
      name: 'AnZip',
    },
  ]
}
