import cleanup from 'rollup-plugin-cleanup'
import { terser } from 'rollup-plugin-terser'

const license = '/**\n' +
  ' * @license\n' +
  ' * Copyright (c) 2020 UMI\n' +
  ' *\n' +
  ' * Permission is hereby granted, free of charge, to any person obtaining a copy\n' +
  ' * of this software and associated documentation files (the "Software"), to deal\n' +
  ' * in the Software without restriction, including without limitation the rights\n' +
  ' * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n' +
  ' * copies of the Software, and to permit persons to whom the Software is\n' +
  ' * furnished to do so, subject to the following conditions:\n' +
  ' *\n' +
  ' * The above copyright notice and this permission notice shall be included in all\n' +
  ' * copies or substantial portions of the Software.\n' +
  ' *\n' +
  ' * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n' +
  ' * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n' +
  ' * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n' +
  ' * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n' +
  ' * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n' +
  ' * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n' +
  ' * SOFTWARE.\n' +
  ' */\n'

export default [
  {
    input: 'tmp/dist/index.js',
    output: {
      dir: 'dist',
      format: 'cjs',
      banner: license,
      esModule: false,
      preserveModules: true,
      preferConst: true
    },
    plugins: [
      cleanup({ comments: 'jsdoc', compactComments: false })
    ]
  },
  {
    input: 'tmp/index.js',
    output: [
      {
        file: 'lib/index.js',
        format: 'cjs',
        banner: license,
        esModule: false
      },
      {
        file: 'lib/index.mjs',
        format: 'es',
        banner: license
      }
    ],
    plugins: [
      cleanup({ comments: 'jsdoc', compactComments: false })
    ]
  },
  {
    input: 'tmp/es5/index.js',
    output: {
      file: 'lib/index.min.js',
      format: 'iife',
      name: 'umi',
      banner: '/**\n' +
        ' * @license\n' +
        ' * Copyright (c) 2020 UMI\n' +
        ' * MIT Licensed\n' +
        ' */\n'
    },
    plugins: [
      terser()
    ]
  }
]
