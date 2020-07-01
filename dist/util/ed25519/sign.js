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

function sign (message, secretKey) {
  const signedMsg = new Uint8Array(64 + message.length)
  cryptoSign(signedMsg, message, message.length, secretKey)
  return new Uint8Array(signedMsg.buffer, 0, 64)
}
/**
 * Note: difference from C - smlen returned, not passed as argument.
 * @param {Uint8Array} sm
 * @param {Uint8Array} m
 * @param {number} n
 * @param {Uint8Array} sk
 * @private
 */
function cryptoSign (sm, m, n, sk) {
  let i
  let j
  const x = new Float64Array(64)
  const p = [
    new Float64Array(16),
    new Float64Array(16),
    new Float64Array(16),
    new Float64Array(16)
  ]
  const d = new Uint8Array(sha512.sha512(sk.slice(0, 32)))
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64
  sm.set(m, 64)
  sm.set(d.subarray(32), 32)
  const r = new Uint8Array(sha512.sha512(sm.slice(32, 64)))
  common.reduce(r)
  common.scalarbase(p, r)
  common.pack(sm, p)
  sm.set(sk.subarray(32), 32)
  const h = new Uint8Array(sha512.sha512(sm))
  common.reduce(h)
  x.set(r)
  for (i = 0; i < 32; i++) {
    for (j = 0; j < 32; j++) {
      x[i + j] += h[i] * d[j]
    }
  }
  common.modL(sm.subarray(32), x)
}

exports.sign = sign
