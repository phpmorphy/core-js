
const K = new Float64Array([
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
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a, 0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817])

/**
 * @param {Uint8Array} out
 * @param {Uint8Array} m
 * @param {number} n
 * @private
 * @internal
 */
function cryptoHash (out: Uint8Array, m: Uint8Array, n: number): number {
  const hh = new Int32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19])
  const hl = new Int32Array([
    0xf3bcc908, 0x84caa73b, 0xfe94f82b, 0x5f1d36f1, 0xade682d1, 0x2b3e6c1f, 0xfb41bd6b, 0x137e2179])
  const x = new Uint8Array(256)
  let i
  const b = n

  cryptoHashBlocksHl(hh, hl, m, n)
  n %= 128

  for (i = 0; i < n; i++) {
    x[i] = m[b - n + i]
  }

  x[n] = 128

  n = 256 - 128 * (n < 112 ? 1 : 0)
  x[n - 9] = 0
  ts64(x, n - 8, (b / 0x20000000) | 0, b << 3)
  cryptoHashBlocksHl(hh, hl, x, n)

  for (i = 0; i < 8; i++) {
    ts64(out, 8 * i, hh[i], hl[i])
  }

  return 0
}

/**
 * @param {Int32Array} hh
 * @param {Int32Array} hl
 * @param {Uint8Array} m
 * @param {number} n
 * @private
 * @internal
 */
function cryptoHashBlocksHl (hh: Int32Array, hl: Int32Array, m: Uint8Array, n: number): number {
  const wh = new Int32Array(16)
  const wl = new Int32Array(16)
  const bh = new Int32Array(8)
  const bl = new Int32Array(8)

  let th
  let tl

  // let i
  // let j
  let h
  let l

  let a
  let b
  let c
  let d

  const ah = new Int32Array(8)
  ah.set(hh)

  const al = new Int32Array(8)
  al.set(hl)

  let pos = 0
  while (n >= 128) {
    for (let i = 0; i < 16; i++) {
      const j = 8 * i + pos
      wh[i] = (m[j] << 24) | (m[j + 1] << 16) | (m[j + 2] << 8) | m[j + 3]
      wl[i] = (m[j + 4] << 24) | (m[j + 5] << 16) | (m[j + 6] << 8) | m[j + 7]
    }
    for (let i = 0; i < 80; i++) {
      bh.set(ah)
      bl.set(al)

      // add
      h = ah[7]
      l = al[7]

      a = l & 0xffff
      b = l >>> 16
      c = h & 0xffff
      d = h >>> 16

      // Sigma1
      h = ((ah[4] >>> 14) | (al[4] << (32 - 14))) ^
        ((ah[4] >>> 18) | (al[4] << (32 - 18))) ^
        ((al[4] >>> (41 - 32)) | (ah[4] << (32 - (41 - 32))))
      l = ((al[4] >>> 14) | (ah[4] << (32 - 14))) ^
        ((al[4] >>> 18) | (ah[4] << (32 - 18))) ^
        ((ah[4] >>> (41 - 32)) | (al[4] << (32 - (41 - 32))))

      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16

      // Ch
      h = (ah[4] & ah[5]) ^ (~ah[4] & ah[6])
      l = (al[4] & al[5]) ^ (~al[4] & al[6])

      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16

      // K
      h = K[i * 2]
      l = K[i * 2 + 1]

      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16

      // w
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

      // add
      h = th
      l = tl

      a = l & 0xffff
      b = l >>> 16
      c = h & 0xffff
      d = h >>> 16

      // Sigma0
      h = ((ah[0] >>> 28) | (al[0] << (32 - 28))) ^
        ((al[0] >>> (34 - 32)) | (ah[0] << (32 - (34 - 32)))) ^
        ((al[0] >>> (39 - 32)) | (ah[0] << (32 - (39 - 32))))
      l = ((al[0] >>> 28) | (ah[0] << (32 - 28))) ^
        ((ah[0] >>> (34 - 32)) | (al[0] << (32 - (34 - 32)))) ^
        ((ah[0] >>> (39 - 32)) | (al[0] << (32 - (39 - 32))))

      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16

      // Maj
      h = (ah[0] & ah[1]) ^ (ah[0] & ah[2]) ^ (ah[1] & ah[2])
      l = (al[0] & al[1]) ^ (al[0] & al[2]) ^ (al[1] & al[2])

      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16

      b += a >>> 16
      c += b >>> 16
      d += c >>> 16

      bh[7] = (c & 0xffff) | (d << 16)
      bl[7] = (a & 0xffff) | (b << 16)

      // add
      h = bh[3]
      l = bl[3]

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

      bh[3] = (c & 0xffff) | (d << 16)
      bl[3] = (a & 0xffff) | (b << 16)

      ah[1] = bh[0]
      ah[2] = bh[1]
      ah[3] = bh[2]
      ah[4] = bh[3]
      ah[5] = bh[4]
      ah[6] = bh[5]
      ah[7] = bh[6]
      ah[0] = bh[7]

      al[1] = bl[0]
      al[2] = bl[1]
      al[3] = bl[2]
      al[4] = bl[3]
      al[5] = bl[4]
      al[6] = bl[5]
      al[7] = bl[6]
      al[0] = bl[7]

      if (i % 16 === 15) {
        for (let j = 0; j < 16; j++) {
          // add
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

          // sigma0
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

          // sigma1
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

    // add
    for (let i = 0; i < 8; i++) {
      h = ah[i]
      l = al[i]

      a = l & 0xffff
      b = l >>> 16
      c = h & 0xffff
      d = h >>> 16

      h = hh[i]
      l = hl[i]

      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16

      b += a >>> 16
      c += b >>> 16
      d += c >>> 16

      hh[i] = ah[i] = (c & 0xffff) | (d << 16)
      hl[i] = al[i] = (a & 0xffff) | (b << 16)
    }

    pos += 128
    n -= 128
  }

  return n
}

/**
 * @param {Uint8Array} x
 * @param {number} i
 * @param {number} h
 * @param {number} l
 * @private
 * @internal
 */
function ts64 (x: Uint8Array, i: number, h: number, l: number): void {
  x[i] = (h >> 24) & 0xff
  x[i + 1] = (h >> 16) & 0xff
  x[i + 2] = (h >> 8) & 0xff
  x[i + 3] = h & 0xff
  x[i + 4] = (l >> 24) & 0xff
  x[i + 5] = (l >> 16) & 0xff
  x[i + 6] = (l >> 8) & 0xff
  x[i + 7] = l & 0xff
}

export { cryptoHash }
