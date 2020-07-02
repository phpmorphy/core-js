/**
 * @license
 * Copyright (c) 2020 UMI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict'

const sha512 = require('../sha512.js')
const common = require('./common.js')

/**
 * @param {number[]|Uint8Array|Buffer} seed
 * @returns {number[]}
 */
function secretKeyFromSeed (seed) {
  const sk = []
  const pk = []
  const p = [[], [], [], []]
  for (let i = 0; i < 32; i++) {
    sk[i] = seed[i]
  }
  const d = sha512.sha512(sk)
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64
  common.scalarbase(p, d)
  common.pack(pk, p)
  return sk.concat(pk)
}

exports.secretKeyFromSeed = secretKeyFromSeed
