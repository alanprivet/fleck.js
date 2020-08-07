import path from 'path'

import pkg from './package.json'

export default {
  input: 'src/index.js',
  output: {
    format: 'cjs',
    // dir: path.resolve(__dirname, 'dist'),
    file: pkg.main,
    preferConst: true
  }
};