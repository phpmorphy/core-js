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
const array = require('../array.js')
const common = require('./common.js')

const D = [
  0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070,
  0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203
]
const I = [
  0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43,
  0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83
]
/**
 * @param {ArrayLike<number>} seed
 * @returns {number[]}
 * @private
 */
function secretKeyFromSeed (seed) {
  const pk = []
  const p = [[], [], [], []]
  const d = sha512.sha512(seed)
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64
  common.scalarbase(p, d)
  common.pack(pk, p)
  return array.arrayConcat(seed, pk)
}
/**
 * @param {ArrayLike<number>} message
 * @param {ArrayLike<number>} secretKey
 * @returns {number[]}
 * @private
 */
function sign (message, secretKey) {
  const d = sha512.sha512(array.arraySlice(secretKey, 0, 32))
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64
  const sm = d.slice(0)
  array.arraySet(sm, message, 64)
  const r = sha512.sha512(sm.slice(32))
  common.reduce(r)
  const p = [[], [], [], []]
  common.scalarbase(p, r)
  common.pack(sm, p)
  array.arraySet(sm, array.arraySlice(secretKey, 32), 32)
  const h = sha512.sha512(sm)
  common.reduce(h)
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      r[i + j] += h[i] * d[j]
    }
  }
  return array.arrayConcat(sm.slice(0, 32), common.modL(sm.slice(32), r).slice(0, 32))
}
/**
 * @param {ArrayLike<number>} signature
 * @param {ArrayLike<number>} message
 * @param {ArrayLike<number>} pubKey
 * @returns {boolean}
 * @private
 */
function verify (signature, message, pubKey) {
  const sm = []
  const t = []
  const p = [[], [], [], []]
  const q = [[], [], [], []]
  /* istanbul ignore if */
  if (!unpackneg(q, array.arraySlice(pubKey))) {
    return false
  }
  array.arraySet(sm, signature, 0)
  array.arraySet(sm, message, 64)
  const m = sm.slice(0)
  array.arraySet(m, pubKey, 32)
  const h = sha512.sha512(m)
  common.reduce(h)
  common.scalarmult(p, q, h)
  common.scalarbase(q, sm.slice(32))
  common.add(p, q)
  common.pack(t, p)
  return cryptoVerify32(sm, t)
}
/**
 * @param {number[][]} r
 * @param {number[]} p
 * @returns {boolean}
 * @private
 */
function unpackneg (r, p) {
  const t = []
  const chk = []
  const num = []
  const den = []
  const den2 = []
  const den4 = []
  const den6 = []
  array.arraySet(r[2], common.gf1)
  unpack25519(r[1], p)
  common.fnM(num, r[1], r[1])
  common.fnM(den, num, D)
  common.fnZ(num, num, r[2])
  common.fnA(den, r[2], den)
  common.fnM(den2, den, den)
  common.fnM(den4, den2, den2)
  common.fnM(den6, den4, den2)
  common.fnM(t, den6, num)
  common.fnM(t, t, den)
  pow2523(t, t)
  common.fnM(t, t, num)
  common.fnM(t, t, den)
  common.fnM(t, t, den)
  common.fnM(r[0], t, den)
  common.fnM(chk, r[0], r[0])
  common.fnM(chk, chk, den)
  if (!neq25519(chk, num)) {
    common.fnM(r[0], r[0], I)
  }
  common.fnM(chk, r[0], r[0])
  common.fnM(chk, chk, den)
  /* istanbul ignore if */
  if (!neq25519(chk, num)) {
    return false
  }
  if (common.par25519(r[0]) === (p[31] >> 7)) {
    common.fnZ(r[0], common.gf0, r[0])
  }
  common.fnM(r[3], r[0], r[1])
  return true
}
/**
 * @param {number[]} x
 * @param {number[]} y
 * @returns {boolean}
 * @private
 */
function cryptoVerify32 (x, y) {
  let d = 0
  for (let i = 0; i < 32; i++) {
    d |= x[i] ^ y[i]
  }
  return (1 & ((d - 1) >>> 8)) === 1
}
/**
 * @param {number[]} o
 * @param {number[]} n
 * @private
 */
function unpack25519 (o, n) {
  for (let i = 0; i < 16; i++) {
    o[i] = n[2 * i] + (n[2 * i + 1] << 8)
  }
  o[15] &= 0x7fff
}
/**
 * @param {number[]} o
 * @param {number[]} i
 * @private
 */
function pow2523 (o, i) {
  const c = []
  let a
  for (a = 0; a < 16; a++) {
    c[a] = i[a]
  }
  for (a = 250; a >= 0; a--) {
    common.fnM(c, c, c)
    if (a !== 1) {
      common.fnM(c, c, i)
    }
  }
  for (a = 0; a < 16; a++) {
    o[a] = c[a]
  }
}
/**
 * @param {number[]} a
 * @param {number[]} b
 * @throws {boolean}
 * @private
 */
function neq25519 (a, b) {
  const c = []
  const d = []
  common.pack25519(c, a)
  common.pack25519(d, b)
  return cryptoVerify32(c, d)
}

exports.secretKeyFromSeed = secretKeyFromSeed
exports.sign = sign
exports.verify = verify
