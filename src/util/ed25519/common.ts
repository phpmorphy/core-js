const gf0: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const gf1: number[] = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const D2: number[] = [
  0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0,
  0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406]

const X: number[] = [
  0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c,
  0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169]

const Y: number[] = [
  0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666,
  0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666]

const L: number[] = [
  0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2,
  0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10]

/**
 * @param {number[]} r
 * @private
 * @internal
 */
function reduce (r: number[]): void {
  const x: number[] = []

  for (let i = 0; i < 64; i++) {
    x[i] = r[i]
    r[i] = 0
  }

  modL(r, x)
}

/**
 * @param {number[]} r
 * @param {number[]} x
 * @private
 * @internal
 */
function modL (r: number[], x: number[]): number[] {
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

  return modLSub(r, x)
}

function modLSub (r: number[], x: number[]): number[] {
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

  return r
}

/**
 * @param {number[][]} p
 * @param {number[][]} q
 * @param {number[]} s
 * @private
 * @internal
 */
function scalarmult (p: number[][], q: number[][], s: number[]): void {
  set25519(p[0], gf0)
  set25519(p[1], gf1)
  set25519(p[2], gf1)
  set25519(p[3], gf0)

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
 * @internal
 */
function cswap (p: number[][], q: number[][], b: number): void {
  for (let i = 0; i < 4; i++) {
    sel25519(p[i], q[i], b)
  }
}

/**
 * @param {number[][]} p
 * @param {number[][]} q
 * @private
 * @internal
 */
function add (p: number[][], q: number[][]): void {
  const a: number[] = []
  const b: number[] = []
  const c: number[] = []
  const d: number[] = []
  const e: number[] = []
  const f: number[] = []
  const g: number[] = []
  const h: number[] = []
  const t: number[] = []

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
 * @internal
 */
function fnA (o: number[], a: number[], b: number[]): void {
  for (let i = 0; i < 16; i++) {
    o[i] = a[i] + b[i]
  }
}

/**
 * @param {number[]} o
 * @param {number[]} a
 * @param {number[]} b
 * @private
 * @internal
 */
function fnM (o: number[], a: number[], b: number[]): void {
  const t = []

  for (let i = 0; i < 31; i++) {
    t[i] = 0
  }

  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      t[i + j] += a[i] * b[j]
    }
  }

  fnMSub(o, t)
}

function fnMSub (o: number[], t: number[]): void {
  for (let i = 0; i < 15; i++) {
    t[i] += 38 * t[i + 16]
  }

  for (let i = 0; i < 16; i++) {
    o[i] = t[i]
  }

  car25519(o)
  car25519(o)
}

/**
 * @param {number[]} o
 * @param {number[]} a
 * @param {number[]} b
 * @private
 * @internal
 */
function fnZ (o: number[], a: number[], b: number[]): void {
  for (let i = 0; i < 16; i++) {
    o[i] = a[i] - b[i]
  }
}

/**
 * @param {number[]} r
 * @param {number[]} a
 * @private
 * @internal
 */
function set25519 (r: number[], a: number[]): void {
  for (let i = 0; i < 16; i++) {
    r[i] = a[i]
  }
}

/**
 * @param {number[][]} p
 * @param {number[]} s
 * @private
 * @internal
 */
function scalarbase (p: number[][], s: number[]): void {
  const q = [[], [], [], []]
  set25519(q[0], X)
  set25519(q[1], Y)
  set25519(q[2], gf1)
  fnM(q[3], X, Y)
  scalarmult(p, q, s)
}

/**
 * @param {number[]} o
 * @private
 * @internal
 */
function car25519 (o: number[]): void {
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
 * @param {number[]} r
 * @param {number[][]} p
 * @private
 * @internal
 */
function pack (r: number[], p: number[][]): void {
  const tx: number[] = []
  const ty: number[] = []
  const zi: number[] = []
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
 * @internal
 */
function par25519 (a: number[]): number {
  const d: number[] = []
  pack25519(d, a)
  return d[0] & 1
}

/**
 * @param {number[]} o
 * @param {number[]} a
 * @private
 * @internal
 */
function fnS (o: number[], a: number[]): void {
  fnM(o, a, a)
}

/**
 * @param {number[]} o
 * @param {number[]} i
 * @private
 * @internal
 */
function inv25519 (o: number[], i: number[]): void {
  const c: number[] = []
  for (let a = 0; a < 16; a++) {
    c[a] = i[a]
  }

  for (let a = 253; a >= 0; a--) {
    fnM(c, c, c)
    if (a !== 2 && a !== 4) {
      fnM(c, c, i)
    }
  }

  for (let a = 0; a < 16; a++) {
    o[a] = c[a]
  }
}

/**
 * @param {number[]} p
 * @param {number[]} q
 * @param {number} b
 * @private
 * @internal
 */
function sel25519 (p: number[], q: number[], b: number): void {
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
 * @internal
 */
function pack25519 (o: number[], n: number[]): void {
  const m: number[] = []
  const t = n.slice(0)

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
    const b = (m[15] >> 16) & 1
    m[14] &= 0xffff
    sel25519(t, m, 1 - b)
  }

  for (let i = 0; i < 16; i++) {
    o[2 * i] = t[i] & 0xff
    o[2 * i + 1] = t[i] >> 8
  }
}

export { gf0, gf1, fnA, fnS, fnM, fnZ, modL, reduce, par25519, scalarmult, scalarbase, car25519, add, set25519, pack, pack25519 }
