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
 * @function
 * @param {Uint8Array} message message
 * @returns {Uint8Array} hash
 * @throws {Error}
 */
function sha256 (message: Uint8Array): Uint8Array {
  if (message instanceof Uint8Array === false) {
    throw new Error('message must be Uint8Array')
  }

  const hh = new Int32Array([
    0x6A09E667,
    0xBB67AE85,
    0x3C6EF372,
    0xA54FF53A,
    0x510E527F,
    0x9B05688C,
    0x1F83D9AB,
    0x5BE0CD19])
  const k = new Int32Array([
    0x428A2F98,
    0x71374491,
    0xB5C0FBCF,
    0xE9B5DBA5,
    0x3956C25B,
    0x59F111F1,
    0x923F82A4,
    0xAB1C5ED5,
    0xD807AA98,
    0x12835B01,
    0x243185BE,
    0x550C7DC3,
    0x72BE5D74,
    0x80DEB1FE,
    0x9BDC06A7,
    0xC19BF174,
    0xE49B69C1,
    0xEFBE4786,
    0x0FC19DC6,
    0x240CA1CC,
    0x2DE92C6F,
    0x4A7484AA,
    0x5CB0A9DC,
    0x76F988DA,
    0x983E5152,
    0xA831C66D,
    0xB00327C8,
    0xBF597FC7,
    0xC6E00BF3,
    0xD5A79147,
    0x06CA6351,
    0x14292967,
    0x27B70A85,
    0x2E1B2138,
    0x4D2C6DFC,
    0x53380D13,
    0x650A7354,
    0x766A0ABB,
    0x81C2C92E,
    0x92722C85,
    0xA2BFE8A1,
    0xA81A664B,
    0xC24B8B70,
    0xC76C51A3,
    0xD192E819,
    0xD6990624,
    0xF40E3585,
    0x106AA070,
    0x19A4C116,
    0x1E376C08,
    0x2748774C,
    0x34B0BCB5,
    0x391C0CB3,
    0x4ED8AA4A,
    0x5B9CCA4F,
    0x682E6FF3,
    0x748F82EE,
    0x78A5636F,
    0x84C87814,
    0x8CC70208,
    0x90BEFFFA,
    0xA4506CEB,
    0xBEF9A3F7,
    0xC67178F2
  ])
  const w = new Int32Array(64)

  // padding
  let l
  if (message.byteLength < 56) {
    l = 64
  } else if (message.byteLength < 120) {
    l = 128
  } else if (message.byteLength < 184) {
    l = 192
  } else if (message.byteLength < 248) {
    l = 256
  } else {
    throw new Error('Максимальная длина сообщения 247 байт')
  }

  const m = new Uint8Array(l)
  const q = new DataView(m.buffer)

  m.set(message)
  m[message.byteLength] = 0x80

  q.setUint32(q.byteLength - 4, message.byteLength * 8)

  // chunks
  for (let j = 0; j < m.byteLength; j += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = q.getInt32(j + (i * 4))
    }

    for (let i = 16; i < 64; i++) {
      const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^
        ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3)
      const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^
        ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10)
      w[i] = w[i - 16] + s0 + w[i - 7] + s1
    }

    let a = hh[0]
    let b = hh[1]
    let c = hh[2]
    let d = hh[3]
    let e = hh[4]
    let f = hh[5]
    let g = hh[6]
    let h = hh[7]

    for (let i = 0; i < 64; i++) {
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^
        ((a >>> 22) | (a << 10))
      const Ma = (a & b) ^ (a & c) ^ (b & c)
      const t2 = S0 + Ma
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^
        ((e >>> 25) | (e << 7))
      const Ch = (e & f) ^ ((~e) & g)
      const t1 = h + S1 + Ch + k[i] + w[i]

      h = g
      g = f
      f = e
      e = d + t1
      d = c
      c = b
      b = a
      a = t1 + t2
    }

    hh[0] += a
    hh[1] += b
    hh[2] += c
    hh[3] += d
    hh[4] += e
    hh[5] += f
    hh[6] += g
    hh[7] += h
  }

  const hash = new DataView(hh.buffer)

  for (let i = 0; i < 8; i++) {
    hash.setUint32(i * 4, hh[i])
  }

  return new Uint8Array(hash.buffer)
}

export { sha256 }
