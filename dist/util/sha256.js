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

const sha256K = [
  0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
  0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
  0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
  0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
  0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
  0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
  0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
  0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
]
/**
 * Безопасный алгоритм хеширования, SHA2-256.
 * @see https://en.wikipedia.org/wiki/SHA-2
 * @param {ArrayLike<number>} message message
 * @returns {number[]} hash
 * @private
 */
function sha256 (message) {
  const h = [0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19]
  const chunks = sha256PreProcess(message)
  for (let j = 0, l = chunks.length; j < l; j++) {
    const w = chunks[j]
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10)
      w[i] = w[i - 16] + s0 + w[i - 7] + s1
    }
    sha256Block(h, w)
  }
  const digest = []
  for (let i = 0; i < 8; i++) {
    digest[digest.length] = h[i] >>> 24 & 0xff
    digest[digest.length] = h[i] >>> 16 & 0xff
    digest[digest.length] = h[i] >>> 8 & 0xff
    digest[digest.length] = h[i] & 0xff
  }
  return digest
}
/**
 * @param {ArrayLike<number>} message
 * @returns {number[][]}
 * @private
 */
function sha256PreProcess (message) {
  const bytez = []
  let i
  let l
  for (i = 0, l = message.length + 8 + (64 - ((message.length + 8) % 64)); i < l; i++) {
    bytez[i] = message[i] || 0
  }
  bytez[message.length] = 0x80
  bytez[bytez.length - 2] = ((message.length * 8) >>> 8) & 0xff
  bytez[bytez.length - 1] = (message.length * 8) & 0xff
  const chunks = []
  for (i = 0, l = bytez.length; i < l; i += 64) {
    const chunk = []
    for (let j = 0; j < 64; j += 4) {
      let n = i + j
      chunk[chunk.length] = (bytez[n] << 24) + (bytez[++n] << 16) + (bytez[++n] << 8) + bytez[++n]
    }
    chunks[chunks.length] = chunk
  }
  return chunks
}
/**
 * @param {number[]} h
 * @param {number[]} w
 * @private
 */
function sha256Block (h, w) {
  const a = []
  let i
  for (i = 0; i < 8; i++) {
    a[i] = h[i]
  }
  for (i = 0; i < 64; i++) {
    const S1 = rotr(a[4], 6) ^ rotr(a[4], 11) ^ rotr(a[4], 25)
    const ch = (a[4] & a[5]) ^ ((~a[4]) & a[6])
    const t1 = a[7] + S1 + ch + sha256K[i] + w[i]
    const S0 = rotr(a[0], 2) ^ rotr(a[0], 13) ^ rotr(a[0], 22)
    const ma = (a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2])
    const t2 = S0 + ma
    a[7] = a[6]
    a[6] = a[5]
    a[5] = a[4]
    a[4] = a[3] + t1
    a[3] = a[2]
    a[2] = a[1]
    a[1] = a[0]
    a[0] = t1 + t2
  }
  for (i = 0; i < 8; i++) {
    h[i] = h[i] + a[i] | 0
  }
}
/**
 * @param {number} n
 * @param {number} i
 * @returns {number}
 * @private
 */
function rotr (n, i) {
  return (n >>> i) | (n << (32 - i))
}

exports.sha256 = sha256
