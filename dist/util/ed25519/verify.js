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

function verify (signature, message, publicKey) {
  const sm = new Uint8Array(64 + message.byteLength)
  const m = new Uint8Array(64 + message.byteLength)
  sm.set(signature)
  sm.set(message, 64)
  m.set(sm)
  return (cryptoSignOpen(m, sm, sm.byteLength, publicKey) >= 0)
}
/**
 * @param {Uint8Array} m
 * @param {Uint8Array} sm
 * @param {number} n
 * @param {Uint8Array} pk
 * @private
 */
function cryptoSignOpen (m, sm, n, pk) {
  const t = new Uint8Array(32)
  const h = new Uint8Array(64)
  const p = [
    new Float64Array(16), new Float64Array(16),
    new Float64Array(16), new Float64Array(16)
  ]
  const q = [
    new Float64Array(16), new Float64Array(16),
    new Float64Array(16), new Float64Array(16)
  ]
  /* istanbul ignore if */
  if (unpackneg(q, pk)) {
    return -1
  }
  m.set(sm)
  m.set(pk, 32)
  sha512.cryptoHash(h, m, n)
  common.reduce(h)
  common.scalarmult(p, q, h)
  common.scalarbase(q, sm.subarray(32))
  common.add(p, q)
  common.pack(t, p)
  if (cryptoVerify32(sm, t)) {
    return -1
  }
  return n
}
/**
 * @param {Float64Array[]} r
 * @param {Uint8Array} p
 * @private
 */
function unpackneg (r, p) {
  const t = new Float64Array(16)
  const chk = new Float64Array(16)
  const num = new Float64Array(16)
  const den = new Float64Array(16)
  const den2 = new Float64Array(16)
  const den4 = new Float64Array(16)
  const den6 = new Float64Array(16)
  common.set25519(r[2], common.gf1)
  unpack25519(r[1], p)
  common.fnS(num, r[1])
  common.fnM(den, num, common.D)
  common.fnZ(num, num, r[2])
  common.fnA(den, r[2], den)
  common.fnS(den2, den)
  common.fnS(den4, den2)
  common.fnM(den6, den4, den2)
  common.fnM(t, den6, num)
  common.fnM(t, t, den)
  pow2523(t, t)
  common.fnM(t, t, num)
  common.fnM(t, t, den)
  common.fnM(t, t, den)
  common.fnM(r[0], t, den)
  common.fnS(chk, r[0])
  common.fnM(chk, chk, den)
  if (neq25519(chk, num)) {
    common.fnM(r[0], r[0], common.I)
  }
  common.fnS(chk, r[0])
  common.fnM(chk, chk, den)
  /* istanbul ignore if */
  if (neq25519(chk, num)) {
    return -1
  }
  if (common.par25519(r[0]) === (p[31] >> 7)) {
    common.fnZ(r[0], common.gf0, r[0])
  }
  common.fnM(r[3], r[0], r[1])
  return 0
}
/**
 * @param {Uint8Array} x
 * @param {number} xi
 * @param {Uint8Array} y
 * @param {number} yi
 * @private
 */
function cryptoVerify32 (x, y) {
  let d = 0
  for (let i = 0; i < 32; i++) {
    d |= x[i] ^ y[i]
  }
  return (1 & ((d - 1) >>> 8)) - 1
}
/**
 * @param {Float64Array} o
 * @param {Uint8Array} n
 * @private
 */
function unpack25519 (o, n) {
  for (let i = 0; i < 16; i++) {
    o[i] = n[2 * i] + (n[2 * i + 1] << 8)
  }
  o[15] &= 0x7fff
}
/**
 * @param {Float64Array} o
 * @param {Float64Array} i
 * @private
 */
function pow2523 (o, i) {
  const c = new Float64Array(16)
  c.set(i)
  for (let a = 250; a >= 0; a--) {
    common.fnS(c, c)
    if (a !== 1) {
      common.fnM(c, c, i)
    }
  }
  o.set(c)
}
/**
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @private
 */
function neq25519 (a, b) {
  const c = new Uint8Array(32)
  const d = new Uint8Array(32)
  common.pack25519(c, a)
  common.pack25519(d, b)
  return cryptoVerify32(c, d)
}

exports.verify = verify
