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

const sha512 = require('./sha512.js')
const common = require('./common.js')

function secretKeyFromSeed (seed) {
  const pk = new Uint8Array(32)
  const sk = new Uint8Array(64)
  sk.set(seed)
  cryptoSignKeypair(pk, sk)
  return sk
}
function publicKeyFromSecretKey (secretKey) {
  const b = new Uint8Array(32)
  b.set(new Uint8Array(secretKey.buffer, 32, 32))
  return b
}
/**
 * @param {Uint8Array} pk
 * @param {Uint8Array} sk
 * @private
 */
function cryptoSignKeypair (pk, sk) {
  const d = new Uint8Array(64)
  const p = [
    new Float64Array(16), new Float64Array(16),
    new Float64Array(16), new Float64Array(16)
  ]
  sha512.cryptoHash(d, sk, 32)
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64
  common.scalarbase(p, d)
  common.pack(pk, p)
  sk.set(pk, 32)
  return 0
}

exports.publicKeyFromSecretKey = publicKeyFromSecretKey
exports.secretKeyFromSeed = secretKeyFromSeed
