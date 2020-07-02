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
 * Note: difference from C - smlen returned, not passed as argument.
 * @param {number[]|Uint8Array} message
 * @param {number[]|Uint8Array} secretKey
 * @returns {number[]}
 * @private
 */
function sign (message, secretKey) {
  const sm = []
  const x = []
  const p = [[], [], [], []]
  const d = sha512.sha512(secretKey.slice(0, 32))
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64
  for (let i = 0, n = message.length; i < n; i++) {
    sm[64 + i] = message[i]
  }
  for (let i = 32; i < 64; i++) {
    sm[i] = d[i]
  }
  const r = sha512.sha512(sm.slice(32))
  common.reduce(r)
  common.scalarbase(p, r)
  common.pack(sm, p)
  for (let i = 32; i < 64; i++) {
    sm[i] = secretKey[i]
  }
  const h = sha512.sha512(sm)
  common.reduce(h)
  for (let i = 0; i < 64; i++) {
    x[i] = 0
  }
  for (let i = 0; i < 32; i++) {
    x[i] = r[i]
  }
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      x[i + j] += h[i] * d[j]
    }
  }
  const sm2 = sm.slice(32)
  common.modL(sm2, x)
  return sm.slice(0, 32).concat(sm2.slice(0, 32))
}

exports.sign = sign
