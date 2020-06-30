// Copyright (c) 2020 UMI
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// tslint:disable:no-bitwise

/**
 * Безопасный алгоритм хеширования, SHA2-256.
 * @see https://en.wikipedia.org/wiki/SHA-2
 * @function
 * @param {Uint8Array} message message
 * @returns {Uint8Array} hash
 * @throws {Error}
 * @private
 */
function sha256 (message: Uint8Array): Uint8Array {
  const hh = new Int32Array([
    0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19])

  const k = new Int32Array([
    0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
    0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
    0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
    0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
    0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
    0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
    0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
    0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2])

  const w = new Int32Array(64)
  const h = new Int32Array(8)
  const q = new Int32Array(new ArrayBuffer(message.length + 8 + (64 - ((message.length + 8) % 64))))

  new Uint8Array(q.buffer).set(message)
  new DataView(q.buffer).setInt8(message.byteLength, 0x80)
  new DataView(q.buffer).setUint32(q.byteLength - 4, message.byteLength * 8)
  convertEndianness(q)

  for (let j = 0; j < q.length; j += 16) {
    h.set(hh)
    w.set(q.subarray(j))

    for (let i = 16; i < 64; i++) {
      const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3)
      const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10)
      w[i] = w[i - 16] + s0 + w[i - 7] + s1
    }

    shiftRegister(h, k, w)
    arraySum(hh, h)
  }

  return new Uint8Array(convertEndianness(hh))
}

function shiftRegister (h: Int32Array, k: Int32Array, w: Int32Array) {
  for (let i = 0; i < 64; i++) {
    const S0 = ((h[0] >>> 2) | (h[0] << 30)) ^ ((h[0] >>> 13) | (h[0] << 19)) ^ ((h[0] >>> 22) | (h[0] << 10))
    const Ma = (h[0] & h[1]) ^ (h[0] & h[2]) ^ (h[1] & h[2])
    const S1 = ((h[4] >>> 6) | (h[4] << 26)) ^ ((h[4] >>> 11) | (h[4] << 21)) ^ ((h[4] >>> 25) | (h[4] << 7))
    const t1 = h[7] + S1 + ((h[4] & h[5]) ^ ((~h[4]) & h[6])) + k[i] + w[i]
    h[7] = h[6]
    h[6] = h[5]
    h[5] = h[4]
    h[4] = h[3] + t1
    h[3] = h[2]
    h[2] = h[1]
    h[1] = h[0]
    h[0] = t1 + S0 + Ma
  }
}

function arraySum (a: Int32Array, b: Int32Array) {
  for (let i = 0; i < 8; i++) {
    a[i] += b[i]
  }
}

function convertEndianness (arr: Int32Array): ArrayBuffer {
  const d = new DataView(arr.buffer)
  for (let i = 0; i < arr.byteLength; i += 4) {
    d.setUint32(i, d.getUint32(i, true))
  }
  return d.buffer
}

export { sha256 }
