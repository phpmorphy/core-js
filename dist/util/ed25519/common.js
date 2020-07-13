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

const array = require('../array.js')

const gf0 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const gf1 = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const D2 = [
  0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0,
  0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406
]
const X = [
  0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c,
  0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169
]
const Y = [
  0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666,
  0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666
]
const L = [
  0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2,
  0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10
]
/**
 * @param {number[]} r
 * @private
 */
function reduce (r) {
  const x = r.slice(0)
  array.arrayFill(r, 64)
  modL(r, x)
}
/**
 * @param {number[]} r
 * @param {number[]} x
 * @returns {number[]}
 * @private
 */
function modL (r, x) {
  let carry
  let j
  let k
  for (let i = 63; i >= 32; --i) {
    carry = 0
    for (j = i - 32, k = i - 12; j < k; ++j) {
      x[j] += carry - 16 * x[i] * L[j - (i - 32)]
      carry = Math.floor((x[j] + 128) / 256)
      x[j] -= carry * 256
    }
    x[j] += carry
    x[i] = 0
  }
  return modLSub(r, x)
}
/**
 * @param {number[]} r
 * @param {number[]} x
 * @returns {number[]}
 * @private
 */
function modLSub (r, x) {
  let carry = 0
  let i
  for (i = 0; i < 32; i++) {
    x[i] += carry - (x[31] >> 4) * L[i]
    carry = x[i] >> 8
    x[i] &= 255
  }
  for (i = 0; i < 32; i++) {
    x[i] -= carry * L[i]
  }
  for (i = 0; i < 32; i++) {
    x[i + 1] += x[i] >> 8
    r[i] = x[i] & 255
  }
  return r
}
/**
 * @param {number[][]} p
 * @param {number[][]} q
 * @param {number[]} s
 * @private
 */
function scalarmult (p, q, s) {
  array.arraySet(p[0], gf0)
  array.arraySet(p[1], gf1)
  array.arraySet(p[2], gf1)
  array.arraySet(p[3], gf0)
  for (let i = 255; i >= 0; --i) {
    const b = (s[(i / 8) | 0] >> (i & 7)) & 1
    cswap(p, q, b)
    add(q, p)
    add(p, p)
    cswap(p, q, b)
  }
}
/**
 * @param {number[][]} p
 * @param {number[][]} q
 * @param {number} b
 * @private
 */
function cswap (p, q, b) {
  for (let i = 0; i < 4; i++) {
    sel25519(p[i], q[i], b)
  }
}
/**
 * @param {number[][]} p
 * @param {number[][]} q
 * @private
 */
function add (p, q) {
  const a = []
  const b = []
  const c = []
  const d = []
  const e = []
  const f = []
  const g = []
  const h = []
  const t = []
  fnZ(a, p[1], p[0])
  fnZ(t, q[1], q[0])
  fnM(a, a, t)
  fnA(b, p[0], p[1])
  fnA(t, q[0], q[1])
  fnM(b, b, t)
  fnM(c, p[3], q[3])
  fnM(c, c, D2)
  fnM(d, p[2], q[2])
  fnA(d, d, d)
  fnZ(e, b, a)
  fnZ(f, d, c)
  fnA(g, d, c)
  fnA(h, b, a)
  fnM(p[0], e, f)
  fnM(p[1], h, g)
  fnM(p[2], g, f)
  fnM(p[3], e, h)
}
/**
 * @param {number[]} o
 * @param {number[]} a
 * @param {number[]} b
 * @private
 */
function fnA (o, a, b) {
  for (let i = 0; i < 16; i++) {
    o[i] = a[i] + b[i]
  }
}
/**
 * @param {number[]} o
 * @param {number[]} a
 * @param {number[]} b
 * @private
 */
function fnM (o, a, b) {
  const t = array.arrayNew(31)
  let i
  for (i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      t[i + j] += a[i] * b[j]
    }
  }
  for (i = 0; i < 15; i++) {
    t[i] += 38 * t[i + 16]
  }
  array.arraySet(o, t, 0, 16)
  car25519(o)
  car25519(o)
}
/**
 * @param {number[]} o
 * @param {number[]} a
 * @param {number[]} b
 * @private
 */
function fnZ (o, a, b) {
  for (let i = 0; i < 16; i++) {
    o[i] = a[i] - b[i]
  }
}
/**
 * @param {number[][]} p
 * @param {number[]} s
 * @private
 */
function scalarbase (p, s) {
  const q = [[], [], [], []]
  array.arraySet(q[0], X)
  array.arraySet(q[1], Y)
  array.arraySet(q[2], gf1)
  fnM(q[3], X, Y)
  scalarmult(p, q, s)
}
/**
 * @param {number[]} o
 * @private
 */
function car25519 (o) {
  let c
  for (let i = 0; i < 16; i++) {
    o[i] += 65536
    c = (o[i] - (o[i] & 0xffff)) / 65536
    o[(i + 1) * (i < 15 ? 1 : 0)] += c - 1 + 37 * (c - 1) * (i === 15 ? 1 : 0)
    o[i] -= c * 65536
  }
}
/**
 * @param {number[]} r
 * @param {number[][]} p
 * @private
 */
function pack (r, p) {
  const tx = []
  const ty = []
  const zi = []
  inv25519(zi, p[2])
  fnM(tx, p[0], zi)
  fnM(ty, p[1], zi)
  pack25519(r, ty)
  r[31] ^= par25519(tx) << 7
}
/**
 * @param {number[]} a
 * @returns {number}
 * @private
 */
function par25519 (a) {
  const d = []
  pack25519(d, a)
  return d[0] & 1
}
/**
 * @param {number[]} o
 * @param {number[]} i
 * @private
 */
function inv25519 (o, i) {
  const c = []
  array.arraySet(c, i)
  for (let a = 253; a >= 0; a--) {
    fnM(c, c, c)
    if (a !== 2 && a !== 4) {
      fnM(c, c, i)
    }
  }
  array.arraySet(o, c)
}
/**
 * @param {number[]} p
 * @param {number[]} q
 * @param {number} b
 * @private
 */
function sel25519 (p, q, b) {
  const c = ~(b - 1)
  for (let i = 0; i < 16; i++) {
    const t = c & (p[i] ^ q[i])
    p[i] ^= t
    q[i] ^= t
  }
}
/**
 * @param {number[]} o
 * @param {number[]} n
 * @private
 */
function pack25519 (o, n) {
  const m = []
  const t = n.slice(0)
  car25519(t)
  car25519(t)
  car25519(t)
  let i
  for (let j = 0; j < 2; j++) {
    m[0] = t[0] - 0xffed
    for (i = 1; i < 15; i++) {
      m[i] = t[i] - 0xffff - ((m[i - 1] >> 16) & 1)
      m[i - 1] &= 0xffff
    }
    m[15] = t[15] - 0x7fff - ((m[14] >> 16) & 1)
    const b = (m[15] >> 16) & 1
    m[14] &= 0xffff
    sel25519(t, m, 1 - b)
  }
  for (i = 0; i < 16; i++) {
    o[2 * i] = t[i] & 0xff
    o[2 * i + 1] = t[i] >> 8
  }
}

exports.add = add
exports.car25519 = car25519
exports.fnA = fnA
exports.fnM = fnM
exports.fnZ = fnZ
exports.gf0 = gf0
exports.gf1 = gf1
exports.modL = modL
exports.pack = pack
exports.pack25519 = pack25519
exports.par25519 = par25519
exports.reduce = reduce
exports.scalarbase = scalarbase
exports.scalarmult = scalarmult
