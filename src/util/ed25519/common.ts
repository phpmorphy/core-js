const gf0 = new Float64Array(16)

const gf1 = new Float64Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

const D2 = new Float64Array([
  0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0,
  0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406])

const X = new Float64Array([
  0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c,
  0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169])

const Y = new Float64Array([
  0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666,
  0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666])

const L = new Float64Array([
  0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2,
  0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10])

/**
 * @param {Uint8Array} r
 * @private
 * @internal
 */
function reduce (r: Uint8Array): void {
  const x = new Float64Array(64)
  x.set(r)
  r.set(new Float64Array(64))
  modL(r, x)
}

/**
 * @param {Uint8Array} r
 * @param {Float64Array} x
 * @private
 * @internal
 */
function modL (r: Uint8Array, x: Float64Array): void {
  let carry: number
  let j: number
  let k: number
  for (let i = 63; i >= 32; --i) {
    carry = 0
    for (j = i - 32, k = i - 12; j < k; ++j) {
      x[j] += carry - 16 * x[i] * L[j - (i - 32)]
      carry = Math.floor((x[j] + 128) / 256) // carry = (x[j] + 128) >> 8;
      x[j] -= carry * 256 // x[j] -= carry << 8;
    }
    x[j] += carry
    x[i] = 0
  }
  modLSub(r, x)
}

function modLSub (r: Uint8Array, x: Float64Array) {
  let carry = 0
  for (let j = 0; j < 32; j++) {
    x[j] += carry - (x[31] >> 4) * L[j]
    carry = x[j] >> 8
    x[j] &= 255
  }
  for (let j = 0; j < 32; j++) {
    x[j] -= carry * L[j]
  }
  for (let i = 0; i < 32; i++) {
    x[i + 1] += x[i] >> 8
    r[i] = x[i] & 255
  }
}

/**
 * @param {Float64Array[]} p
 * @param {Float64Array[]} q
 * @param {Uint8Array} s
 * @private
 * @internal
 */
function scalarmult (
  p: Float64Array[], q: Float64Array[], s: Uint8Array
): void {
  let b: number

  set25519(p[0], gf0)
  set25519(p[1], gf1)
  set25519(p[2], gf1)
  set25519(p[3], gf0)

  for (let i = 255; i >= 0; --i) {
    b = (s[(i / 8) | 0] >> (i & 7)) & 1
    cswap(p, q, b)
    add(q, p)
    add(p, p)
    cswap(p, q, b)
  }
}

/**
 * @param {Float64Array[]} p
 * @param {Float64Array[]} q
 * @param {number} b
 * @private
 * @internal
 */
function cswap (p: Float64Array[], q: Float64Array[], b: number): void {
  for (let i = 0; i < 4; i++) {
    sel25519(p[i], q[i], b)
  }
}

/**
 * @param {Float64Array[]} p
 * @param {Float64Array[]} q
 * @private
 * @internal
 */
function add (p: Float64Array[], q: Float64Array[]): void {
  const a = new Float64Array(16)
  const b = new Float64Array(16)
  const c = new Float64Array(16)
  const d = new Float64Array(16)
  const e = new Float64Array(16)
  const f = new Float64Array(16)
  const g = new Float64Array(16)
  const h = new Float64Array(16)
  const t = new Float64Array(16)

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
 * @param {Float64Array} o
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @private
 * @internal
 */
function fnA (o: Float64Array, a: Float64Array, b: Float64Array): void {
  for (let i = 0; i < 16; i++) {
    o[i] = a[i] + b[i]
  }
}

/**
 * @param {Float64Array} o
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @private
 * @internal
 */
function fnM (o: Float64Array, a: Float64Array, b: Float64Array): void {
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
  car25519(o)
  car25519(o)
}

/**
 * @param {Float64Array} o
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @private
 * @internal
 */
function fnZ (o: Float64Array, a: Float64Array, b: Float64Array): void {
  for (let i = 0; i < 16; i++) {
    o[i] = a[i] - b[i]
  }
}

/**
 * @param {Float64Array} r
 * @param {Float64Array} a
 * @private
 * @internal
 */
function set25519 (r: Float64Array, a: Float64Array): void {
  r.set(a)
}

/**
 * @param {Float64Array[]} p
 * @param {Uint8Array} s
 * @private
 * @internal
 */
function scalarbase (p: Float64Array[], s: Uint8Array): void {
  const q = [
    new Float64Array(16), new Float64Array(16),
    new Float64Array(16), new Float64Array(16)]

  set25519(q[0], X)
  set25519(q[1], Y)
  set25519(q[2], gf1)
  fnM(q[3], X, Y)
  scalarmult(p, q, s)
}

/**
 * @param {Float64Array} o
 * @private
 * @internal
 */
function car25519 (o: Float64Array): void {
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
 * @param {Uint8Array} r
 * @param {Float64Array[]} p
 * @private
 * @internal
 */
function pack (r: Uint8Array, p: Float64Array[]): void {
  const tx = new Float64Array(16)
  const ty = new Float64Array(16)
  const zi = new Float64Array(16)
  inv25519(zi, p[2])
  fnM(tx, p[0], zi)
  fnM(ty, p[1], zi)
  pack25519(r, ty)
  r[31] ^= par25519(tx) << 7
}

/**
 * @param {Float64Array} a
 * @private
 * @internal
 */
function par25519 (a: Float64Array): number {
  const d = new Uint8Array(32)
  pack25519(d, a)

  return d[0] & 1
}

/**
 * @param {Float64Array} o
 * @param {Float64Array} a
 * @private
 * @internal
 */
function fnS (o: Float64Array, a: Float64Array): void {
  fnM(o, a, a)
}

/**
 * @param {Float64Array} o
 * @param {Float64Array} i
 * @private
 * @internal
 */
function inv25519 (o: Float64Array, i: Float64Array): void {
  const c = new Float64Array(16)
  c.set(i)
  for (let a = 253; a >= 0; a--) {
    fnS(c, c)
    if (a !== 2 && a !== 4) {
      fnM(c, c, i)
    }
  }
  o.set(c)
}

/**
 * @param {Float64Array} p
 * @param {Float64Array} q
 * @param {number} b
 * @private
 * @internal
 */
function sel25519 (p: Float64Array, q: Float64Array, b: number): void {
  let t: number
  const c = ~(b - 1)
  for (let i = 0; i < 16; i++) {
    t = c & (p[i] ^ q[i])
    p[i] ^= t
    q[i] ^= t
  }
}

/**
 * @param {Uint8Array} o
 * @param {Float64Array} n
 * @private
 * @internal
 */
function pack25519 (o: Uint8Array, n: Float64Array): void {
  let b: number
  const m = new Float64Array(16)
  const t = new Float64Array(16)
  t.set(n)
  car25519(t)
  car25519(t)
  car25519(t)
  for (let j = 0; j < 2; j++) {
    m[0] = t[0] - 0xffed
    for (let i = 1; i < 15; i++) {
      m[i] = t[i] - 0xffff - ((m[i - 1] >> 16) & 1)
      m[i - 1] &= 0xffff
    }
    m[15] = t[15] - 0x7fff - ((m[14] >> 16) & 1)
    b = (m[15] >> 16) & 1
    m[14] &= 0xffff
    sel25519(t, m, 1 - b)
  }
  for (let i = 0; i < 16; i++) {
    o[2 * i] = t[i] & 0xff
    o[2 * i + 1] = t[i] >> 8
  }
}

export { gf0, gf1, fnA, fnS, fnM, fnZ, modL, reduce, par25519, scalarmult, scalarbase, car25519, add, set25519, pack, pack25519 }
