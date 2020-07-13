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

const sha512K = [
  [0x428a2f98, 0xd728ae22], [0x71374491, 0x23ef65cd], [0xb5c0fbcf, 0xec4d3b2f], [0xe9b5dba5, 0x8189dbbc], [0x3956c25b, 0xf348b538],
  [0x59f111f1, 0xb605d019], [0x923f82a4, 0xaf194f9b], [0xab1c5ed5, 0xda6d8118], [0xd807aa98, 0xa3030242], [0x12835b01, 0x45706fbe],
  [0x243185be, 0x4ee4b28c], [0x550c7dc3, 0xd5ffb4e2], [0x72be5d74, 0xf27b896f], [0x80deb1fe, 0x3b1696b1], [0x9bdc06a7, 0x25c71235],
  [0xc19bf174, 0xcf692694], [0xe49b69c1, 0x9ef14ad2], [0xefbe4786, 0x384f25e3], [0x0fc19dc6, 0x8b8cd5b5], [0x240ca1cc, 0x77ac9c65],
  [0x2de92c6f, 0x592b0275], [0x4a7484aa, 0x6ea6e483], [0x5cb0a9dc, 0xbd41fbd4], [0x76f988da, 0x831153b5], [0x983e5152, 0xee66dfab],
  [0xa831c66d, 0x2db43210], [0xb00327c8, 0x98fb213f], [0xbf597fc7, 0xbeef0ee4], [0xc6e00bf3, 0x3da88fc2], [0xd5a79147, 0x930aa725],
  [0x06ca6351, 0xe003826f], [0x14292967, 0x0a0e6e70], [0x27b70a85, 0x46d22ffc], [0x2e1b2138, 0x5c26c926], [0x4d2c6dfc, 0x5ac42aed],
  [0x53380d13, 0x9d95b3df], [0x650a7354, 0x8baf63de], [0x766a0abb, 0x3c77b2a8], [0x81c2c92e, 0x47edaee6], [0x92722c85, 0x1482353b],
  [0xa2bfe8a1, 0x4cf10364], [0xa81a664b, 0xbc423001], [0xc24b8b70, 0xd0f89791], [0xc76c51a3, 0x0654be30], [0xd192e819, 0xd6ef5218],
  [0xd6990624, 0x5565a910], [0xf40e3585, 0x5771202a], [0x106aa070, 0x32bbd1b8], [0x19a4c116, 0xb8d2d0c8], [0x1e376c08, 0x5141ab53],
  [0x2748774c, 0xdf8eeb99], [0x34b0bcb5, 0xe19b48a8], [0x391c0cb3, 0xc5c95a63], [0x4ed8aa4a, 0xe3418acb], [0x5b9cca4f, 0x7763e373],
  [0x682e6ff3, 0xd6b2b8a3], [0x748f82ee, 0x5defb2fc], [0x78a5636f, 0x43172f60], [0x84c87814, 0xa1f0ab72], [0x8cc70208, 0x1a6439ec],
  [0x90befffa, 0x23631e28], [0xa4506ceb, 0xde82bde9], [0xbef9a3f7, 0xb2c67915], [0xc67178f2, 0xe372532b], [0xca273ece, 0xea26619c],
  [0xd186b8c7, 0x21c0c207], [0xeada7dd6, 0xcde0eb1e], [0xf57d4f7f, 0xee6ed178], [0x06f067aa, 0x72176fba], [0x0a637dc5, 0xa2c898a6],
  [0x113f9804, 0xbef90dae], [0x1b710b35, 0x131c471b], [0x28db77f5, 0x23047d84], [0x32caab7b, 0x40c72493], [0x3c9ebe0a, 0x15c9bebc],
  [0x431d67c4, 0x9c100d4c], [0x4cc5d4be, 0xcb3e42b6], [0x597f299c, 0xfc657e2a], [0x5fcb6fab, 0x3ad6faec], [0x6c44198c, 0x4a475817]
]
/**
 * Безопасный алгоритм хеширования, SHA2-512.
 * @see https://en.wikipedia.org/wiki/SHA-2
 * @param {ArrayLike<number>} message message
 * @returns {number[]}
 * @private
 */
function sha512 (message) {
  const h = [
    [0x6a09e667, 0xf3bcc908], [0xbb67ae85, 0x84caa73b], [0x3c6ef372, 0xfe94f82b], [0xa54ff53a, 0x5f1d36f1],
    [0x510e527f, 0xade682d1], [0x9b05688c, 0x2b3e6c1f], [0x1f83d9ab, 0xfb41bd6b], [0x5be0cd19, 0x137e2179]
  ]
  const chunks = sha512PreProcess(message)
  for (let j = 0, l = chunks.length; j < l; j++) {
    const w = chunks[j]
    for (let i = 16; i < 80; i++) {
      const s0 = xor64(xor64(rotr64(w[i - 15], 1), rotr64(w[i - 15], 8)), shft64(w[i - 15], 7))
      const s1 = xor64(xor64(rotr64(w[i - 2], 19), rotr64(w[i - 2], 61)), shft64(w[i - 2], 6))
      w[i] = sum64(sum64(w[i - 16], s0), sum64(w[i - 7], s1))
    }
    sha512Block(h, w)
  }
  const digest = []
  for (let i = 0; i < 8; i++) {
    digest[digest.length] = h[i][0] >>> 24 & 0xff
    digest[digest.length] = h[i][0] >>> 16 & 0xff
    digest[digest.length] = h[i][0] >>> 8 & 0xff
    digest[digest.length] = h[i][0] & 0xff
    digest[digest.length] = h[i][1] >>> 24 & 0xff
    digest[digest.length] = h[i][1] >>> 16 & 0xff
    digest[digest.length] = h[i][1] >>> 8 & 0xff
    digest[digest.length] = h[i][1] & 0xff
  }
  return digest
}
/**
 * @param {ArrayLike<number>} message
 * @returns {number[][][]}
 * @private
 */
function sha512PreProcess (message) {
  const bytes = []
  let i
  let l
  for (i = 0, l = message.length + 16 + (128 - ((message.length + 16) % 128)); i < l; i++) {
    bytes[i] = message[i] || 0
  }
  bytes[message.length] = 0x80
  bytes[bytes.length - 2] = ((message.length * 8) >>> 8) & 0xff
  bytes[bytes.length - 1] = (message.length * 8) & 0xff
  const chunks = []
  for (i = 0, l = bytes.length; i < l; i += 128) {
    const chunk = []
    for (let j = 0; j < 128; j += 8) {
      let n = i + j
      chunk[chunk.length] = [
        (bytes[n] << 24) + (bytes[++n] << 16) + (bytes[++n] << 8) + bytes[++n],
        (bytes[++n] << 24) + (bytes[++n] << 16) + (bytes[++n] << 8) + bytes[++n]
      ]
    }
    chunks[chunks.length] = chunk
  }
  return chunks
}
/**
 * @param {number[][]} h
 * @param {number[][]} w
 * @returns {number[][]}
 * @private
 */
function sha512Block (h, w) {
  const a = []
  let i
  for (i = 0; i < 8; i++) {
    a[i] = [h[i][0], h[i][1]]
  }
  for (i = 0; i < 80; i++) {
    const S1 = xor64(xor64(rotr64(a[4], 14), rotr64(a[4], 18)), rotr64(a[4], 41))
    const ch = xor64(and64(a[4], a[5]), and64(not64(a[4]), a[6]))
    const t1 = sum64(sum64(sum64(a[7], S1), sum64(ch, sha512K[i])), w[i])
    const S0 = xor64(xor64(rotr64(a[0], 28), rotr64(a[0], 34)), rotr64(a[0], 39))
    const ma = xor64(xor64(and64(a[0], a[1]), and64(a[0], a[2])), and64(a[1], a[2]))
    const t2 = sum64(S0, ma)
    a[7] = a[6]
    a[6] = a[5]
    a[5] = a[4]
    a[4] = sum64(a[3], t1)
    a[3] = a[2]
    a[2] = a[1]
    a[1] = a[0]
    a[0] = sum64(t1, t2)
  }
  for (i = 0; i < 8; i++) {
    h[i] = sum64(h[i], a[i])
  }
}
/**
 * @param {number[]} n
 * @param {number} i
 * @returns {number[]}
 * @private
 */
function shft64 (n, i) {
  return [(n[0] >>> i), (n[1] >>> i) | (n[0] << (32 - i))]
}
/**
 * @param {number[]} n
 * @param {number[]} i
 * @returns {number[]}
 * @private
 */
function rotr64 (n, i) {
  if (i < 32) {
    return [n[0] >>> i | n[1] << (32 - i), n[1] >>> i | n[0] << (32 - i)]
  }
  return [
    n[1] >>> (i - 32) | n[0] << (32 - (i - 32)),
    n[0] >>> (i - 32) | n[1] << (32 - (i - 32))
  ]
}
/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 * @private
 */
function xor64 (a, b) {
  return [(a[0] ^ b[0]), (a[1] ^ b[1])]
}
/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 * @private
 */
function and64 (a, b) {
  return [(a[0] & b[0]), (a[1] & b[1])]
}
/**
 * @param {number[]} n
 * @returns {number[]}
 * @private
 */
function not64 (n) {
  return [~n[0], ~n[1]]
}
/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 * @private
 */
function sum64 (a, b) {
  const x = [0, 0, 0, 0]
  x[3] = (a[1] & 0xffff) + (b[1] & 0xffff)
  x[2] = (a[1] >>> 16) + (b[1] >>> 16) + (x[3] >>> 16)
  x[1] = (a[0] & 0xffff) + (b[0] & 0xffff) + (x[2] >>> 16)
  x[0] = (a[0] >>> 16) + (b[0] >>> 16) + (x[1] >>> 16)
  return [((x[0] & 0xffff) << 16) + (x[1] & 0xffff), ((x[2] & 0xffff) << 16) + (x[3] & 0xffff)]
}

exports.sha512 = sha512
exports.sha512PreProcess = sha512PreProcess
