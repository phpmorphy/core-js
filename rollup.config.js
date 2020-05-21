import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

export default [
  {
    input: 'dist/index.js',
    output: {
      file: 'lib/index.js',
      format: 'cjs',
    },
    plugins: [
      resolve({ preferBuiltins: true }),
      commonjs(),
    ],
    external: ['bech32', 'tweetnacl'],
  },
  {
    input: 'dist/index.js',
    output: {
      file: 'lib/index.min.js',
      format: 'umd',
      name: 'umi',
      globals: {
        'crypto': 'crypto',
      },
    },
    plugins: [
      resolve({ preferBuiltins: false }),
      commonjs(),
      terser(),
    ],
    external: ['crypto'],
  },
]