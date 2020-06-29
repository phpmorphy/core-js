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

/**
 * Цифровые подписи Ed25519.
 * Implementation derived from TweetNaCl version 20140427.
 * @see http://tweetnacl.cr.yp.to/
 * @class
 * @private
 */
class Ed25519 {
  constructor () {
    this._D = new Float64Array([
      0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070,
      0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203
    ])
    this._D2 = new Float64Array([
      0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0,
      0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406
    ])
    this._gf0 = new Float64Array(16)
    this._gf1 = new Float64Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    this._L = new Float64Array([
      0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2,
      0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10
    ])
    this._K = new Float64Array([
      0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd, 0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
      0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019, 0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
      0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe, 0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
      0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1, 0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
      0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3, 0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
      0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483, 0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
      0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210, 0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
      0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725, 0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
      0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926, 0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
      0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8, 0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
      0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001, 0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
      0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910, 0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
      0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53, 0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
      0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb, 0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
      0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60, 0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
      0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9, 0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
      0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207, 0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
      0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6, 0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
      0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493, 0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
      0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a, 0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
    ])
    this._I = new Float64Array([
      0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43,
      0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83
    ])
    this._X = new Float64Array([
      0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c,
      0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169
    ])
    this._Y = new Float64Array([
      0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666,
      0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666
    ])
  }

  /**
   * Длина публичного ключа в байтах.
   * @type {number}
   */
  static get PUBLIC_KEY_BYTES () { return 32 }
  /**
   * Длина приватного ключа в байтах.
   * @type {number}
   */
  static get SECRET_KEY_BYTES () { return 64 }
  /**
   * Длина seed в байтах.
   * @type {number}
   */
  static get SEED_BYTES () { return 32 }
  /**
   * Длина подписи в байтах.
   * @type {number}
   */
  static get SIGNATURE_BYTES () { return 64 }
  /**
   * Подписать сообщение.
   * @param {Uint8Array} message
   * @param {Uint8Array} secretKey
   * @returns {Uint8Array}
   * @throws {Error}
   */
  sign (message, secretKey) {
    const signedMsg = new Uint8Array(Ed25519.SIGNATURE_BYTES + message.length)
    this._cryptoSign(signedMsg, message, message.length, secretKey)
    return new Uint8Array(signedMsg.buffer, 0, Ed25519.SIGNATURE_BYTES)
  }

  /**
   * Проверить подпись.
   * @param {Uint8Array} message
   * @param {Uint8Array} signature
   * @param {Uint8Array} publicKey
   * @returns {boolean}
   */
  verify (signature, message, publicKey) {
    const sm = new Uint8Array(64 + message.byteLength)
    const m = new Uint8Array(64 + message.byteLength)
    sm.set(signature)
    sm.set(message, 64)
    m.set(sm)
    return (this._cryptoSignOpen(m, sm, sm.byteLength, publicKey) >= 0)
  }

  /**
   * Получить приватный ключ из seed.
   * @param {Uint8Array} seed
   * @returns {Uint8Array}
   */
  secretKeyFromSeed (seed) {
    const pk = new Uint8Array(32)
    const sk = new Uint8Array(64)
    sk.set(seed)
    this._cryptoSignKeypair(pk, sk)
    return sk
  }

  /**
   * Получить публичный ключ из приватного ключа.
   * @param {Uint8Array} secretKey
   * @returns {Uint8Array}
   */
  publicKeyFromSecretKey (secretKey) {
    const b = new Uint8Array(Ed25519.PUBLIC_KEY_BYTES)
    b.set(new Uint8Array(secretKey.buffer, 32, 32))
    return b
  }

  /**
   * @param {Float64Array[]} p
   * @param {Float64Array[]} q
   * @private
   */
  _add (p, q) {
    const a = new Float64Array(16)
    const b = new Float64Array(16)
    const c = new Float64Array(16)
    const d = new Float64Array(16)
    const e = new Float64Array(16)
    const f = new Float64Array(16)
    const g = new Float64Array(16)
    const h = new Float64Array(16)
    const t = new Float64Array(16)
    this._fnZ(a, p[1], p[0])
    this._fnZ(t, q[1], q[0])
    this._fnM(a, a, t)
    this._fnA(b, p[0], p[1])
    this._fnA(t, q[0], q[1])
    this._fnM(b, b, t)
    this._fnM(c, p[3], q[3])
    this._fnM(c, c, this._D2)
    this._fnM(d, p[2], q[2])
    this._fnA(d, d, d)
    this._fnZ(e, b, a)
    this._fnZ(f, d, c)
    this._fnA(g, d, c)
    this._fnA(h, b, a)
    this._fnM(p[0], e, f)
    this._fnM(p[1], h, g)
    this._fnM(p[2], g, f)
    this._fnM(p[3], e, h)
  }

  /**
   * @param {Float64Array} o
   * @private
   */
  _car25519 (o) {
    let v
    let c = 1
    for (let i = 0; i < 16; i++) {
      v = o[i] + c + 65535
      c = Math.floor(v / 65536)
      o[i] = v - c * 65536
    }
    o[0] += c - 1 + 37 * (c - 1)
  }

  /**
   * @param {Uint8Array} out
   * @param {Uint8Array} m
   * @param {number} n
   * @private
   */
  _cryptoHash (out, m, n) {
    const hh = new Int32Array(8)
    const hl = new Int32Array(8)
    const x = new Uint8Array(256)
    let i
    const b = n
    hh[0] = 0x6a09e667
    hh[1] = 0xbb67ae85
    hh[2] = 0x3c6ef372
    hh[3] = 0xa54ff53a
    hh[4] = 0x510e527f
    hh[5] = 0x9b05688c
    hh[6] = 0x1f83d9ab
    hh[7] = 0x5be0cd19
    hl[0] = 0xf3bcc908
    hl[1] = 0x84caa73b
    hl[2] = 0xfe94f82b
    hl[3] = 0x5f1d36f1
    hl[4] = 0xade682d1
    hl[5] = 0x2b3e6c1f
    hl[6] = 0xfb41bd6b
    hl[7] = 0x137e2179
    this._cryptoHashBlocksHl(hh, hl, m, n)
    n %= 128
    for (i = 0; i < n; i++) {
      x[i] = m[b - n + i]
    }
    x[n] = 128
    n = 256 - 128 * (n < 112 ? 1 : 0)
    x[n - 9] = 0
    this._ts64(x, n - 8, (b / 0x20000000) | 0, b << 3)
    this._cryptoHashBlocksHl(hh, hl, x, n)
    for (i = 0; i < 8; i++) {
      this._ts64(out, 8 * i, hh[i], hl[i])
    }
    return 0
  }

  /**
   * @param {Int32Array} hh
   * @param {Int32Array} hl
   * @param {Uint8Array} m
   * @param {number} n
   * @private
   */
  _cryptoHashBlocksHl (hh, hl, m, n) {
    const wh = new Int32Array(16)
    const wl = new Int32Array(16)
    let bh0
    let bh1
    let bh2
    let bh3
    let bh4
    let bh5
    let bh6
    let bh7
    let bl0
    let bl1
    let bl2
    let bl3
    let bl4
    let bl5
    let bl6
    let bl7
    let th
    let tl
    let i
    let j
    let h
    let l
    let a
    let b
    let c
    let d
    let ah0 = hh[0]
    let ah1 = hh[1]
    let ah2 = hh[2]
    let ah3 = hh[3]
    let ah4 = hh[4]
    let ah5 = hh[5]
    let ah6 = hh[6]
    let ah7 = hh[7]
    let al0 = hl[0]
    let al1 = hl[1]
    let al2 = hl[2]
    let al3 = hl[3]
    let al4 = hl[4]
    let al5 = hl[5]
    let al6 = hl[6]
    let al7 = hl[7]
    let pos = 0
    while (n >= 128) {
      for (i = 0; i < 16; i++) {
        j = 8 * i + pos
        wh[i] = (m[j + 0] << 24) | (m[j + 1] << 16) | (m[j + 2] << 8) | m[j + 3]
        wl[i] = (m[j + 4] << 24) | (m[j + 5] << 16) | (m[j + 6] << 8) | m[j + 7]
      }
      for (i = 0; i < 80; i++) {
        bh0 = ah0
        bh1 = ah1
        bh2 = ah2
        bh3 = ah3
        bh4 = ah4
        bh5 = ah5
        bh6 = ah6
        bh7 = ah7
        bl0 = al0
        bl1 = al1
        bl2 = al2
        bl3 = al3
        bl4 = al4
        bl5 = al5
        bl6 = al6
        bl7 = al7
        h = ah7
        l = al7
        a = l & 0xffff
        b = l >>> 16
        c = h & 0xffff
        d = h >>> 16
        h = ((ah4 >>> 14) | (al4 << (32 - 14))) ^
          ((ah4 >>> 18) | (al4 << (32 - 18))) ^
          ((al4 >>> (41 - 32)) | (ah4 << (32 - (41 - 32))))
        l = ((al4 >>> 14) | (ah4 << (32 - 14))) ^
          ((al4 >>> 18) | (ah4 << (32 - 18))) ^
          ((ah4 >>> (41 - 32)) | (al4 << (32 - (41 - 32))))
        a += l & 0xffff
        b += l >>> 16
        c += h & 0xffff
        d += h >>> 16
        h = (ah4 & ah5) ^ (~ah4 & ah6)
        l = (al4 & al5) ^ (~al4 & al6)
        a += l & 0xffff
        b += l >>> 16
        c += h & 0xffff
        d += h >>> 16
        h = this._K[i * 2]
        l = this._K[i * 2 + 1]
        a += l & 0xffff
        b += l >>> 16
        c += h & 0xffff
        d += h >>> 16
        h = wh[i % 16]
        l = wl[i % 16]
        a += l & 0xffff
        b += l >>> 16
        c += h & 0xffff
        d += h >>> 16
        b += a >>> 16
        c += b >>> 16
        d += c >>> 16
        th = c & 0xffff | d << 16
        tl = a & 0xffff | b << 16
        h = th
        l = tl
        a = l & 0xffff
        b = l >>> 16
        c = h & 0xffff
        d = h >>> 16
        h = ((ah0 >>> 28) | (al0 << (32 - 28))) ^
          ((al0 >>> (34 - 32)) | (ah0 << (32 - (34 - 32)))) ^
          ((al0 >>> (39 - 32)) | (ah0 << (32 - (39 - 32))))
        l = ((al0 >>> 28) | (ah0 << (32 - 28))) ^
          ((ah0 >>> (34 - 32)) | (al0 << (32 - (34 - 32)))) ^
          ((ah0 >>> (39 - 32)) | (al0 << (32 - (39 - 32))))
        a += l & 0xffff
        b += l >>> 16
        c += h & 0xffff
        d += h >>> 16
        h = (ah0 & ah1) ^ (ah0 & ah2) ^ (ah1 & ah2)
        l = (al0 & al1) ^ (al0 & al2) ^ (al1 & al2)
        a += l & 0xffff
        b += l >>> 16
        c += h & 0xffff
        d += h >>> 16
        b += a >>> 16
        c += b >>> 16
        d += c >>> 16
        bh7 = (c & 0xffff) | (d << 16)
        bl7 = (a & 0xffff) | (b << 16)
        h = bh3
        l = bl3
        a = l & 0xffff
        b = l >>> 16
        c = h & 0xffff
        d = h >>> 16
        h = th
        l = tl
        a += l & 0xffff
        b += l >>> 16
        c += h & 0xffff
        d += h >>> 16
        b += a >>> 16
        c += b >>> 16
        d += c >>> 16
        bh3 = (c & 0xffff) | (d << 16)
        bl3 = (a & 0xffff) | (b << 16)
        ah1 = bh0
        ah2 = bh1
        ah3 = bh2
        ah4 = bh3
        ah5 = bh4
        ah6 = bh5
        ah7 = bh6
        ah0 = bh7
        al1 = bl0
        al2 = bl1
        al3 = bl2
        al4 = bl3
        al5 = bl4
        al6 = bl5
        al7 = bl6
        al0 = bl7
        if (i % 16 === 15) {
          for (j = 0; j < 16; j++) {
            h = wh[j]
            l = wl[j]
            a = l & 0xffff
            b = l >>> 16
            c = h & 0xffff
            d = h >>> 16
            h = wh[(j + 9) % 16]
            l = wl[(j + 9) % 16]
            a += l & 0xffff
            b += l >>> 16
            c += h & 0xffff
            d += h >>> 16
            th = wh[(j + 1) % 16]
            tl = wl[(j + 1) % 16]
            h = ((th >>> 1) | (tl << (32 - 1))) ^
              ((th >>> 8) | (tl << (32 - 8))) ^ (th >>> 7)
            l = ((tl >>> 1) | (th << (32 - 1))) ^
              ((tl >>> 8) | (th << (32 - 8))) ^ ((tl >>> 7) | (th << (32 - 7)))
            a += l & 0xffff
            b += l >>> 16
            c += h & 0xffff
            d += h >>> 16
            th = wh[(j + 14) % 16]
            tl = wl[(j + 14) % 16]
            h = ((th >>> 19) | (tl << (32 - 19))) ^
              ((tl >>> (61 - 32)) | (th << (32 - (61 - 32)))) ^ (th >>> 6)
            l = ((tl >>> 19) | (th << (32 - 19))) ^
              ((th >>> (61 - 32)) | (tl << (32 - (61 - 32)))) ^
              ((tl >>> 6) | (th << (32 - 6)))
            a += l & 0xffff
            b += l >>> 16
            c += h & 0xffff
            d += h >>> 16
            b += a >>> 16
            c += b >>> 16
            d += c >>> 16
            wh[j] = (c & 0xffff) | (d << 16)
            wl[j] = (a & 0xffff) | (b << 16)
          }
        }
      }
      h = ah0
      l = al0
      a = l & 0xffff
      b = l >>> 16
      c = h & 0xffff
      d = h >>> 16
      h = hh[0]
      l = hl[0]
      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16
      b += a >>> 16
      c += b >>> 16
      d += c >>> 16
      hh[0] = ah0 = (c & 0xffff) | (d << 16)
      hl[0] = al0 = (a & 0xffff) | (b << 16)
      h = ah1
      l = al1
      a = l & 0xffff
      b = l >>> 16
      c = h & 0xffff
      d = h >>> 16
      h = hh[1]
      l = hl[1]
      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16
      b += a >>> 16
      c += b >>> 16
      d += c >>> 16
      hh[1] = ah1 = (c & 0xffff) | (d << 16)
      hl[1] = al1 = (a & 0xffff) | (b << 16)
      h = ah2
      l = al2
      a = l & 0xffff
      b = l >>> 16
      c = h & 0xffff
      d = h >>> 16
      h = hh[2]
      l = hl[2]
      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16
      b += a >>> 16
      c += b >>> 16
      d += c >>> 16
      hh[2] = ah2 = (c & 0xffff) | (d << 16)
      hl[2] = al2 = (a & 0xffff) | (b << 16)
      h = ah3
      l = al3
      a = l & 0xffff
      b = l >>> 16
      c = h & 0xffff
      d = h >>> 16
      h = hh[3]
      l = hl[3]
      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16
      b += a >>> 16
      c += b >>> 16
      d += c >>> 16
      hh[3] = ah3 = (c & 0xffff) | (d << 16)
      hl[3] = al3 = (a & 0xffff) | (b << 16)
      h = ah4
      l = al4
      a = l & 0xffff
      b = l >>> 16
      c = h & 0xffff
      d = h >>> 16
      h = hh[4]
      l = hl[4]
      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16
      b += a >>> 16
      c += b >>> 16
      d += c >>> 16
      hh[4] = ah4 = (c & 0xffff) | (d << 16)
      hl[4] = al4 = (a & 0xffff) | (b << 16)
      h = ah5
      l = al5
      a = l & 0xffff
      b = l >>> 16
      c = h & 0xffff
      d = h >>> 16
      h = hh[5]
      l = hl[5]
      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16
      b += a >>> 16
      c += b >>> 16
      d += c >>> 16
      hh[5] = ah5 = (c & 0xffff) | (d << 16)
      hl[5] = al5 = (a & 0xffff) | (b << 16)
      h = ah6
      l = al6
      a = l & 0xffff
      b = l >>> 16
      c = h & 0xffff
      d = h >>> 16
      h = hh[6]
      l = hl[6]
      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16
      b += a >>> 16
      c += b >>> 16
      d += c >>> 16
      hh[6] = ah6 = (c & 0xffff) | (d << 16)
      hl[6] = al6 = (a & 0xffff) | (b << 16)
      h = ah7
      l = al7
      a = l & 0xffff
      b = l >>> 16
      c = h & 0xffff
      d = h >>> 16
      h = hh[7]
      l = hl[7]
      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16
      b += a >>> 16
      c += b >>> 16
      d += c >>> 16
      hh[7] = ah7 = (c & 0xffff) | (d << 16)
      hl[7] = al7 = (a & 0xffff) | (b << 16)
      pos += 128
      n -= 128
    }
    return n
  }

  /**
   * Note: difference from C - smlen returned, not passed as argument.
   * @param {Uint8Array} sm
   * @param {Uint8Array} m
   * @param {number} n
   * @param {Uint8Array} sk
   * @private
   */
  _cryptoSign (sm, m, n, sk) {
    const d = new Uint8Array(64)
    const h = new Uint8Array(64)
    const r = new Uint8Array(64)
    let i
    let j
    const x = new Float64Array(64)
    const p = [
      new Float64Array(16),
      new Float64Array(16),
      new Float64Array(16),
      new Float64Array(16)
    ]
    this._cryptoHash(d, sk, 32)
    d[0] &= 248
    d[31] &= 127
    d[31] |= 64
    sm.set(m, 64)
    sm.set(d.subarray(32), 32)
    this._cryptoHash(r, sm.subarray(32), n + 32)
    this._reduce(r)
    this._scalarbase(p, r)
    this._pack(sm, p)
    sm.set(sk.subarray(32), 32)
    this._cryptoHash(h, sm, n + 64)
    this._reduce(h)
    x.set(r)
    for (i = 0; i < 32; i++) {
      for (j = 0; j < 32; j++) {
        x[i + j] += h[i] * d[j]
      }
    }
    this._modL(sm.subarray(32), x)
  }

  /**
   * @param {Uint8Array} pk
   * @param {Uint8Array} sk
   * @private
   */
  _cryptoSignKeypair (pk, sk) {
    const d = new Uint8Array(64)
    const p = [
      new Float64Array(16), new Float64Array(16),
      new Float64Array(16), new Float64Array(16)
    ]
    this._cryptoHash(d, sk, 32)
    d[0] &= 248
    d[31] &= 127
    d[31] |= 64
    this._scalarbase(p, d)
    this._pack(pk, p)
    sk.set(pk, 32)
    return 0
  }

  /**
   * @param {Uint8Array} m
   * @param {Uint8Array} sm
   * @param {number} n
   * @param {Uint8Array} pk
   * @private
   */
  _cryptoSignOpen (m, sm, n, pk) {
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
    if (this._unpackneg(q, pk)) {
      return -1
    }
    m.set(sm)
    m.set(pk, 32)
    this._cryptoHash(h, m, n)
    this._reduce(h)
    this._scalarmult(p, q, h)
    this._scalarbase(q, sm.subarray(32))
    this._add(p, q)
    this._pack(t, p)
    if (this._cryptoVerify32(sm, t)) {
      return -1
    }
    return n
  }

  /**
   * @param {Uint8Array} x
   * @param {number} xi
   * @param {Uint8Array} y
   * @param {number} yi
   * @private
   */
  _cryptoVerify32 (x, y) {
    let d = 0
    for (let i = 0; i < 32; i++) {
      d |= x[i] ^ y[i]
    }
    return (1 & ((d - 1) >>> 8)) - 1
  }

  /**
   * @param {Float64Array[]} p
   * @param {Float64Array[]} q
   * @param {number} b
   * @private
   */
  _cswap (p, q, b) {
    for (let i = 0; i < 4; i++) {
      this._sel25519(p[i], q[i], b)
    }
  }

  /**
   * @param {Float64Array} o
   * @param {Float64Array} a
   * @param {Float64Array} b
   * @private
   */
  _fnA (o, a, b) {
    for (let i = 0; i < 16; i++) {
      o[i] = a[i] + b[i]
    }
  }

  /**
   * @param {Float64Array} o
   * @param {Float64Array} a
   * @param {Float64Array} b
   * @private
   */
  _fnM (o, a, b) {
    const t = new Float64Array(31)
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        t[i + j] += a[i] * b[j]
      }
    }
    for (let i = 0; i < 15; i++) {
      t[i] += 38 * t[i + 16]
    }
    o.set(t.slice(0, 16))
    this._car25519(o)
    this._car25519(o)
  }

  /**
   * @param {Float64Array} o
   * @param {Float64Array} a
   * @private
   */
  _fnS (o, a) {
    this._fnM(o, a, a)
  }

  /**
   * @param {Float64Array} o
   * @param {Float64Array} a
   * @param {Float64Array} b
   * @private
   */
  _fnZ (o, a, b) {
    for (let i = 0; i < 16; i++) {
      o[i] = a[i] - b[i]
    }
  }

  /**
   * @param {Float64Array} o
   * @param {Float64Array} i
   * @private
   */
  _inv25519 (o, i) {
    const c = new Float64Array(16)
    c.set(i)
    for (let a = 253; a >= 0; a--) {
      this._fnS(c, c)
      if (a !== 2 && a !== 4) {
        this._fnM(c, c, i)
      }
    }
    o.set(c)
  }

  /**
   * @param {Uint8Array} r
   * @param {Float64Array} x
   * @private
   */
  _modL (r, x) {
    let carry
    let j
    let k
    for (let i = 63; i >= 32; --i) {
      carry = 0
      for (j = i - 32, k = i - 12; j < k; ++j) {
        x[j] += carry - 16 * x[i] * this._L[j - (i - 32)]
        carry = Math.floor((x[j] + 128) / 256)
        x[j] -= carry * 256
      }
      x[j] += carry
      x[i] = 0
    }
    carry = 0
    for (let j = 0; j < 32; j++) {
      x[j] += carry - (x[31] >> 4) * this._L[j]
      carry = x[j] >> 8
      x[j] &= 255
    }
    for (let j = 0; j < 32; j++) {
      x[j] -= carry * this._L[j]
    }
    for (let i = 0; i < 32; i++) {
      x[i + 1] += x[i] >> 8
      r[i] = x[i] & 255
    }
  }

  /**
   * @param {Float64Array} a
   * @param {Float64Array} b
   * @private
   */
  _neq25519 (a, b) {
    const c = new Uint8Array(32)
    const d = new Uint8Array(32)
    this._pack25519(c, a)
    this._pack25519(d, b)
    return this._cryptoVerify32(c, d)
  }

  /**
   * @param {Uint8Array} r
   * @param {Float64Array[]} p
   * @private
   */
  _pack (r, p) {
    const tx = new Float64Array(16)
    const ty = new Float64Array(16)
    const zi = new Float64Array(16)
    this._inv25519(zi, p[2])
    this._fnM(tx, p[0], zi)
    this._fnM(ty, p[1], zi)
    this._pack25519(r, ty)
    r[31] ^= this._par25519(tx) << 7
  }

  /**
   * @param {Uint8Array} o
   * @param {Float64Array} n
   * @private
   */
  _pack25519 (o, n) {
    let b
    const m = new Float64Array(16)
    const t = new Float64Array(16)
    t.set(n)
    this._car25519(t)
    this._car25519(t)
    this._car25519(t)
    for (let j = 0; j < 2; j++) {
      m[0] = t[0] - 0xffed
      for (let i = 1; i < 15; i++) {
        m[i] = t[i] - 0xffff - ((m[i - 1] >> 16) & 1)
        m[i - 1] &= 0xffff
      }
      m[15] = t[15] - 0x7fff - ((m[14] >> 16) & 1)
      b = (m[15] >> 16) & 1
      m[14] &= 0xffff
      this._sel25519(t, m, 1 - b)
    }
    for (let i = 0; i < 16; i++) {
      o[2 * i] = t[i] & 0xff
      o[2 * i + 1] = t[i] >> 8
    }
  }

  /**
   * @param {Float64Array} a
   * @private
   */
  _par25519 (a) {
    const d = new Uint8Array(32)
    this._pack25519(d, a)
    return d[0] & 1
  }

  /**
   * @param {Float64Array} o
   * @param {Float64Array} i
   * @private
   */
  _pow2523 (o, i) {
    const c = new Float64Array(16)
    c.set(i)
    for (let a = 250; a >= 0; a--) {
      this._fnS(c, c)
      if (a !== 1) {
        this._fnM(c, c, i)
      }
    }
    o.set(c)
  }

  /**
   * @param {Uint8Array} r
   * @private
   */
  _reduce (r) {
    const x = new Float64Array(64)
    x.set(r)
    r.set(new Float64Array(64))
    this._modL(r, x)
  }

  /**
   * @param {Float64Array[]} p
   * @param {Uint8Array} s
   * @private
   */
  _scalarbase (p, s) {
    const q = [
      new Float64Array(16), new Float64Array(16),
      new Float64Array(16), new Float64Array(16)
    ]
    this._set25519(q[0], this._X)
    this._set25519(q[1], this._Y)
    this._set25519(q[2], this._gf1)
    this._fnM(q[3], this._X, this._Y)
    this._scalarmult(p, q, s)
  }

  /**
   * @param {Float64Array[]} p
   * @param {Float64Array[]} q
   * @param {Uint8Array} s
   * @private
   */
  _scalarmult (p, q, s) {
    let b
    this._set25519(p[0], this._gf0)
    this._set25519(p[1], this._gf1)
    this._set25519(p[2], this._gf1)
    this._set25519(p[3], this._gf0)
    for (let i = 255; i >= 0; --i) {
      b = (s[(i / 8) | 0] >> (i & 7)) & 1
      this._cswap(p, q, b)
      this._add(q, p)
      this._add(p, p)
      this._cswap(p, q, b)
    }
  }

  /**
   * @param {Float64Array} p
   * @param {Float64Array} q
   * @param {number} b
   * @private
   */
  _sel25519 (p, q, b) {
    let t
    const c = ~(b - 1)
    for (let i = 0; i < 16; i++) {
      t = c & (p[i] ^ q[i])
      p[i] ^= t
      q[i] ^= t
    }
  }

  /**
   * @param {Float64Array} r
   * @param {Float64Array} a
   * @private
   */
  _set25519 (r, a) {
    r.set(a)
  }

  /**
   * @param {Uint8Array} x
   * @param {number} i
   * @param {number} h
   * @param {number} l
   * @private
   */
  _ts64 (x, i, h, l) {
    x[i] = (h >> 24) & 0xff
    x[i + 1] = (h >> 16) & 0xff
    x[i + 2] = (h >> 8) & 0xff
    x[i + 3] = h & 0xff
    x[i + 4] = (l >> 24) & 0xff
    x[i + 5] = (l >> 16) & 0xff
    x[i + 6] = (l >> 8) & 0xff
    x[i + 7] = l & 0xff
  }

  /**
   * @param {Float64Array} o
   * @param {Uint8Array} n
   * @private
   */
  _unpack25519 (o, n) {
    for (let i = 0; i < 16; i++) {
      o[i] = n[2 * i] + (n[2 * i + 1] << 8)
    }
    o[15] &= 0x7fff
  }

  /**
   * @param {Float64Array[]} r
   * @param {Uint8Array} p
   * @private
   */
  _unpackneg (r, p) {
    const t = new Float64Array(16)
    const chk = new Float64Array(16)
    const num = new Float64Array(16)
    const den = new Float64Array(16)
    const den2 = new Float64Array(16)
    const den4 = new Float64Array(16)
    const den6 = new Float64Array(16)
    this._set25519(r[2], this._gf1)
    this._unpack25519(r[1], p)
    this._fnS(num, r[1])
    this._fnM(den, num, this._D)
    this._fnZ(num, num, r[2])
    this._fnA(den, r[2], den)
    this._fnS(den2, den)
    this._fnS(den4, den2)
    this._fnM(den6, den4, den2)
    this._fnM(t, den6, num)
    this._fnM(t, t, den)
    this._pow2523(t, t)
    this._fnM(t, t, num)
    this._fnM(t, t, den)
    this._fnM(t, t, den)
    this._fnM(r[0], t, den)
    this._fnS(chk, r[0])
    this._fnM(chk, chk, den)
    if (this._neq25519(chk, num)) {
      this._fnM(r[0], r[0], this._I)
    }
    this._fnS(chk, r[0])
    this._fnM(chk, chk, den)
    /* istanbul ignore if */
    if (this._neq25519(chk, num)) {
      return -1
    }
    if (this._par25519(r[0]) === (p[31] >> 7)) {
      this._fnZ(r[0], this._gf0, r[0])
    }
    this._fnM(r[3], r[0], r[1])
    return 0
  }
}

exports.Ed25519 = Ed25519
